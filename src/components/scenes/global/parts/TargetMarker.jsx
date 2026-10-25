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
        cx={target.centerX}
        cy={target.centerY}
        r={targetRadius}
        className={styles.targetHitArea}
      />

      {isHighlighted && (
        <circle
          cx={target.centerX}
          cy={target.centerY}
          r={targetRadius}
          className={styles.targetGlow}
          filter="url(#target-hover-glow)"
        />
      )}

      <circle
        cx={target.centerX}
        cy={target.centerY}
        r={targetRadius}
        className={[
          styles.targetRing,
          isHighlighted ? styles.targetRingHighlighted : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      <circle
        cx={target.centerX}
        cy={target.centerY}
        r={targetRadius * 0.07}
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
      radius={targetRadius}
      highlighted={isHighlighted}
    />

      <text
        x={target.centerX}
        y={target.centerY - targetRadius -18}
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