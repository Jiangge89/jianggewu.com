// Flight paths for the hidden butterfly.
//
// Every flight enters low on the left (or the left part of the bottom
// edge) and leaves high on the right (or the right part of the top edge,
// slipping under the header). The route between is never the same twice:
// each flight picks one of several shapes, never the same as last time,
// with random size and placement, then layers a butterfly's wander on
// top: slow drifts, a small bob per wingbeat, and moments where it
// lingers before pushing on.

type Point = [number, number];
type Linger = { at: number; width: number; depth: number };
type ShapePath = { offset: (t: number) => Point; linger?: Linger };
type Shape = 'arc' | 'sCurve' | 'wave' | 'loop' | 'hover';

const SHAPES: Shape[] = ['arc', 'sCurve', 'wave', 'loop', 'hover'];
const SPEED = 85; // px per second while cruising
const OFFSCREEN = 40;
const SAMPLES = 260;
const TAU = Math.PI * 2;

const between = (min: number, max: number) => min + Math.random() * (max - min);
const sign = () => (Math.random() < 0.5 ? -1 : 1);

let lastShape: Shape | null = null;
let current: Animation | null = null;

function pickShape(): Shape {
  const options = SHAPES.filter((s) => s !== lastShape);
  lastShape = options[Math.floor(Math.random() * options.length)];
  return lastShape;
}

function endpoints(vw: number, vh: number): [Point, Point] {
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
      // A gentle arc with one full loop part-way along.
      const a = side * len * between(0.06, 0.12);
      const at = between(0.35, 0.65);
      const w = 0.12;
      const r = Math.max(between(34, 52), (len * w) / TAU + 12);
      return {
        offset: (t) => {
          let along = 0;
          let across = a * Math.sin(Math.PI * t);
          if (t > at && t < at + w) {
            const th = (TAU * (t - at)) / w;
            along -= r * Math.sin(th);
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
      const w = 0.07;
      const r = between(20, 28);
      return {
        offset: (t) => {
          let along = 0;
          let across = a * Math.sin(Math.PI * t);
          if (t > at && t < at + w) {
            const th = (TAU * (t - at)) / w;
            along += r * Math.sin(th);
            across += side * r * Math.sin(th) * Math.cos(th);
          }
          return [along, across];
        },
        linger: { at: at + w / 2, width: w * 0.6, depth: 0.5 },
      };
    }
  }
}

export function stopButterfly() {
  current?.cancel();
  current = null;
}

// Starts one flight and returns its duration in ms.
export function flyButterfly(el: HTMLElement): number {
  stopButterfly();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const [[sx, sy], [ex, ey]] = endpoints(vw, vh);
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const shape = shapePath(pickShape(), len);
  const drift = { a: between(18, 32), l: between(380, 560), p: Math.random() * TAU };
  const sway = { a: between(8, 14), l: between(140, 210), p: Math.random() * TAU };
  const bob = { a: between(4, 7), l: between(55, 75), p: Math.random() * TAU };
  const lingers: Linger[] = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
    at: between(0.15, 0.85),
    width: 0.045,
    depth: 0.6,
  }));
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

  const half = (el.offsetWidth || 30) / 2;
  const frames: Keyframe[] = [];
  const times: number[] = [];
  let elapsed = 0;
  let prev = position(0, true);

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const [x, y] = position(t, true);
    const [ax, ay] = position(Math.max(0, t - 0.006), false);
    const [bx, by] = position(Math.min(1, t + 0.006), false);
    const heading = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI + 90 + 8 * Math.sin(TAU * 0.011 * t * len);

    if (i > 0) {
      const step = Math.hypot(x - prev[0], y - prev[1]);
      const slow = lingers.reduce((m, l) => Math.max(m, l.depth * Math.exp(-(((t - l.at) / l.width) ** 2))), 0);
      elapsed += (step / (SPEED * (1 - slow))) * 1000;
    }
    prev = [x, y];
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

  current = el.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
  return duration;
}
