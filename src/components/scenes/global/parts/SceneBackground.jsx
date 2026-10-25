import styles from '../GlobalSceneView.module.scss';

export function SceneBackground() {
  return (
    <>
      <defs>
        <filter
          id="target-hover-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="6"
            result="blurredShape"
          />

          <feMerge>
            <feMergeNode in="blurredShape" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        width="1000"
        height="700"
        className={styles.background}
      />
    </>
  );
}