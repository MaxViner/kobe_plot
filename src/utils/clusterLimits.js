export const getClusterLimits = (shots, maxClusterSize) => {
  const totalShots = (shots ?? []).length;

  const safeMaxClusterSize = Math.max(
    1,
    Math.floor(Number(maxClusterSize) || 1),
  );

  const minClusterCount = Math.max(
    1,
    Math.ceil(totalShots / safeMaxClusterSize),
  );

  const maxClusterCount = Math.max(1, totalShots);

  return {
    totalShots,
    minClusterCount,
    maxClusterCount,
  };
};