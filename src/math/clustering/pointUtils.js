export const isValidPoint = (point) =>
  Boolean(point) &&
  typeof point.x === 'number' &&
  typeof point.y === 'number' &&
  Number.isFinite(point.x) &&
  Number.isFinite(point.y);

export const calculateDistanceSquared = (point, centroid) => {
  const deltaX = point.x - centroid.x;
  const deltaY = point.y - centroid.y;

  return deltaX * deltaX + deltaY * deltaY;
};

export const calculateMean = (values) => {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
};

export const normalizeClusterCount = (
  clusterCount,
  pointsLength,
) => {
  const parsedCount = Number(clusterCount);

  const safeCount =
    Number.isFinite(parsedCount) && parsedCount >= 1
      ? Math.floor(parsedCount)
      : 2;

  return Math.max(
    1,
    Math.min(safeCount, pointsLength || 1),
  );
};