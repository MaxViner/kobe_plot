import styles from './Sidebar.module.scss';

export function Sidebar({ children, className = '' }) {
  return (
    <aside
      aria-label="Панель управления данными"
      className={[styles.sidebar, className].filter(Boolean).join(' ')}
    >
      {children}
    </aside>
  );
}