import { useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { RangeField } from '../../components/ui/rangeField/RangeField';
import styles from './SceneSettingsMenu.module.scss';

const DEFAULT_SETTINGS = {
  dx: 200,
  dy: 500,
  targetRadius: 0.35,
  approachCourse: 270,
  maxClusterSize: 24,
};

export function SceneSettingsMenu({
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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="scene-settings-panel"
      >
        <Settings2 size={14} />
        Настройки сетки
      </button>

      {isOpen && (
        <div
          id="scene-settings-panel"
          className={styles.panel}
        >
          <RangeField
            label="Курс захода"
            displayValue={`${settings.approachCourse}°`}
            min={0}
            max={360}
            step={1}
            value={settings.approachCourse}
            onChange={(event) =>
              onChange({
                approachCourse: Number(event.target.value),
              })
            }
          />

          <RangeField
            label="Шаг по Z"
            displayValue={`${settings.dx} м`}
            min={0.1}
            max={1000}
            step={0.1}
            value={settings.dx}
            onChange={(event) =>
              onChange({
                dx: Number(event.target.value),
              })
            }
          />

          <RangeField
            label="Шаг по Х"
            displayValue={`${settings.dy} м`}
            min={0.1}
            max={1000}
            step={0.1}
            value={settings.dy}
            onChange={(event) =>
              onChange({
                dy: Number(event.target.value),
              })
            }
          />

          <RangeField
            label="Радиус мишени"
            displayValue={`${settings.targetRadius} м`}
            min={0.05}
            max={100}
            step={0.05}
            value={settings.targetRadius}
            onChange={(event) =>
              onChange({
                targetRadius: Number(event.target.value),
              })
            }
          />

          <RangeField
            label="Максимум точек в кластере"
            displayValue={`${settings.maxClusterSize}`}
            min={2}
            max={100}
            step={1}
            value={settings.maxClusterSize}
            onChange={(event) =>
              onChange({
                maxClusterSize: Number(event.target.value),
              })
            }
          />

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