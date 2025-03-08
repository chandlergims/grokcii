/**
 * This is a stub implementation of the calculateBox function
 * to fix the missing module error in react-svg-pan-zoom
 */

export default function calculateBox(start, end) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return {
    x,
    y,
    width,
    height
  };
}
