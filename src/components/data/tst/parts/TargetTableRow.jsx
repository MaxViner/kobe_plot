import styles from '../TargetShotsTable.module.scss';

const formatAzimuth = (value) => {
  if (value === null || value === undefined) {
    return '—';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return `${Math.round(numericValue)}°`;
};

const formatCoordinate = (value) => {
  if (value === null || value === undefined) {
    return '—';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue.toFixed(2);
};

export function TargetTableRow({
  shot,
  isHovered,
  onHoverShot,
  onLeaveShot,
}) {
  const number =
    shot.number ??
    shot.shotNumber ??
    '—';

  const azimuthValue =
    shot.azimuth ??
    shot.azimuthWithCourse ??
    shot.azimuthFormatted ??
    null;

  const rangeValue =
    shot.range ??
    shot.distance ??
    shot.rangeFormatted ??
    null;

  const xValue =
    shot.x ??
    shot.xLocal ??
    shot.xFormatted ??
    shot.xMeters ??
    null;

  const zValue =
    shot.z ??
    shot.zLocal ??
    shot.zFormatted ??
    shot.zMeters ??
    null;

  return (
    <tr
      className={[
        styles.row,
        isHovered ? styles.rowHovered : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onHoverShot?.(shot.id)}
      onMouseLeave={() => onLeaveShot?.()}
    >
      <td>{number}</td>
      <td>{formatAzimuth(azimuthValue)}</td>
      <td>{formatCoordinate(rangeValue)}</td>
      <td>{formatCoordinate(xValue)}</td>
      <td>{formatCoordinate(zValue)}</td>
    </tr>
  );
}