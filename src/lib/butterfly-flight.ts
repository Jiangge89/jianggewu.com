// Flight planner for the hidden butterfly.
//
// Each flight goes from the bottom-left of the viewport to the top-right,
// threading through the blank space between page content. The viewport is
// rasterised into a coarse grid, content is marked as blocked, and a
// Dijkstra search finds a route that prefers wide open gaps. The route is
// smoothed, then given a butterfly's wander: slow drifts, a small bob per
// wingbeat and moments where it lingers. The wander never pushes it closer
// to content than the gap allows.

type Rect = { left: number; top: number; right: number; bottom: number };
type Point = [number, number];

const CELL = 16; // grid resolution in px
const PAD = 14; // minimum distance kept from content
const SPEED = 85; // px per second while cruising
const OFFSCREEN = 40;

const REPLACED = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'IFRAME']);

const between = (min: number, max: number) => min + Math.random() * (max - min);

function isTransparent(color: string) {
  return color === 'transparent' || /(\/\s*0\)|,\s*0\))$/.test(color);
}

function hasOwnText(el: Element) {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
  }
  return false;
}

// Everything a visitor would read or look at. Full-width backgrounds
// (section bands, header and footer bars) count as sky, not obstacles,
// but the sticky header itself is blocked so flights never hide under it.
function collectObstacles(vw: number, vh: number): { rects: Rect[]; topLimit: number } {
  const rects: Rect[] = [];
  let topLimit = 0;

  const header = document.querySelector('body > header');
  if (header) {
    const r = header.getBoundingClientRect();
    if (r.bottom > 0 && r.top <= 0) topLimit = r.bottom;
  }

  for (const el of document.querySelectorAll('main *, footer *')) {
    if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;

    let obstacle = el instanceof SVGSVGElement || REPLACED.has(el.tagName) || hasOwnText(el);
    if (!obstacle && r.width < vw * 0.9) {
      const style = getComputedStyle(el);
      obstacle =
        !isTransparent(style.backgroundColor) ||
        (parseFloat(style.borderTopWidth) > 0 && !isTransparent(style.borderTopColor)) ||
        (parseFloat(style.borderLeftWidth) > 0 && !isTransparent(style.borderLeftColor));
    }
    if (!obstacle) continue;

    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.opacity === '0') continue;
    rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
  }

  return { rects, topLimit };
}

