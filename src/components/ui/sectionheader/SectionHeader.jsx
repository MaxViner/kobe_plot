import styles from './SectionHeader.module.scss';

export function SectionHeader({
  icon,
  title,
  meta,
  action,
  className = '',
}) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      <div className={styles.leading}>
        {icon && <span className={styles.icon}>{icon}</span>}

        <h2 className={styles.title}>{title}</h2>
      </div>

      {(meta || action) && (
        <div className={styles.trailing}>
          {meta && <span className={styles.meta}>{meta}</span>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
    </header>
  );
}