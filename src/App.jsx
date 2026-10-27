import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppHeaderWidget } from './widgets/app-header/AppHeaderWidget.jsx';
import { GlobalSceneView } from './components/scenes/global/GlobalSceneView.jsx';
import { TargetDetailView } from './components/scenes/target/TargetDetailView.jsx';
import { StatisticsScene } from './components/scenes/statistics/StatisticsScene.jsx';
import { DatasetSidebarWidget } from './widgets/dataset-sidebar/DatasetSidebarWidget.jsx';
import { TargetInspectorSidebarWidget } from './widgets/target-inspector-sidebar/TargetInspectorSidebarWidget.jsx';
import {
  createDownloadTemplateHandler,
  createLoadCsvHandler,
  createLoadMockHandler,
} from './features/dataset/datasetHandlers.js';
import { useBallisticsDataset } from './features/dataset/useBallisticsDataset.js';
import { createMockDataset } from './features/csv/csvMock.js';
import { useUiStore } from './stores/useUiStore.js';
import { useGridSettingsStore } from './stores/useGridSettingsStore.js';
import { useClusteringSettingsStore } from './stores/useClusteringSettingsStore.js';
import { useClusterResultsStore } from './stores/useClusterResultsStore.js';
import styles from './styles/app.module.scss';
import {
  GRID_COLUMNS,
  GRID_ROWS,
} from './components/scenes/global/hooks/useSceneModel.js';

