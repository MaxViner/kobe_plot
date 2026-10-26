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
      <td>{shot.displayNumber}</td>
<td>{shot.displayAzimuth}</td>
<td>{shot.displayRange}</td>
<td>{shot.displayHeight}</td>
<td>{shot.displayLateral}</td>
    </tr>
  );
}