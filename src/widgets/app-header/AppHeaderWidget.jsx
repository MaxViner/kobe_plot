import { useEffect, useState } from 'react';
import {
  Grid3x3,
  Radar,
  ChartColumn,
  Settings2,
  X,
} from 'lucide-react';
import { SceneSettingsMenu } from '../scenesettingpanel/SceneSettingsMenu';
import { ClusteringSettingsMenu } from '../clustering-settings-menu/ClusteringSettingsMenu';
import { TargetNavigation } from '../../components/data/tst/parts/TargetNavigation';
import styles from './AppHeaderWidget.module.scss';

const VIEW_MODES = [
  {
    id: 'overview',
    label: 'Панорама',
    icon: <Grid3x3 size={16} />,
  },
  {
    id: 'target',
    label: 'Мишень',
    icon: <Radar size={16} />,
  },
  {
    id: 'statistics',
    label: 'Статистика',
    icon: <ChartColumn size={16} />,
  },
];

export function AppHeaderWidget({
  viewMode,
  onViewModeChange,
  gridSettings,
  onGridSettingsChange,
  clusteringSettings,
  onClusteringSettingsChange,
  targetNavigation,
}) {
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] =
    useState(false);

  useEffect(() => {
    if (!isMobileSettingsOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileSettingsOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isMobileSettingsOpen]);

  const isTargetMode = viewMode === 'target';

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.branding}>
          <h1 className={styles.title}>
            Класеризация точек на мишенном поле
          </h1>

          <p className={styles.subtitle}>
            Пространственный анализ точек падения и
            локальная кластеризация
          </p>
        </div>

        <div className={styles.desktopActions}>
          <SceneSettingsMenu
            settings={gridSettings}
            onChange={onGridSettingsChange}
          />

          <ClusteringSettingsMenu
            settings={clusteringSettings}
            onChange={onClusteringSettingsChange}
          />
        </div>

        <button
          type="button"
          className={styles.mobileSettingsButton}
          onClick={() =>
            setIsMobileSettingsOpen(true)
          }
          aria-label="Открыть настройки"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {isTargetMode && targetNavigation && (
        <div className={styles.mobileNavigation}>
          <TargetNavigation
            targetId={targetNavigation.targetId}
            currentIndex={targetNavigation.currentIndex}
            totalCount={targetNavigation.totalCount}
            previousTargetId={
              targetNavigation.previousTargetId
            }
            nextTargetId={
              targetNavigation.nextTargetId
            }
            canGoPrevious={
              targetNavigation.canGoPrevious
            }
            canGoNext={targetNavigation.canGoNext}
            onBack={targetNavigation.onBack}
            onSelectTarget={
              targetNavigation.onSelectTarget
            }
          />
        </div>
      )}

      <nav
        className={styles.switcher}
        aria-label="Переключение режима просмотра"
      >
        {VIEW_MODES.map(
          ({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={[
                styles.modeButton,
                viewMode === id
                  ? styles.modeButtonActive
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onViewModeChange(id)}
            >
              {icon}
              {label}
            </button>
          ),
        )}
      </nav>

      {isMobileSettingsOpen && (
        <div
          className={styles.mobileSettingsOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Настройки"
        >
          <div
            className={styles.mobileSettingsPanel}
          >
            <div
              className={
                styles.mobileSettingsHeader
              }
            >
              <span>Настройки</span>

              <button
                type="button"
                className={
                  styles.mobileSettingsClose
                }
                onClick={() =>
                  setIsMobileSettingsOpen(false)
                }
                aria-label="Закрыть настройки"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className={
                styles.mobileSettingsContent
              }
            >
              <SceneSettingsMenu
                settings={gridSettings}
                onChange={onGridSettingsChange}
              />

              <ClusteringSettingsMenu
                settings={clusteringSettings}
                onChange={
                  onClusteringSettingsChange
                }
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}