export default function App() {
  const viewMode = useUiStore((state) => state.viewMode);
  const selectedTargetId = useUiStore(
    (state) => state.selectedTargetId,
  );
  const hoveredShotId = useUiStore(
    (state) => state.hoveredShotId,
  );
  const hoveredTargetId = useUiStore(
    (state) => state.hoveredTargetId,
  );
  const clusterCountsByTargetId = useUiStore(
    (state) => state.clusterCountsByTargetId,
  );

  const setViewMode = useUiStore(
    (state) => state.setViewMode,
  );
  const selectTarget = useUiStore(
    (state) => state.selectTarget,
  );
  const selectStatisticsTarget = useUiStore(
    (state) => state.selectStatisticsTarget,
  );
  const backToTargetList = useUiStore(
    (state) => state.backToTargetList,
  );
  const setHoveredShotId = useUiStore(
    (state) => state.setHoveredShotId,
  );
  const setHoveredTargetId = useUiStore(
    (state) => state.setHoveredTargetId,
  );
  const setClusterCount = useUiStore(
    (state) => state.setClusterCount,
  );
  const resetDatasetSelection = useUiStore(
    (state) => state.resetDatasetSelection,
  );

  const gridSettings = useGridSettingsStore();
  const updateGridSettings = useGridSettingsStore(
    (state) => state.updateGridSettings,
  );

  const clusteringSettings =
    useClusteringSettingsStore();
  const updateClusteringSettings =
    useClusteringSettingsStore(
      (state) => state.updateClusteringSettings,
    );

  const recomputeClusterResults =
    useClusterResultsStore(
      (state) => state.recomputeClusterResults,
    );

  const clusterResultsByTargetId =
    useClusterResultsStore(
      (state) => state.resultsByTargetId,
    );

  const clusterByShotIdByTargetId =
    useClusterResultsStore(
      (state) => state.clusterByShotIdByTargetId,
    );

  const [error, setError] = useState(null);
  const hasLoadedDefaultDataset = useRef(false);

  const initialDataset = useMemo(
    () => createMockDataset(),
    [],
  );

  const {
    dataset,
    parsedDataset,
    loadDataset,
  } = useBallisticsDataset(
    initialDataset,
    gridSettings.approachCourse,
  );

  const targetIds = dataset?.targetIds ?? [];

  const selectedTargetIndex = targetIds.indexOf(
    selectedTargetId,
  );

  const selectedShots =
    dataset?.targetsById.get(selectedTargetId) ?? [];

  const safeMaxClusterSize = Math.max(
    1,
    Math.floor(
      Number(clusteringSettings.maxClusterSize) || 1,
    ),
  );

  const minClusterCount = Math.max(
    1,
    Math.ceil(
      selectedShots.length / safeMaxClusterSize,
    ),
  );

  const maxClusterCount = Math.max(
    1,
    selectedShots.length,
  );

  const selectedClusterCount =
    clusterCountsByTargetId[selectedTargetId] ??
    minClusterCount;

  const clusteringOptions = useMemo(
    () => ({
      epsilon:
        clusteringSettings.dbscanEpsilon,
      minSamples:
        clusteringSettings.dbscanMinSamples,
    }),
    [
      clusteringSettings.dbscanEpsilon,
      clusteringSettings.dbscanMinSamples,
    ],
  );

  useEffect(() => {
    recomputeClusterResults({
      dataset,
      clusteringSettings,
      clusterCountsByTargetId,
    });
  }, [
    dataset,
    clusteringSettings,
    clusterCountsByTargetId,
    recomputeClusterResults,
  ]);

  const handleLoadCsv = useCallback(
    createLoadCsvHandler(
      (nextDataset) => {
        setError(null);
        resetDatasetSelection();
        loadDataset(nextDataset);
      },
      setError,
    ),
    [loadDataset, resetDatasetSelection],
  );

  const handleLoadMock = useCallback(
    createLoadMockHandler((nextDataset) => {
      setError(null);
      resetDatasetSelection();
      loadDataset(nextDataset);
    }),
    [loadDataset, resetDatasetSelection],
  );

  const handleDownloadTemplate = useCallback(
    createDownloadTemplateHandler(),
    [],
  );

  const handleClusterCountChange = useCallback(
    (nextClusterCount) => {
      if (!selectedTargetId) {
        return;
      }

      setClusterCount(
        selectedTargetId,
        nextClusterCount,
      );
    },
    [selectedTargetId, setClusterCount],
  );

  useEffect(() => {
    if (hasLoadedDefaultDataset.current) {
      return;
    }

    hasLoadedDefaultDataset.current = true;

    const loadDefaultDataset = async () => {
      try {
        const response = await fetch(
          '/shots.csv',
        );

        if (!response.ok) {
          throw new Error(
            `Не удалось загрузить shots.csv: ${response.status}`,
          );
        }

        const csvText = await response.text();

        const defaultFile = new File(
          [csvText],
          'shots.csv',
          {
            type: 'text/csv',
          },
        );

        handleLoadCsv(defaultFile);
      } catch (loadError) {
        console.error(loadError);
        setError(
          'Не удалось загрузить shots.csv по умолчанию.',
        );
      }
    };

    loadDefaultDataset();
  }, [handleLoadCsv]);

  const statisticsTargets = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return [...dataset.targetsById.entries()].map(
      ([targetId, shots]) => ({
        targetId,
        shots,
      }),
    );
  }, [dataset]);

  const sceneBounds = useMemo(() => {
    const halfWidth =
      ((GRID_COLUMNS - 1) / 2) * gridSettings.dx;
    const halfHeight =
      ((GRID_ROWS - 1) / 2) * gridSettings.dy;

    return {
      minX: -halfWidth,
      maxX: halfWidth,
      minY: -halfHeight,
      maxY: halfHeight,
    };
  }, [gridSettings]);

  const previousTargetId =
    selectedTargetIndex > 0
      ? targetIds[selectedTargetIndex - 1]
      : null;

  const nextTargetId =
    selectedTargetIndex >= 0 &&
    selectedTargetIndex < targetIds.length - 1
      ? targetIds[selectedTargetIndex + 1]
      : null;

  const targetNavigation = {
    targetId: selectedTargetId,
    currentIndex: selectedTargetIndex,
    totalCount: targetIds.length,
    previousTargetId,
    nextTargetId,
    canGoPrevious: Boolean(previousTargetId),
    canGoNext: Boolean(nextTargetId),
    onBack: backToTargetList,
    onSelectTarget: selectTarget,
  };

  return (
    <div className={styles.root}>
      <AppHeaderWidget
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        gridSettings={gridSettings}
        onGridSettingsChange={updateGridSettings}
        clusteringSettings={clusteringSettings}
        onClusteringSettingsChange={
          updateClusteringSettings
        }
        targetNavigation={targetNavigation}
      />

      <main className={styles.main}>
        {viewMode === 'target' &&
        selectedTargetId ? (
          <TargetInspectorSidebarWidget
            targetId={selectedTargetId}
            className={styles.sidebarOnMobile}
            shots={selectedShots}
            targetIds={targetIds}
            hoveredShotId={hoveredShotId}
            onHoverShot={setHoveredShotId}
            onLeaveShot={() =>
              setHoveredShotId(null)
            }
            onSelectTarget={selectTarget}
            onBack={backToTargetList}
          />
        ) : (
          <DatasetSidebarWidget
            dataset={dataset}
            parsedDataset={parsedDataset}
            selectedTargetId={selectedTargetId}
            hoveredTargetId={hoveredTargetId}
            error={error}
            onLoadCsv={handleLoadCsv}
            onLoadMock={handleLoadMock}
            onDownloadTemplate={
              handleDownloadTemplate
            }
            onSelectTarget={selectTarget}
            onHoverTarget={setHoveredTargetId}
            onLeaveTarget={() =>
              setHoveredTargetId(null)
            }
          />
        )}

        <div className={styles.workspace}>
          {!dataset ? (
            <div className={styles.empty}>
              Загрузите CSV-датасет.
            </div>
          ) : viewMode === 'overview' ? (
            <GlobalSceneView
              dataset={dataset}
              sceneBounds={sceneBounds}
              selectedTargetId={selectedTargetId}
              hoveredTargetId={hoveredTargetId}
              onSelectTarget={selectTarget}
              gridSettings={gridSettings}
            />
          ) : viewMode === 'statistics' ? (
            <StatisticsScene
              targets={statisticsTargets}
              clusterResultsByTargetId={
                clusterResultsByTargetId
              }
              selectedTargetId={selectedTargetId}
              onSelectTarget={
                selectStatisticsTarget
              }
            />
          ) : (
            <TargetDetailView
              dataset={dataset}
              targetId={selectedTargetId}
              clusterCount={selectedClusterCount}
              minClusterCount={minClusterCount}
              maxClusterCount={maxClusterCount}
              clusteringAlgorithm={
                clusteringSettings.clusteringAlgorithm
              }
              clusteringOptions={clusteringOptions}
              maxClusterSize={safeMaxClusterSize}
              hoveredShotId={hoveredShotId}
              onClusterCountChange={
                handleClusterCountChange
              }
              targetRadius={
                gridSettings.targetRadius
              }
              onHoverShot={setHoveredShotId}
              onLeaveShot={() =>
                setHoveredShotId(null)
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}