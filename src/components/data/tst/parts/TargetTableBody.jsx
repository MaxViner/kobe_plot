import { TargetTableRow } from './TargetTableRow.jsx';
import styles from '../TargetShotsTable.module.scss';

export function TargetTableBody({
  shots,
  hoveredShotId,
  onHoverShot,
  onLeaveShot,
}) {
  if (shots.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className={styles.emptyState}>
            Нет выстрелов для этой мишени
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {shots.map((shot) => (
        <TargetTableRow
          key={shot.id}
          shot={shot}
          isHovered={shot.id === hoveredShotId}
          onHoverShot={onHoverShot}
          onLeaveShot={onLeaveShot}
        />
      ))}
    </tbody>
  );
}