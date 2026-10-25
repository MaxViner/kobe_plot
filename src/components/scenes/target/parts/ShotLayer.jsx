import { clusterColor } from '../../../../math/clustering.js';
import styles from '../TargetDetailView.module.scss';

const NORMAL_SHOT_RADIUS = 3.2;
const HOVERED_SHOT_RADIUS = 5.5;

export function ShotLayer({
  shots,
  clusterByShotId,
  hoveredShotId,
  toScreen,
}) {
  return (
    <>
      {shots.map((shot) => {
        const point = toScreen(shot.xLocal, shot.yLocal);
        const clusterIndex = clusterByShotId.get(shot.id) ?? 0;
        const isHovered = shot.id === hoveredShotId;

        return (
          <circle
            key={shot.id}
            cx={point.x}
            cy={point.y}
            r={isHovered ? HOVERED_SHOT_RADIUS : NORMAL_SHOT_RADIUS}
            className={[
              styles.shot,
              isHovered ? styles.shotHovered : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              fill: clusterColor(clusterIndex),
            }}
          />
        );
      })}
    </>
  );
}