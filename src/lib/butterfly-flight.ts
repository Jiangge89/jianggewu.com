// Flight paths for the hidden butterfly.
//
// Two modes share the same flight builder:
//
// - Passing flight (every page but /butterfly/): one crossing from low on
//   the left to high on the right, every few minutes.
// - Resident (on /butterfly/): the butterfly lives on the page. It wanders
//   from spot to spot, sometimes pauses in the air, and now and then
//   slips off the nearest edge, returning a few seconds later close to
//   where it left.
//
// Every leg picks one of several shapes (never the same twice in a row)
// with random size, then layers a butterfly's wander on top: slow drifts,
// a small bob per wingbeat, and moments where it lingers.

type Point = [number, number];
type Linger = { at: number; width: number; depth: number };
type ShapePath = { offset: (t: number) => Point; linger?: Linger };
type Shape = 'arc' | 'sCurve' | 'wave' | 'loop' | 'hover';
type Flight = { frames: Keyframe[]; duration: number; endHeading: number };

const SHAPES: Shape[] = ['arc', 'sCurve', 'wave', 'loop', 'hover'];
const PASSING_SPEED = 85; // px per second while cruising
const RESIDENT_SPEED = 70;
const OFFSCREEN = 40;
const OPACITY = 0.75;
const MAX_TURN_DEG_PER_S = 420;
const TAU = Math.PI * 2;

const between = (min: number, max: number) => min + Math.random() * (max - min);
const sign = () => (Math.random() < 0.5 ? -1 : 1);
// Smoothstep: eases a 0..1 progress in and out, so motion that starts or
// stops part-way along a leg does so without a jolt.
const ease = (u: number) => u * u * (3 - 2 * u);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastShape: Shape | null = null;
let current: Animation | null = null;
let generation = 0;

function pickShape(): Shape {
  const options = SHAPES.filter((s) => s !== lastShape);
  lastShape = options[Math.floor(Math.random() * options.length)];
  return lastShape;
}

// Offset from the straight line at progress t, as [along, across] in px.
// Every offset is zero at both ends and continuous in between.
function shapePath(shape: Shape, len: number): ShapePath {
  const side = sign();
  switch (shape) {
    case 'arc': {
      const a = side * len * between(0.12, 0.25);
      const skew = between(-0.15, 0.15);
      return { offset: (t) => [0, a * Math.sin(Math.PI * Math.min(1, Math.max(0, t + skew * Math.sin(Math.PI * t))))] };
    }
    case 'sCurve': {
      const a = side * len * between(0.08, 0.16);
      return { offset: (t) => [0, a * Math.sin(TAU * t)] };
    }
    case 'wave': {
      const a = side * len * between(0.04, 0.07);
      const k = Math.random() < 0.5 ? 3 : 4;
      return { offset: (t) => [0, a * Math.sin(Math.PI * k * t) * Math.sin(Math.PI * t)] };
    }
    case 'loop': {
      // A gentle arc with one full loop part-way along. The loop eases in
      // and out, and its backward stretch falls in the middle, so it joins
      // the rest of the path without a sudden turn.
      const a = side * len * between(0.06, 0.12);
      const at = between(0.35, 0.6);
      const w = Math.min(0.25, 0.12 * Math.max(1, 900 / len));
      const r = Math.max(between(30, 46), (1.5 * len * w) / (3 * Math.PI) + 10);
      return {
        offset: (t) => {
          let along = 0;
          let across = a * Math.sin(Math.PI * t);
          if (t > at && t < at + w) {
            const th = TAU * ease((t - at) / w);
            along += r * Math.sin(th);
            across += side * r * (1 - Math.cos(th));
          }
          return [along, across];
        },
      };
    }
    case 'hover': {
      // Drifts up to a spot, slows right down and traces a small
      // figure-eight there, then moves on.
      const a = side * len * between(0.05, 0.1);
      const at = between(0.35, 0.6);
      const w = Math.min(0.2, 0.07 * Math.max(1, 900 / len));
      const r = between(20, 28);
      // Cap the forward-back sway so it never reverses outright, which
      // would flip the body round in an instant.
      const rAlong = Math.min(r, (0.7 * len * w) / (1.5 * TAU));
      return {
        offset: (t) => {
          let along = 0;
          let across = a * Math.sin(Math.PI * t);
          if (t > at && t < at + w) {
            const th = TAU * ease((t - at) / w);
            along += rAlong * Math.sin(th);
            across += side * r * Math.sin(th) * Math.cos(th);
          }
          return [along, across];
        },
        linger: { at: at + w / 2, width: w * 0.6, depth: 0.5 },
      };
    }
  }
}

function blendAngle(from: number, to: number, k: number) {
  const diff = ((((to - from) % 360) + 540) % 360) - 180;
  return from + diff * k;
}

