import { useCallback, useMemo, useState } from 'react';
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
import { runKMeansForTarget } from './math/clustering.js';
import styles from './styles/app.module.scss';
import {
  GRID_COLUMNS,
  GRID_ROWS,
} from './components/scenes/global/hooks/useSceneModel.js';

export default function App() {
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [clusterCount, setClusterCount] = useState(2);
  const [error, setError] = useState(null);
  const [hoveredShotId, setHoveredShotId] = useState(null);
  const [hoveredTargetId, setHoveredTargetId] = useState(null);
  
  const [gridSettings, setGridSettings] = useState({
      dx: 200,
      dy: 500,
      targetRadius: 50,
    });

  const { parsedDataset, dataset, loadDataset } = useBallisticsDataset(
    createMockDataset(),
  );

  const clusterResultsByTargetId = useMemo(() => {
    if (!dataset) {
      return new Map();
    }

    const results = new Map();
    
  


    const targetIds = dataset.targetIds ?? [];

    targetIds.forEach((targetId) => {
      const shots = dataset.targetsById.get(targetId) ?? [];

      results.set(
        targetId,
        runKMeansForTarget(shots, clusterCount),
      );
    });

    return results;
  }, [dataset, clusterCount]);

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

  const handleSelectStatisticsTarget = useCallback((targetId) => {
    setSelectedTargetId(targetId);
  }, []);

  const handleBackToTargetList = useCallback(() => {
    setViewMode('overview');
    setSelectedTargetId(null);
  }, []);

  const selectedShots =
    dataset?.targetsById.get(selectedTargetId) ?? [];

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

  const handleGridSettingsChange = useCallback((nextSettings) => {
    setGridSettings((previousSettings) => ({
      ...previousSettings,
      ...nextSettings,
    }));
  }, []);

const sceneBounds = useMemo(() => {
  const halfWidth = ((GRID_COLUMNS - 1) / 2) * gridSettings.dx;
  const halfHeight = ((GRID_ROWS - 1) / 2) * gridSettings.dy;

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
              clusterResultsByTargetId={clusterResultsByTargetId}
              selectedTargetId={selectedTargetId}
              onSelectTarget={handleSelectStatisticsTarget}
            />
          ) : (
            <TargetDetailView
              dataset={dataset}
              targetId={selectedTargetId}
              clusterCount={clusterCount}
              hoveredShotId={hoveredShotId}
              onClusterCountChange={setClusterCount}
            />
          )}
        </div>
      </main>
    </div>
  );
}