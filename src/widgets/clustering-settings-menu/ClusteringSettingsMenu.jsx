import { useEffect, useRef, useState } from 'react';
import { Boxes } from 'lucide-react';
import { RangeField } from '../../components/ui/rangeField/RangeField';
import styles from './ClusteringSettingsMenu.module.scss';

const DEFAULT_SETTINGS = {
  clusteringAlgorithm: 'capacity-kmeans',
  maxClusterSize: 24,
  dbscanEpsilon: 20,
  dbscanMinSamples: 3,
};

const ALGORITHMS = [
  {
    id: 'kmeans',
    label: 'K-means',
  },
  {
    id: 'capacity-kmeans',
    label: 'K-means с лимитом',
  },
  {
    id: 'hierarchical',
    label: 'Иерархическая',
  },
  {
    id: 'dbscan',
    label: 'DBSCAN',
  },
];

export function ClusteringSettingsMenu({
  settings,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isOpen]);

  const isDbscan =
    settings.clusteringAlgorithm === 'dbscan';

  return (
    <div
      ref={menuRef}
      className={styles.wrapper}
    >
      <button
        type="button"
        className={[
          styles.trigger,
          isOpen ? styles.triggerActive : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        aria-expanded={isOpen}
        aria-controls="clustering-settings-panel"
      >
        <Boxes size={28} />
        Настройки кластеризации
      </button>

      {isOpen && (
        <div
          id="clustering-settings-panel"
          className={styles.panel}
        >
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Алгоритм
            </span>

            <select
              className={styles.select}
              value={settings.clusteringAlgorithm}
              onChange={(event) =>
                onChange({
                  clusteringAlgorithm:
                    event.target.value,
                })
              }
            >
              {ALGORITHMS.map((algorithm) => (
                <option
                  key={algorithm.id}
                  value={algorithm.id}
                >
                  {algorithm.label}
                </option>
              ))}
            </select>
          </label>

          {!isDbscan && (
            <RangeField
              label="Максимум точек в кластере"
              displayValue={`${settings.maxClusterSize}`}
              min={2}
              max={100}
              step={1}
              value={settings.maxClusterSize}
              onChange={(event) =>
                onChange({
                  maxClusterSize: Number(
                    event.target.value,
                  ),
                })
              }
            />
          )}

          {isDbscan && (
            <>
              <RangeField
                label="Радиус соседства"
                displayValue={`${settings.dbscanEpsilon} м`}
                min={0.1}
                max={200}
                step={0.1}
                value={settings.dbscanEpsilon}
                onChange={(event) =>
                  onChange({
                    dbscanEpsilon: Number(
                      event.target.value,
                    ),
                  })
                }
              />

              <RangeField
                label="Минимум соседей"
                displayValue={`${settings.dbscanMinSamples}`}
                min={1}
                max={50}
                step={1}
                value={settings.dbscanMinSamples}
                onChange={(event) =>
                  onChange({
                    dbscanMinSamples: Number(
                      event.target.value,
                    ),
                  })
                }
              />
            </>
          )}

          <button
            type="button"
            className={styles.resetButton}
            onClick={() => onChange(DEFAULT_SETTINGS)}
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
}