// Minimal binary heap keyed by cost, for Dijkstra.
class Heap {
  private items: [number, number][] = [];
  get size() {
    return this.items.length;
  }
  push(cost: number, value: number) {
    const a = this.items;
    a.push([cost, value]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop(): [number, number] {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

type Plan = { points: Point[]; clearance: number[] };

function planPath(vw: number, vh: number): Plan | null {
  const { rects, topLimit } = collectObstacles(vw, vh);
  const cols = Math.ceil(vw / CELL);
  const rows = Math.ceil(vh / CELL);
  const n = cols * rows;
  const blocked = new Uint8Array(n);

  const mark = (left: number, top: number, right: number, bottom: number) => {
    const c0 = Math.max(0, Math.floor(left / CELL));
    const c1 = Math.min(cols - 1, Math.floor(right / CELL));
    const r0 = Math.max(0, Math.floor(top / CELL));
    const r1 = Math.min(rows - 1, Math.floor(bottom / CELL));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) blocked[r * cols + c] = 1;
  };
  for (const o of rects) mark(o.left - PAD, o.top - PAD, o.right + PAD, o.bottom + PAD);
  if (topLimit > 0) mark(0, 0, vw, topLimit + PAD / 2);

  // Chamfer distance transform: px distance from each cell to content.
  const D = CELL;
  const DD = CELL * Math.SQRT2;
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) dist[i] = blocked[i] ? 0 : 1e6;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (!dist[i]) continue;
      let d = dist[i];
      if (c > 0) d = Math.min(d, dist[i - 1] + D);
      if (r > 0) {
        d = Math.min(d, dist[i - cols] + D);
        if (c > 0) d = Math.min(d, dist[i - cols - 1] + DD);
        if (c < cols - 1) d = Math.min(d, dist[i - cols + 1] + DD);
      }
      dist[i] = d;
    }
  }
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const i = r * cols + c;
      if (!dist[i]) continue;
      let d = dist[i];
      if (c < cols - 1) d = Math.min(d, dist[i + 1] + D);
      if (r < rows - 1) {
        d = Math.min(d, dist[i + cols] + D);
        if (c < cols - 1) d = Math.min(d, dist[i + cols + 1] + DD);
        if (c > 0) d = Math.min(d, dist[i + cols - 1] + DD);
      }
      dist[i] = d;
    }
  }

  // Entry: left edge low down, or bottom edge on the left.
  // Exit: just below the header on the right, or right edge up high.
  const topRow = Math.min(rows - 1, Math.ceil((topLimit + PAD) / CELL));
  const minEntryClearance = CELL * 1.5;
  const starts: number[] = [];
  const goal = new Uint8Array(n);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (blocked[i]) continue;
      const entry = (c === 0 && r >= rows * 0.55) || (r === rows - 1 && c <= cols * 0.45);
      if (entry && dist[i] >= minEntryClearance) starts.push(i);
      if ((r === topRow && c >= cols * 0.7) || (c === cols - 1 && r >= topRow && r <= rows * 0.4)) goal[i] = 1;
    }
  }
  if (!starts.length) return null;

  const start = starts[Math.floor(Math.random() * starts.length)];
  const cost = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const heap = new Heap();
  cost[start] = 0;
  heap.push(0, start);
  let reached = -1;

  // Moving next to content costs more, so routes keep to the middle of gaps.
  const stepCost = (i: number, len: number) => len * (1 + (4 * CELL) / (dist[i] + CELL));

  while (heap.size) {
    const [k, i] = heap.pop();
    if (k > cost[i]) continue;
    if (goal[i]) {
      reached = i;
      break;
    }
    const r = Math.floor(i / cols);
    const c = i - r * cols;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const j = nr * cols + nc;
        if (blocked[j]) continue;
        const next = k + stepCost(j, dr && dc ? Math.SQRT2 : 1);
        if (next < cost[j]) {
          cost[j] = next;
          prev[j] = i;
          heap.push(next, j);
        }
      }
    }
  }
  if (reached < 0) return null;

  const cells: number[] = [];
  for (let i = reached; i >= 0; i = prev[i]) cells.push(i);
  cells.reverse();

  const center = (i: number): Point => {
    const r = Math.floor(i / cols);
    return [(i - r * cols + 0.5) * CELL, (r + 0.5) * CELL];
  };
  let pts = cells.map(center);

  // Leave and arrive from beyond the edge of the screen.
  const [sx, sy] = pts[0];
  pts.unshift(sx <= CELL ? [-OFFSCREEN, sy] : [sx, vh + OFFSCREEN]);
  const [gx, gy] = pts[pts.length - 1];
  pts.push(gx >= vw - CELL ? [vw + OFFSCREEN, gy] : [gx, -OFFSCREEN]);

  // Soften the grid staircase into curves. The window shrinks near the
  // ends so the off-screen entry and exit points don't drag the route
  // sideways (e.g. up into the header before it reaches the exit).
  for (let pass = 0; pass < 4; pass++) {
    const out: Point[] = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const reach = Math.min(3, i, pts.length - 1 - i);
      let x = 0;
      let y = 0;
      for (let k = -reach; k <= reach; k++) {
        x += pts[i + k][0];
        y += pts[i + k][1];
      }
      const w = reach * 2 + 1;
      out.push([x / w, y / w]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }

  // Resample at even spacing so timing and wander follow arc length.
  const STEP = 8;
  const even: Point[] = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    let t = STEP - carry;
    while (t <= seg) {
      even.push([ax + ((bx - ax) * t) / seg, ay + ((by - ay) * t) / seg]);
      t += STEP;
    }
    carry = seg - (t - STEP);
  }
  even.push(pts[pts.length - 1]);

  const clearance = even.map(([x, y]) => {
    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return 200;
    return dist[r * cols + c];
  });

  return { points: even, clearance };
}