// Builds keyframes for one leg from `start` to `end`. When `prevHeading`
// is given, the body turns smoothly from it instead of snapping.
function buildFlight(
  el: HTMLElement,
  [sx, sy]: Point,
  [ex, ey]: Point,
  opts: { speed: number; prevHeading?: number; fade: boolean; lingerChance: number },
): Flight {
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const shape = shapePath(pickShape(), len);
  // Wander shrinks on short legs so it never outweighs the leg itself.
  const scale = Math.min(1, len / 500);
  const drift = { a: between(18, 32) * scale, l: between(380, 560), p: Math.random() * TAU };
  const sway = { a: between(8, 14) * scale, l: between(140, 210), p: Math.random() * TAU };
  const bob = { a: between(4, 7) * Math.min(1, len / 250), l: between(55, 75), p: Math.random() * TAU };
  const lingers: Linger[] = [];
  for (let i = 0; i < 3; i++) {
    if (Math.random() < opts.lingerChance) lingers.push({ at: between(0.15, 0.85), width: 0.045, depth: 0.6 });
  }
  if (shape.linger) lingers.push(shape.linger);

  // Wander is measured along the straight line so its rhythm stays even.
  const position = (t: number, withBob: boolean): Point => {
    const s = t * len;
    const envelope = Math.sin(Math.PI * t);
    let across =
      drift.a * Math.sin((TAU * s) / drift.l + drift.p) +
      sway.a * Math.sin((TAU * s) / sway.l + sway.p);
    if (withBob) across += bob.a * Math.sin((TAU * s) / bob.l + bob.p);
    across *= envelope;
    const [sa, sc] = shape.offset(t);
    const along = s + sa;
    const side = across + sc;
    return [sx + ux * along + nx * side, sy + uy * along + ny * side];
  };

  // Dense enough that loops and turns on short legs stay smooth.
  const samples = Math.max(180, Math.min(400, Math.round(len / 3)));
  const turnSamples = Math.round(samples * 0.12);
  const half = (el.offsetWidth || 30) / 2;
  const points: Point[] = [];
  const headings: number[] = [];
  const times: number[] = [];
  let elapsed = 0;
  let prev = position(0, true);

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const [x, y] = position(t, true);
    const [ax, ay] = position(Math.max(0, t - 0.006), false);
    const [bx, by] = position(Math.min(1, t + 0.006), false);
    let heading = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI + 90 + 8 * Math.sin(TAU * 0.011 * t * len);
    if (opts.prevHeading !== undefined && i < turnSamples) {
      heading = blendAngle(opts.prevHeading, heading, i / turnSamples);
    }
    headings.push(heading);

    if (i > 0) {
      const step = Math.hypot(x - prev[0], y - prev[1]);
      const slow = lingers.reduce((m, l) => Math.max(m, l.depth * Math.exp(-(((t - l.at) / l.width) ** 2))), 0);
      // While turning in place at the start of a leg, move a little slower.
      const easeIn = opts.prevHeading !== undefined && i < turnSamples ? 0.6 + 0.4 * (i / turnSamples) : 1;
      elapsed += (step / (opts.speed * (1 - slow) * easeIn)) * 1000;
    }
    prev = [x, y];
    points.push([x, y]);
    times.push(elapsed);
  }

  // The body follows the path's direction but can only turn so fast, like
  // a real butterfly; where the path doubles back sharply it swings round
  // over a moment instead of flipping. Angles are kept continuous (269° to
  // -89° would otherwise make the interpolation spin it all the way round).
  let heading = opts.prevHeading ?? headings[0];
  const duration = Math.max(elapsed, 1);
  const frames: Keyframe[] = points.map(([x, y], i) => {
    const target = headings[i];
    if (i === 0 && opts.prevHeading === undefined) {
      heading = target;
    } else {
      const dt = i === 0 ? 0 : (times[i] - times[i - 1]) / 1000;
      const diff = ((((target - heading) % 360) + 540) % 360) - 180;
      const limit = MAX_TURN_DEG_PER_S * dt;
      heading += Math.max(-limit, Math.min(limit, diff));
    }
    const t = times[i] / duration;
    return {
      offset: t,
      opacity: opts.fade ? OPACITY * Math.min(1, t / 0.03, (1 - t) / 0.03) : OPACITY,
      transform: `translate(${(x - half).toFixed(1)}px, ${(y - half).toFixed(1)}px) rotate(${heading.toFixed(1)}deg)`,
    };
  });

  return { frames, duration, endHeading: heading };
}

function play(el: HTMLElement, flight: Flight): Promise<boolean> {
  current?.cancel();
  current = el.animate(flight.frames, { duration: flight.duration, easing: 'linear', fill: 'forwards' });
  return current.finished.then(
    () => true,
    () => false,
  );
}

export function stopButterfly() {
  generation++;
  current?.cancel();
  current = null;
}

// ---------------------------------------------------------------------------
// Passing flight

function crossing(vw: number, vh: number): [Point, Point] {
  const start: Point =
    Math.random() < 0.65
      ? [-OFFSCREEN, vh * between(0.55, 0.95)]
      : [vw * between(0.05, 0.45), vh + OFFSCREEN];
  const end: Point =
    Math.random() < 0.5
      ? [vw + OFFSCREEN, vh * between(0.08, 0.45)]
      : [vw * between(0.6, 0.95), -OFFSCREEN];
  return [start, end];
}

