import { useMemo } from 'react';

export const GRID_COLUMNS = 9;
export const GRID_ROWS = 5;

export const CENTER_COLUMN = Math.ceil(GRID_COLUMNS / 2);
export const CENTER_ROW = Math.ceil(GRID_ROWS / 2);

export function useSceneModel(dataset, gridSettings) {
  return useMemo(() => {
    const dx = gridSettings?.dx ?? dataset.metadata?.dx ?? 200;
    const dy = gridSettings?.dy ?? dataset.metadata?.dy ?? 500;

    const targets = [...dataset.targetsById.entries()].map(
      ([targetId, shots]) => {
        const firstShot = shots[0];

        const sourceColumn =
          firstShot?.targetNumber ??
          (Number.isInteger(firstShot?.targetCol)
            ? firstShot.targetCol + 1
            : CENTER_COLUMN);

        const sourceRow =
          firstShot?.lineNumber ??
          (Number.isInteger(firstShot?.targetRow)
            ? firstShot.targetRow + 1
            : CENTER_ROW);

        const column = Math.min(
          Math.max(sourceColumn, 1),
          GRID_COLUMNS,
        );

        const row = Math.min(
          Math.max(sourceRow, 1),
          GRID_ROWS,
        );

        return {
          targetId,
          shots,

          column,
          row,

          centerX: (column - CENTER_COLUMN) * dx,
          centerY: (CENTER_ROW - row) * dy,
        };
      },
    );

    const uniqueCenterX = [
      ...new Set(targets.map((target) => target.centerX)),
    ].sort((a, b) => a - b);

    const uniqueCenterY = [
      ...new Set(targets.map((target) => target.centerY)),
    ].sort((a, b) => a - b);

    return {
      targets,
      gridLines: {
        vertical: uniqueCenterX.map((x) => ({
          key: `grid-x-${x}`,
          x,
        })),

        horizontal: uniqueCenterY.map((y) => ({
          key: `grid-y-${y}`,
          y,
        })),
      },
    };
  }, [dataset, gridSettings]);
}