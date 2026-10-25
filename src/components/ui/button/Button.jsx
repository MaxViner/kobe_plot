import styles from './Button.module.scss';

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}