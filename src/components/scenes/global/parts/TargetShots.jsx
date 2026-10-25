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

  return (
    <>
      {shots.map((shot, index) => (
        <circle
          key={shot.id}
          cx={target.centerX + shot.xLocal}
          cy={target.centerY + shot.yLocal}
          r={Math.max(radius * 0.055, 1)}
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
      ))}
    </>
  );
}