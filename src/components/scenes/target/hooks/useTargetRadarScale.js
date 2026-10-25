import { useMemo } from 'react';

const SIZE = 640;
const CENTER = SIZE / 2;
const MAX_RADIUS = 280;

export function useTargetRadarScale(shots) {
  const maxRange = useMemo(() => {
    if (shots.length === 0) {
      return 0.25;
    }

    return Math.max(0.25, ...shots.map((shot) => shot.rangeM));
  }, [shots]);

  const toScreen = useMemo(() => {
    const scale = MAX_RADIUS / maxRange;

    return (x, y) => ({
      x: CENTER + x * scale,
      y: CENTER - y * scale,
    });
  }, [maxRange]);

  return {
    size: SIZE,
    center: CENTER,
    maxRadius: MAX_RADIUS,
    maxRange,
    toScreen,
  };
}