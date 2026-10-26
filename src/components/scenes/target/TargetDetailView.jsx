import { useMemo } from 'react';
import { Radar } from 'lucide-react';
import { RangeField } from '../../ui/rangeField/RangeField.jsx';
import { SectionHeader } from '../../ui/sectionheader/SectionHeader.jsx';
import { useClusterAnalysis } from './hooks/useClusterAnalysis.js';
import { useTargetShots } from './hooks/useTargetShots.js';
import { useTargetRadarScale } from './hooks/useTargetRadarScale.js';
import { useTargetMetrics } from './hooks/useTargetMetrics.js';
import { RadarGrid } from './parts/RadarGrid.jsx';
import { ClusterLayer } from './parts/ClusterLayer.jsx';
import { ShotLayer } from './parts/ShotLayer.jsx';
import { HoveredShotLayer } from './parts/HoveredShotLayer.jsx';
import { TargetMetricsPanel } from './parts/TargetMetricsPanel.jsx';
import styles from './TargetDetailView.module.scss';

export function TargetDetailView({
 dataset,
  targetId,
  clusterCount,
  minClusterCount,
  maxClusterCount,
  hoveredShotId,
  onClusterCountChange,
  targetRadius = 50,
  onHoverShot,
  onLeaveShot,
  maxClusterSize = 24,
}) {
  const shots = useTargetShots(dataset, targetId);

    const { result, clusterByShotId } = useClusterAnalysis(
      shots,
      clusterCount,
      maxClusterSize
);

  const { size, center, maxRadius, maxRange, toScreen } =
    useTargetRadarScale(shots);

  const metrics = useTargetMetrics(shots, result);

  const hoveredShot = useMemo(
    () => shots.find((shot) => shot.id === hoveredShotId) ?? null,
    [shots, hoveredShotId],
  );

  const hoveredShotIndex = useMemo(() => {
    if (!hoveredShot) {
      return 0;
    }

    return shots.findIndex((shot) => shot.id === hoveredShot.id);
  }, [shots, hoveredShot]);

  const activeShot = hoveredShot ?? shots[0];

  const activePoint = useMemo(() => {
    if (!activeShot) {
      return {
        x: center,
        y: center,
      };
    }

  return toScreen(activeShot.zLocal, activeShot.xLocal);  }, [activeShot, center, toScreen]);

  const targetScreenRadius = useMemo(() => {
    const maxTargetRange = Math.max(
      maxRange,
      targetRadius,
      Number.EPSILON,
    );

    return (targetRadius / maxTargetRange) * maxRadius;
  }, [maxRange, maxRadius, targetRadius]);

  if (!targetId || shots.length === 0) {
    return (
      <section className={styles.empty}>
        <Radar size={32} className={styles.emptyIcon} />
        <p>Выберите мишень на панораме или в списке.</p>
      </section>
    );
  }

  return (
    <section className={styles.scene}>
      <SectionHeader
        icon={<Radar size={16} className={styles.headerIcon} />}
        title={`Target Inspector · ${targetId}`}
        action={
          <RangeField
        label="Кластеров"
        displayValue={clusterCount}
        min={minClusterCount}
        max={10}
        value={clusterCount}
        onChange={(event) => {
          const nextClusterCount = Number(event.target.value);

          onClusterCountChange(
            Math.min(
              Math.max(nextClusterCount, minClusterCount),
              maxClusterCount,
            ),
          );
        }}
      />
        }
      />

      <div className={styles.content}>
        <div className={styles.radarWrapper}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className={styles.radar}
            role="img"
            aria-label={`Полярная сетка и кластеры мишени ${targetId}`}
          >
            <defs>
              <filter
                id="shot-hover-glow"
                x="-75%"
                y="-75%"
                width="250%"
                height="250%"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="4"
                  result="blurredShot"
                />

                <feMerge>
                  <feMergeNode in="blurredShot" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <RadarGrid
              size={size}
              center={center}
              maxRadius={maxRadius}
            />

            <circle
              cx={center}
              cy={center}
              r={targetScreenRadius}
              className={styles.targetBoundary}
            />

            <ClusterLayer
              clusters={result.clusters}
              toScreen={toScreen}
              rangeToScreenScale={maxRadius / maxRange}
            />

            <ShotLayer
              shots={shots}
              clusterByShotId={clusterByShotId}
              hoveredShotId={hoveredShotId}
              toScreen={toScreen}
              onHoverShot={onHoverShot}
              onLeaveShot={onLeaveShot}
            />

            <HoveredShotLayer
              shot={activeShot}
              shotIndex={hoveredShotIndex}
              point={activePoint}
              center={center}
              isVisible={Boolean(hoveredShot)}
            />

            <circle
              cx={center}
              cy={center}
              r={4}
              className={styles.origin}
            />
          </svg>
        </div>

        <TargetMetricsPanel
          metrics={metrics}
          clusters={result.clusters}
          clusterResult={result}
        />
      </div>
    </section>
  );
}