import styles from '../TargetShotsTable.module.scss';

export function TargetTableFooter({ shotCount }) {
  return (
    <tfoot className={styles.tableFooter}>
      <tr>
        <td colSpan={5}>
          Всего выстрелов: {shotCount}
        </td>
      </tr>
    </tfoot>
  );
}