// Starts one crossing and returns its duration in ms.
export function flyButterfly(el: HTMLElement): number {
  stopButterfly();
  const [start, end] = crossing(window.innerWidth, window.innerHeight);
  const flight = buildFlight(el, start, end, { speed: PASSING_SPEED, fade: true, lingerChance: 0.6 });
  void play(el, flight);
  return flight.duration;
}

// ---------------------------------------------------------------------------
// Resident

type Edge = 'left' | 'right' | 'top' | 'bottom';

function bounds() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const header = document.querySelector('body > header')?.getBoundingClientRect();
  const margin = Math.min(48, vw * 0.08);
  return {
    vw,
    vh,
    left: margin,
    right: vw - margin,
    top: Math.max(margin, (header?.bottom ?? 0) + 24),
    bottom: vh - margin,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Somewhere inside the screen, mostly ahead of where it's facing.
function pickInside(from: Point, heading: number | undefined): Point {
  const b = bounds();
  const reach = Math.min(b.right - b.left, b.bottom - b.top);
  for (let tries = 0; tries < 12; tries++) {
    const facing = heading === undefined ? Math.random() * 360 : heading - 90 + between(-80, 80);
    const angle = (facing * Math.PI) / 180;
    const d = between(Math.min(160, reach * 0.35), Math.min(440, reach * 0.9));
    const x = from[0] + Math.cos(angle) * d;
    const y = from[1] + Math.sin(angle) * d;
    if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) return [x, y];
  }
  // Nothing ahead fits (e.g. facing a nearby edge): take a spot elsewhere
  // on screen at a comfortable distance.
  let best: Point = [between(b.left, b.right), between(b.top, b.bottom)];
  let bestScore = Infinity;
  for (let tries = 0; tries < 20; tries++) {
    const p: Point = [between(b.left, b.right), between(b.top, b.bottom)];
    const score = Math.abs(Math.hypot(p[0] - from[0], p[1] - from[1]) - Math.min(300, reach * 0.6));
    if (score < bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best;
}

// The closest way off-screen from here.
function nearestExit([x, y]: Point): { point: Point; edge: Edge } {
  const b = bounds();
  const options: [number, Edge][] = [
    [x, 'left'],
    [b.vw - x, 'right'],
    [y, 'top'],
    [b.vh - y, 'bottom'],
  ];
  options.sort((p, q) => p[0] - q[0]);
  const edge = options[0][1];
  const jitter = between(-60, 60);
  const point: Point =
    edge === 'left'
      ? [-OFFSCREEN, clamp(y + jitter, 0, b.vh)]
      : edge === 'right'
        ? [b.vw + OFFSCREEN, clamp(y + jitter, 0, b.vh)]
        : edge === 'top'
          ? [clamp(x + jitter, 0, b.vw), -OFFSCREEN]
          : [clamp(x + jitter, 0, b.vw), b.vh + OFFSCREEN];
  return { point, edge };
}

// Back in near where it left, a little along the same edge.
function reentry(exit: Point, edge: Edge): Point {
  const b = bounds();
  const shift = between(30, 120) * sign();
  return edge === 'left' || edge === 'right'
    ? [exit[0], clamp(exit[1] + shift, b.top, b.bottom)]
    : [clamp(exit[0] + shift, b.left, b.right), exit[1]];
}

function randomEntry(): { point: Point; edge: Edge } {
  const b = bounds();
  const edges: Edge[] = ['left', 'right', 'bottom'];
  const edge = edges[Math.floor(Math.random() * edges.length)];
  const point: Point =
    edge === 'left'
      ? [-OFFSCREEN, between(b.top, b.bottom)]
      : edge === 'right'
        ? [b.vw + OFFSCREEN, between(b.top, b.bottom)]
        : [between(b.left, b.right), b.vh + OFFSCREEN];
  return { point, edge };
}

// Keeps the butterfly on the page until stopButterfly() is called.
export async function residentButterfly(el: HTMLElement) {
  stopButterfly();
  const gen = generation;
  const alive = () => gen === generation && el.isConnected;

  let pos = randomEntry().point;
  let inside = false;
  let heading: number | undefined;

  while (alive()) {
    if (document.hidden) {
      await wait(1000);
      continue;
    }

    let target: Point;
    let exit: { point: Point; edge: Edge } | null = null;
    if (!inside) {
      target = pickInside(pos, undefined);
    } else if (Math.random() < 0.15) {
      exit = nearestExit(pos);
      target = exit.point;
    } else {
      target = pickInside(pos, heading);
    }

    const flight = buildFlight(el, pos, target, {
      speed: RESIDENT_SPEED,
      prevHeading: inside ? heading : undefined,
      fade: false,
      lingerChance: 0.25,
    });
    const finished = await play(el, flight);
    if (!finished || !alive()) return;

    pos = target;
    heading = flight.endHeading;

    if (exit) {
      // Out of sight for a moment, then back close to where it left.
      inside = false;
      await wait(between(1_500, 4_000));
      pos = reentry(exit.point, exit.edge);
    } else {
      inside = true;
      // Sometimes it pauses in the air for a breath before moving on.
      if (Math.random() < 0.3) await wait(between(600, 1_800));
    }
  }
}
