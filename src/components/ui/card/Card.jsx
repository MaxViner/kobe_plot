import styles from './Card.module.scss';

export function Card({ children, className = '', padded = true, ...props }) {
  return (
    <section
      className={[styles.card, padded ? styles.padded : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardTitle({ icon, children }) {
  return (
    <h2 className={styles.title}>
      {icon}
      {children}
    </h2>
  );
}