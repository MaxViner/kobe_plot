import styles from '../GlobalSceneView.module.scss';

const SERIES_COLORS = {
  A: '#38bdf8',
  B: '#f472b6',
};

const FALLBACK_COLORS = ['#38bdf8', '#f472b6'];

const getShotColor = (shot, index) => {
  if (shot.seriesId && SERIES_COLORS[shot.seriesId]) {
    return SERIES_COLORS[shot.seriesId];
  }

  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
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

  return (
    <>
      {shots.map((shot, index) => {
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
            cy={centerY + shotY}
            r={Math.max(radius * 0.055, 3)}
            className={[
              styles.shot,
              highlighted ? styles.shotHighlighted : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              fill: getShotColor(shot, index),
            }}
          />
        );
      })}
    </>
  );
}