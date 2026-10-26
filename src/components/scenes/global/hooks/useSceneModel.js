import { useMemo } from 'react';

export const GRID_COLUMNS = 9;
export const GRID_ROWS = 4;

export const LINE_NUMBERS = [240, 241, 242, 243];
export const TARGET_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const CENTER_COLUMN = 5;

export function useSceneModel(dataset, gridSettings) {
  return useMemo(() => {
    const dx = gridSettings?.dx ?? 200;
    const dy = gridSettings?.dy ?? 500;

    const shotsByCell = new Map();

    dataset?.targetsById.forEach((shots, targetId) => {
      const firstShot = shots[0];

      if (!firstShot) {
        return;
      }

      const lineNumber = Number(firstShot.lineNumber);
      const targetNumber = Number(firstShot.targetNumber);

      if (!LINE_NUMBERS.includes(lineNumber)) {
        return;
      }

      if (!TARGET_NUMBERS.includes(targetNumber)) {
        return;
      }

      shotsByCell.set(`${lineNumber}-${targetNumber}`, shots);
    });

    const targets = [];

    LINE_NUMBERS.forEach((lineNumber, lineIndex) => {
      TARGET_NUMBERS.forEach((targetNumber) => {
        const targetId = `${lineNumber}-${targetNumber}`;
        const shots = shotsByCell.get(targetId) ?? [];

        targets.push({
          targetId,
          shots,
          isEmpty: shots.length === 0,

          lineNumber,
          targetNumber,

          column: targetNumber,
          rowFromBottom: lineIndex,

          centerX: (targetNumber - CENTER_COLUMN) * dx,
          centerY: (lineIndex - (GRID_ROWS - 1) / 2) * dy,
        });
      });
    });

    return {
      targets,

      gridLines: {
        vertical: TARGET_NUMBERS.map((targetNumber) => ({
          key: `grid-x-${targetNumber}`,
          x: (targetNumber - CENTER_COLUMN) * dx,
        })),

        horizontal: LINE_NUMBERS.map((lineNumber, lineIndex) => ({
          key: `grid-y-${lineNumber}`,
          y: (lineIndex - (GRID_ROWS - 1) / 2) * dy,
        })),
      },
    };
  }, [dataset, gridSettings]);
}