import styles from '../GlobalSceneView.module.scss';

export function SceneGrid({ gridLines, bounds }) {
  return (
    <g className={styles.grid}>
      {gridLines.horizontal.map((line) => (
        <line
          key={line.key}
          x1={bounds.minX}
          y1={line.y}
          x2={bounds.maxX}
          y2={line.y}
          className={styles.gridLine}
        />
      ))}

      {gridLines.vertical.map((line) => (
        <line
          key={line.key}
          x1={line.x}
          y1={bounds.minY}
          x2={line.x}
          y2={bounds.maxY}
          className={styles.gridLine}
        />
      ))}
    </g>
  );
}