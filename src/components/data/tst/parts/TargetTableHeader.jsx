import { Table2 } from 'lucide-react';
import styles from '../TargetShotsTable.module.scss';

export function TargetTableHeader({ targetId, shotCount }) {
  return (
    <header className={styles.tableHeader}>
      <h3 className={styles.tableTitle}>
        <Table2 size={16} />
        Выстрелы мишени {targetId}
      </h3>

      <span className={styles.tableMeta}>
        {shotCount} точек
      </span>
    </header>
  );
}