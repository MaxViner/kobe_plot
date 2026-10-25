import { Grid3x3, Radar } from 'lucide-react';
import styles from './AppHeader.module.scss';
import {SceneSettingsMenu} from '../../widgets/scenesettingpanel/SceneSettingsMenu'
const VIEWS = [
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
];

export function AppHeader({ viewMode, onViewModeChange }) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Анализ результатов пусков по кругам</h1>
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
      <nav className={styles.switcher} aria-label="Режим просмотра">
        {VIEWS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={[
              styles.viewButton,
              viewMode === id ? styles.active : '',
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