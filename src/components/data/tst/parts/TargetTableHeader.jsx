import { Crosshair  } from 'lucide-react';
import styles from '../TargetShotsTable.module.scss';

export function TargetTableHeader({ targetId, shotCount }) {
  return (
    <header className={styles.tableHeader}>
      <h3 className={styles.tableTitle}>
        <Crosshair  size={24} />
        Выстрелы мишени {targetId}
      </h3>

      <span className={styles.tableMeta}>
        {shotCount} точек
      </span>
    </header>
  );
}