import { Grid3x3, Radar, ChartColumn } from 'lucide-react';
import styles from './AppHeaderWidget.module.scss';
import {SceneSettingsMenu} from '../scenesettingpanel/SceneSettingsMenu'

const VIEW_MODES = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Grid3x3 size={16} />,
  },
  {
    id: 'target',
    label: 'Target Inspector',
    icon: <Radar size={16} />,
  },
  {
    id: 'statistics',
    label: 'Статистика',
    icon: <ChartColumn size={16} />,
  },
];
export function AppHeaderWidget({ viewMode, onViewModeChange,
  gridSettings,
  onGridSettingsChange
 }) {
  return (
    <header className={styles.header}>
      <div className={styles.branding}>
        <h1 className={styles.title}>Ballistic Cluster Analyzer</h1>
        <p className={styles.subtitle}>
          Пространственный анализ точек падения и локальная кластеризация
        </p>
      </div>
        <div className={styles.actions}>
          <SceneSettingsMenu
            settings={gridSettings}
            onChange={onGridSettingsChange}
          />
        </div>
      <nav
        className={styles.switcher}
        aria-label="Переключение режима просмотра"
      >
        {VIEW_MODES.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={[
              styles.modeButton,
              viewMode === id ? styles.modeButtonActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onViewModeChange(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}