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
import { runKMeansForTarget } from './math/clustering/index.js';
import styles from './styles/app.module.scss';
import {
  GRID_COLUMNS,
  GRID_ROWS,
} from './components/scenes/global/hooks/useSceneModel.js';

export default function App() {
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredShotId, setHoveredShotId] = useState(null);
  const [hoveredTargetId, setHoveredTargetId] = useState(null);
  const [clusterCountsByTargetId, setClusterCountsByTargetId] =
    useState({});

  const [gridSettings, setGridSettings] = useState({
    dx: 200,
    dy: 500,
    targetRadius: 50,
    approachCourse: 270,
  });

  const [clusteringSettings, setClusteringSettings] = useState({
    clusteringAlgorithm: 'capacity-kmeans',
    maxClusterSize: 24,
    dbscanEpsilon: 20,
    dbscanMinSamples: 3,
  });

  const hasLoadedDefaultDataset = useRef(false);

  const handleClusteringSettingsChange = useCallback(
    (nextSettings) => {
      setClusteringSettings((previousSettings) => ({
        ...previousSettings,
        ...nextSettings,
      }));
    },
    [],
  );

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
    Math.ceil(selectedShots.length / safeMaxClusterSize),
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
      epsilon: clusteringSettings.dbscanEpsilon,
      minSamples: clusteringSettings.dbscanMinSamples,
    }),
    [
      clusteringSettings.dbscanEpsilon,
      clusteringSettings.dbscanMinSamples,
    ],
  );

  const clusterResultsByTargetId = useMemo(() => {
    if (!dataset) {
      return new Map();
    }

    const results = new Map();
    const targetIds = dataset.targetIds ?? [];

    const maxClusterSize = Math.max(
      1,
      Math.floor(
        Number(clusteringSettings.maxClusterSize) || 1,
      ),
    );

    targetIds.forEach((targetId) => {
      const shots =
        dataset.targetsById.get(targetId) ?? [];

      const automaticClusterCount = Math.max(
        1,
        Math.ceil(shots.length / maxClusterSize),
      );

      results.set(
        targetId,
        runKMeansForTarget(
          shots,
          automaticClusterCount,
          maxClusterSize,
          clusteringSettings.clusteringAlgorithm,
          {
            epsilon: clusteringSettings.dbscanEpsilon,
            minSamples:
              clusteringSettings.dbscanMinSamples,
          },
        ),
      );
    });

    return results;
  }, [
    dataset,
    clusteringSettings.clusteringAlgorithm,
    clusteringSettings.maxClusterSize,
    clusteringSettings.dbscanEpsilon,
    clusteringSettings.dbscanMinSamples,
  ]);

  const handleHoverShot = useCallback((shotId) => {
    setHoveredShotId(shotId);
  }, []);

  const handleLeaveShot = useCallback(() => {
    setHoveredShotId(null);
  }, []);

  const handleHoverTarget = useCallback((targetId) => {
    setHoveredTargetId(targetId);
  }, []);

  const handleLeaveTarget = useCallback(() => {
    setHoveredTargetId(null);
  }, []);

  const handleLoadCsv = useCallback(
    createLoadCsvHandler(
      (nextDataset) => {
        setError(null);
        setSelectedTargetId(null);
        setViewMode('overview');
        loadDataset(nextDataset);
      },
      setError,
    ),
    [loadDataset],
  );

  const handleLoadMock = useCallback(
    createLoadMockHandler((nextDataset) => {
      setError(null);
      setSelectedTargetId(null);
      setViewMode('overview');
      loadDataset(nextDataset);
    }),
    [loadDataset],
  );

  const handleDownloadTemplate = useCallback(
    createDownloadTemplateHandler(),
    [],
  );

  const handleSelectTarget = useCallback((targetId) => {
    setSelectedTargetId(targetId);
    setViewMode('target');
  }, []);

  const handleSelectStatisticsTarget = useCallback(
    (targetId) => {
      setSelectedTargetId(targetId);
    },
    [],
  );

  const handleBackToTargetList = useCallback(() => {
    setViewMode('overview');
    setSelectedTargetId(null);
  }, []);

  const handleGridSettingsChange = useCallback(
    (nextSettings) => {
      setGridSettings((previousSettings) => ({
        ...previousSettings,
        ...nextSettings,
      }));
    },
    [],
  );

  const handleClusterCountChange = useCallback(
    (nextClusterCount) => {
      if (!selectedTargetId) {
        return;
      }

      setClusterCountsByTargetId((previous) => ({
        ...previous,
        [selectedTargetId]: nextClusterCount,
      }));
    },
    [selectedTargetId],
  );

  useEffect(() => {
    if (hasLoadedDefaultDataset.current) {
      return;
    }

    hasLoadedDefaultDataset.current = true;

    const loadDefaultDataset = async () => {
      try {
        const response = await fetch('/shots.csv');

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

  return (
    <div className={styles.root}>
      <AppHeaderWidget
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        gridSettings={gridSettings}
        onGridSettingsChange={handleGridSettingsChange}
        clusteringSettings={clusteringSettings}
        onClusteringSettingsChange={
          handleClusteringSettingsChange
        }
      />

      <main className={styles.main}>
        {viewMode === 'target' && selectedTargetId ? (
          <TargetInspectorSidebarWidget
            targetId={selectedTargetId}
            className={styles.sidebarOnMobile}
            shots={selectedShots}
            targetIds={dataset.targetIds}
            hoveredShotId={hoveredShotId}
            onHoverShot={handleHoverShot}
            onLeaveShot={handleLeaveShot}
            onSelectTarget={handleSelectTarget}
            onBack={handleBackToTargetList}
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
            onDownloadTemplate={handleDownloadTemplate}
            onSelectTarget={handleSelectTarget}
            onHoverTarget={handleHoverTarget}
            onLeaveTarget={handleLeaveTarget}
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
              onSelectTarget={handleSelectTarget}
              gridSettings={gridSettings}
            />
          ) : viewMode === 'statistics' ? (
            <StatisticsScene
              targets={statisticsTargets}
              clusterResultsByTargetId={
                clusterResultsByTargetId
              }
              selectedTargetId={selectedTargetId}
              onSelectTarget={handleSelectStatisticsTarget}
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
              targetRadius={gridSettings.targetRadius}
              onHoverShot={handleHoverShot}
              onLeaveShot={handleLeaveShot}
            />
          )}
        </div>
      </main>
    </div>
  );
}