import { useMemo } from 'react';

export const VIEWBOX_WIDTH = 1000;
export const VIEWBOX_HEIGHT = 700;

export function useSceneFit(bounds) {
  return useMemo(() => {
    const safeBounds = bounds ?? {
      minX: -800,
      minY: -1000,
      maxX: 800,
      maxY: 1000,
    };

    const worldWidth = Math.max(
      safeBounds.maxX - safeBounds.minX,
      1,
    );

    const worldHeight = Math.max(
      safeBounds.maxY - safeBounds.minY,
      1,
    );

    const scale = Math.min(
      VIEWBOX_WIDTH / worldWidth,
      VIEWBOX_HEIGHT / worldHeight,
    );

    const translateX =
      (VIEWBOX_WIDTH - worldWidth * scale) / 2 -
      safeBounds.minX * scale;

    const translateY =
      (VIEWBOX_HEIGHT - worldHeight * scale) / 2 -
      safeBounds.minY * scale;

    return `translate(${translateX} ${translateY}) scale(${scale})`;
  }, [bounds]);
}