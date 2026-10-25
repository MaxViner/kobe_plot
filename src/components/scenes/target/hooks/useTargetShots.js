import { useMemo } from 'react';

export function useTargetShots(dataset, targetId) {
  return useMemo(() => {
    if (!targetId) {
      return [];
    }

    return dataset.targetsById.get(targetId) ?? [];
  }, [dataset, targetId]);
}