import styles from '../TargetDetailView.module.scss';

const TOOLTIP_WIDTH = 150;
const TOOLTIP_HEIGHT = 58;
const TOOLTIP_OFFSET_X = 12;
const TOOLTIP_OFFSET_Y = -34;

export function HoveredShotLayer({
  shot,
  shotIndex,
  point,
  center,
  isVisible,
}) {
  const isRightSide = point.x > center;

  const tooltipX = isRightSide
    ? point.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET_X
    : point.x + TOOLTIP_OFFSET_X;

  const tooltipY = point.y + TOOLTIP_OFFSET_Y;

  return (
    <g
      className={[
        styles.hoveredShot,
        isVisible ? styles.visible : styles.hidden,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <circle
        cx={point.x}
        cy={point.y}
        r={7}
        className={styles.hoveredShotGlow}
        filter="url(#shot-hover-glow)"
      />

      <g transform={`translate(${tooltipX} ${tooltipY})`}>
        <g className={styles.shotTooltip}>
          <rect
            width={TOOLTIP_WIDTH}
            height={TOOLTIP_HEIGHT}
            rx={6}
            className={styles.shotTooltipBackground}
          />

          <text x={10} y={18} className={styles.shotTooltipTitle}>
            Точка #{shotIndex + 1}
          </text>

          <text x={10} y={34} className={styles.shotTooltipText}>
            Азимут: {shot.azimuthDeg.toFixed(2)}°
          </text>

          <text x={10} y={49} className={styles.shotTooltipText}>
            X: {shot.xLocal.toFixed(3)} м · Y: {shot.yLocal.toFixed(3)} м
          </text>
        </g>
      </g>
    </g>
  );
}