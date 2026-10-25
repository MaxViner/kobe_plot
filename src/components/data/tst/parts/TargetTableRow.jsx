import styles from '../TargetShotsTable.module.scss';

export function TargetTableRow({
  shot,
  isHovered,
  onHoverShot,
  onLeaveShot,
}) {
  return (
    <tr
      className={[
        styles.tableRow,
        isHovered ? styles.tableRowHovered : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onHoverShot(shot.id)}
      onMouseLeave={onLeaveShot}
    >
      <td className={styles.tableCell}>
        {shot.displayNumber}
      </td>

      <td className={styles.tableCell}>
        {shot.displayAzimuth}
      </td>

      <td className={styles.tableCell}>
        {shot.displayRange}
      </td>

      <td className={styles.tableCell}>
        {shot.displayX}
      </td>

      <td className={styles.tableCell}>
        {shot.displayY}
      </td>
    </tr>
  );
}