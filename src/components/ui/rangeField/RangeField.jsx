import styles from './RangeField.module.scss';

export function RangeField({ label, displayValue, ...props }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <strong>{displayValue}</strong>
      <input type="range" className={styles.range} {...props} />
    </label>
  );
}