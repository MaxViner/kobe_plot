import { TargetShots } from './TargetShots.jsx';
import styles from '../GlobalSceneView.module.scss';

export function TargetMarker({
  target,
  targetRadius,
  isSelected,
  isHovered,
  onSelect,
  onFocus,
  onMouseEnter,
  onMouseLeave,
}) {
  const isHighlighted = isSelected || isHovered;

  const centerX = Number.isFinite(target.centerX)
    ? target.centerX
    : 0;

  const centerY = Number.isFinite(target.centerY)
    ? target.centerY
    : 0;

  const radius = Number.isFinite(targetRadius)
    ? targetRadius
    : 0;

  const labelY = centerY - radius - 18;

  return (
    <g
      className={[
        styles.target,
        isHighlighted ? styles.targetHighlighted : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onMouseEnter(target.targetId)}
      onMouseLeave={onMouseLeave}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(target.targetId);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onFocus(target);
      }}
    >
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        className={styles.targetHitArea}
      />

      {isHighlighted && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          className={styles.targetGlow}
        />
      )}

      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        className={[
          styles.targetRing,
          isHighlighted ? styles.targetRingHighlighted : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      <circle
        cx={centerX}
        cy={centerY}
        r={Math.max(radius * 0.07, 1)}
        className={[
          styles.targetCenter,
          isHighlighted ? styles.targetCenterHighlighted : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      <TargetShots
        target={target}
        shots={target.shots}
        radius={radius}
        highlighted={isHighlighted}
      />

      <text
        x={centerX}
        y={labelY}
        textAnchor="middle"
        className={[
          styles.targetLabel,
          isHighlighted ? styles.targetLabelHighlighted : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {target.targetId}
      </text>
    </g>
  );
}