let current: { animation: Animation; cleanup: () => void } | null = null;

export function stopButterfly() {
  if (!current) return;
  current.animation.cancel();
  current.cleanup();
  current = null;
}

// Plans and starts one flight. Returns its duration in ms, or null when
// the page has no open route right now (e.g. a narrow phone screen).
export function flyButterfly(el: HTMLElement, scrollLayer: HTMLElement): number | null {
  stopButterfly();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const plan = planPath(vw, vh);
  if (!plan) return null;
  const { points, clearance } = plan;
  const count = points.length;
  const TAU = Math.PI * 2;

  // Wander perpendicular to the route, measured along its length.
  const drift = { a: between(30, 50), l: between(420, 620), p: Math.random() * TAU };
  const sway = { a: between(12, 20), l: between(150, 220), p: Math.random() * TAU };
  const bob = { a: between(4, 7), l: between(55, 75), p: Math.random() * TAU };
  // Points along the route where it slows down and lingers.
  const lingers = Array.from({ length: Math.random() < 0.5 ? 2 : 3 }, () => between(0.2, 0.8));

  const half = (el.offsetWidth || 30) / 2;
  const frames: Keyframe[] = [];
  const times: number[] = [];
  let elapsed = 0;

  for (let i = 0; i < count; i++) {
    const [ax, ay] = points[Math.max(0, i - 2)];
    const [bx, by] = points[Math.min(count - 1, i + 2)];
    const tl = Math.hypot(bx - ax, by - ay) || 1;
    const tx = (bx - ax) / tl;
    const ty = (by - ay) / tl;
    const s = i * 8;
    const t = i / (count - 1);

    let offset =
      drift.a * Math.sin((TAU * s) / drift.l + drift.p) +
      sway.a * Math.sin((TAU * s) / sway.l + sway.p) +
      bob.a * Math.sin((TAU * s) / bob.l + bob.p);
    const room = Math.max(0, clearance[i] - 16);
    offset = Math.max(-room, Math.min(room, offset));

    const x = points[i][0] - ty * offset;
    const y = points[i][1] + tx * offset;
    const heading = (Math.atan2(ty, tx) * 180) / Math.PI + 90 + 8 * Math.sin((TAU * s) / 90);

    if (i > 0) {
      const slow = lingers.reduce((m, at) => Math.max(m, Math.exp(-(((t - at) / 0.05) ** 2))), 0);
      elapsed += (8 / (SPEED * (1 - 0.6 * slow))) * 1000;
    }
    times.push(elapsed);
    frames.push({
      transform: `translate(${(x - half).toFixed(1)}px, ${(y - half).toFixed(1)}px) rotate(${heading.toFixed(1)}deg)`,
    });
  }

  const duration = Math.max(elapsed, 1);
  frames.forEach((frame, i) => {
    const t = times[i] / duration;
    frame.offset = t;
    frame.opacity = 0.75 * Math.min(1, t / 0.03, (1 - t) / 0.03);
  });

  // Content scrolls; the planned route was drawn around it, so the
  // butterfly scrolls with it instead of staying pinned to the screen.
  const scrollAtStart = window.scrollY;
  const onScroll = () => {
    scrollLayer.style.transform = `translateY(${scrollAtStart - window.scrollY}px)`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  const cleanup = () => {
    window.removeEventListener('scroll', onScroll);
    scrollLayer.style.transform = '';
  };

  const animation = el.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
  current = { animation, cleanup };
  animation.finished
    .then(() => {
      if (current?.animation === animation) {
        cleanup();
        current = null;
      }
    })
    .catch(() => {
      // Cancelled; stopButterfly already cleaned up.
    });

  return duration;
}
