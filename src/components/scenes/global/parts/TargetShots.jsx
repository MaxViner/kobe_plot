import styles from '../GlobalSceneView.module.scss';

const TARGET_COLORS = [
  '#38bdf8',
  '#f472b6',
  '#a3e635',
  '#fbbf24',
  '#c084fc',
  '#fb7185',
  '#34d399',
  '#60a5fa',
  '#f97316',
  '#22d3ee',
  '#e879f9',
  '#84cc16',
  '#facc15',
  '#fb923c',
  '#4ade80',
  '#818cf8',
  '#f43f5e',
  '#2dd4bf',
];

const getColorByTargetId = (targetId) => {
  const safeTargetId = String(targetId ?? '');

  let hash = 0;

  for (let index = 0; index < safeTargetId.length; index += 1) {
    hash = (hash * 31 + safeTargetId.charCodeAt(index)) % 100000;
  }

  return TARGET_COLORS[hash % TARGET_COLORS.length];
};

export function TargetShots({
  target,
  shots,
  radius,
  highlighted,
}) {
  if (!target) {
    return null;
  }

  const centerX = Number.isFinite(target.centerX)
    ? target.centerX
    : 0;

  const centerY = Number.isFinite(target.centerY)
    ? target.centerY
    : 0;

  const targetColor = getColorByTargetId(target.targetId);

  return (
    <>
      {shots.map((shot) => {
        const shotX = Number.isFinite(shot.zLocal)
          ? shot.zLocal
          : 0;

        const shotY = Number.isFinite(shot.xLocal)
          ? shot.xLocal
          : 0;

        return (
          <circle
            key={shot.id}
            cx={centerX + shotX}
            cy={centerY - shotY}
            r={Math.max(radius * 0.055, 3)}
            className={[
              styles.shot,
              highlighted ? styles.shotHighlighted : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              fill: targetColor,
            }}
          />
        );
      })}
    </>
  );
}