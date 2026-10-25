import styles from './MetricRow.module.scss';

export function MetricRow({ label, value }) {
  return (
    <div className={styles.row}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}