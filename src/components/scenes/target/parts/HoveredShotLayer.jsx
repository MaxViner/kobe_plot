import styles from '../TargetDetailView.module.scss';

const TOOLTIP_WIDTH = 190;
const TOOLTIP_HEIGHT = 92;
const TOOLTIP_OFFSET = 14;

const formatNumber = (value, digits = 3) =>
  Number.isFinite(value) ? value.toFixed(digits) : '—';

const formatAzimuth = (value) =>
  Number.isFinite(value) ? `${value.toFixed(1)}°` : '—';

export function HoveredShotLayer({
  shot,
  shotIndex,
  point,
  center,
  isVisible,
  viewBoxSize = 640,
}) {
  const safePoint = {
    x: Number.isFinite(point?.x) ? point.x : center,
    y: Number.isFinite(point?.y) ? point.y : center,
  };

  const azimuth = shot?.azimuth ?? shot?.relativeAzimuth ?? shot?.azimuthDeg;
  const range = shot?.rangeM ?? shot?.range;
  const height = shot?.xLocal;
  const lateral = shot?.zLocal;

  const flipLeft = safePoint.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > viewBoxSize;
  const flipDown = safePoint.y - TOOLTIP_OFFSET - TOOLTIP_HEIGHT < 0;

  const tooltipX = flipLeft
    ? safePoint.x - TOOLTIP_OFFSET - TOOLTIP_WIDTH
    : safePoint.x + TOOLTIP_OFFSET;

  const tooltipY = flipDown
    ? safePoint.y + TOOLTIP_OFFSET
    : safePoint.y - TOOLTIP_OFFSET - TOOLTIP_HEIGHT;

  return (
    <g
      className={[
        styles.hoveredShot,
        isVisible ? styles.visible : styles.hidden,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <line
        x1={center}
        y1={center}
        x2={safePoint.x}
        y2={safePoint.y}
        className={styles.hoveredShotGlow}
      />

      <circle
        cx={safePoint.x}
        cy={safePoint.y}
        r={7}
        className={styles.hoveredShotGlow}
      />

      <g
        transform={`translate(${tooltipX} ${tooltipY})`}
        className={styles.shotTooltip}
      >
        <rect
          x={0}
          y={0}
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
          rx={8}
          className={styles.shotTooltipBackground}
        />

        <text
          x={12}
          y={24}
          className={styles.shotTooltipTitle}
        >
          Выстрел {shotIndex + 1}
        </text>

        <text
          x={12}
          y={44}
          className={styles.shotTooltipText}
        >
          Азимут: {formatAzimuth(azimuth)}
        </text>

        <text
          x={12}
          y={62}
          className={styles.shotTooltipText}
        >
          Дальность: {formatNumber(range)} м
        </text>

        <text
          x={12}
          y={80}
          className={styles.shotTooltipText}
        >
          X: {formatNumber(height)} м · Z: {formatNumber(lateral)} м
        </text>
      </g>
    </g>
  );
}