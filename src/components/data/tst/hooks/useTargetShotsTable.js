import { useMemo } from 'react';

const formatNumber = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return value.toFixed(3);
};

const getCoordinate = (shot, primary, fallback) => {
  const value = shot?.[primary] ?? shot?.[fallback];

  return typeof value === 'number' ? value : null;
};

export function useTargetShotsTable({ shots, targetIds, targetId }) {
  const currentIndex = targetIds.indexOf(targetId);

  const previousTargetId =
    currentIndex > 0 ? targetIds[currentIndex - 1] : null;

  const nextTargetId =
    currentIndex >= 0 && currentIndex < targetIds.length - 1
      ? targetIds[currentIndex + 1]
      : null;

  const formattedShots = useMemo(
  () =>
    (shots ?? []).map((shot, index) => ({
      ...shot,
      displayNumber: index + 1,
      displayAzimuth:
        typeof shot.azimuth === 'number'
          ? `${shot.azimuth.toFixed(1)}°`
          : '—',
      displayRange:
        typeof shot.range === 'number'
          ? `${shot.range.toFixed(3)} м`
          : '—',
      displayX:
        typeof shot.xLocal === 'number'
          ? `${shot.xLocal.toFixed(3)} м`
          : '—',
      displayY:
        typeof shot.yLocal === 'number'
          ? `${shot.yLocal.toFixed(3)} м`
          : '—',
    })),
  [shots],
);

  return {
    currentIndex,
    previousTargetId,
    nextTargetId,
    formattedShots,
    canGoPrevious: previousTargetId !== null,
    canGoNext: nextTargetId !== null,
  };
}