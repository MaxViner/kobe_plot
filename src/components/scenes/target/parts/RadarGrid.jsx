import styles from '../TargetDetailView.module.scss';

const RADIAL_STEPS = [0.5, 1];
const AZIMUTH_STEP = 30;

export function RadarGrid({ size, center, maxRadius }) {
  const azimuths = Array.from(
    { length: 360 / AZIMUTH_STEP },
    (_, index) => index * AZIMUTH_STEP,
  );

  return (
    <>
      {RADIAL_STEPS.map((factor) => (
        <circle
          key={factor}
          cx={center}
          cy={center}
          r={maxRadius * factor}
          className={[
            styles.rangeRing,
            factor === 1 ? styles.rangeRingMain : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}

      {azimuths.map((angle) => {
        const angleRad = (angle * Math.PI) / 180;

        return (
          <g key={angle}>
            <line
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.sin(angleRad)}
              y2={center - maxRadius * Math.cos(angleRad)}
              className={styles.radialLine}
            />

            <text
              x={center + (maxRadius + 18) * Math.sin(angleRad)}
              y={center - (maxRadius + 18) * Math.cos(angleRad) + 4}
              textAnchor="middle"
              className={styles.azimuthLabel}
            >
              {angle}°
            </text>
          </g>
        );
      })}

      <line
        x1={center - maxRadius}
        y1={center}
        x2={center + maxRadius}
        y2={center}
        className={styles.axis}
      />

      <line
        x1={center}
        y1={center - maxRadius}
        x2={center}
        y2={center + maxRadius}
        className={styles.axis}
      />
    </>
  );
}