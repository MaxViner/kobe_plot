import { Crosshair } from 'lucide-react';
import { SectionHeader } from '../../ui/sectionheader/SectionHeader.jsx';
import { useSceneFit } from './hooks/useSceneFit.js';
import { useSceneZoom } from './hooks/useSceneZoom.js';
import { useSceneModel } from './hooks/useSceneModel.js';
import { useTargetHover } from './hooks/useTargetHover.js';
import { SceneBackground } from './parts/SceneBackground.jsx';
import { SceneGrid } from './parts/SceneGrid.jsx';
import { SceneControls } from './parts/SceneControls.jsx';
import { TargetMarker } from './parts/TargetMarker.jsx';
import styles from './GlobalSceneView.module.scss';



export function GlobalSceneView({
  dataset,
  selectedTargetId,
  hoveredTargetId,
  onSelectTarget,
  gridSettings,
  sceneBounds,
}) {
  const { svgRef, zoomGroupRef, zoomByFactor, resetView, focusPoint } =
    useSceneZoom();

  const { internalHoveredTargetId, handleMouseEnter, handleMouseLeave } =
    useTargetHover();

  const effectiveGridSettings = {
    dx: gridSettings?.dx ?? 200,
    dy: gridSettings?.dy ?? 500,
    targetRadius: gridSettings?.targetRadius ?? 0.35,
    approachCourse: gridSettings?.approachCourse ?? 270,
  };

  const fitTransform = useSceneFit(sceneBounds);

  const { targets, gridLines } = useSceneModel(
    dataset,
    effectiveGridSettings,
  );

  const targetRadius = Math.max(
    effectiveGridSettings.targetRadius,
    (sceneBounds.maxX - sceneBounds.minX) * 0.02,
    (sceneBounds.maxY - sceneBounds.minY) * 0.02,
  );

  const handleFocusTarget = (target) => {
    focusPoint({
      x: target.centerX,
      y: target.centerY,
    });
  };

  return (
    <section className={styles.scene}>
      <SectionHeader
        icon={<Crosshair size={16} className={styles.headerIcon} />}
        title="Пространственная панорама"
        meta={`${dataset.shots.length} точек · ${targets.length} мишеней`}
        action={
          <SceneControls
            onZoomIn={() => zoomByFactor(1.35)}
            onZoomOut={() => zoomByFactor(1 / 1.35)}
            onReset={resetView}
          />
        }
      />

      <div className={styles.canvasWrapper}>
        <svg
          ref={svgRef}
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid meet"
          className={styles.canvas}
          role="img"
          aria-label="Масштабируемая панорама мишеней"
        >
          <SceneBackground />

          <g ref={zoomGroupRef}>
            <g transform={fitTransform}>
              <SceneGrid
                gridLines={gridLines}
                bounds={sceneBounds}
              />

              {targets.map((target) => (
                <TargetMarker
                  key={target.targetId}
                  target={target}
                  targetRadius={targetRadius}
                  isSelected={target.targetId === selectedTargetId}
                  isHovered={
                    target.targetId === hoveredTargetId ||
                    target.targetId === internalHoveredTargetId
                  }
                  onSelect={onSelectTarget}
                  onFocus={handleFocusTarget}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>

      <footer className={styles.hint}>
        Колесо — приближение к курсору · перетаскивание — панорама · двойной
        клик по мишени — фокус
      </footer>
    </section>
  );
}