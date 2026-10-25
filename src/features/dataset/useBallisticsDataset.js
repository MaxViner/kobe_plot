import { useCallback, useMemo, useState } from 'react';
import { transformDataset } from '../../math/coordinates';

export function useBallisticsDataset(initialDataset = null) {
  const [parsedDataset, setParsedDataset] = useState(initialDataset);

  const dataset = useMemo(
    () => (parsedDataset ? transformDataset(parsedDataset) : null),
    [parsedDataset],
  );

  const targets = useMemo(
    () =>
      dataset
        ? [...dataset.targetsById.entries()].map(
            ([targetId, shots]) => ({
              targetId,
              shots,
            }),
          )
        : [],
    [dataset],
  );

  const loadDataset = useCallback((nextDataset) => {
    setParsedDataset(nextDataset);
  }, []);

  return {
    parsedDataset,
    dataset,
    targets,
    loadDataset,
  };
}