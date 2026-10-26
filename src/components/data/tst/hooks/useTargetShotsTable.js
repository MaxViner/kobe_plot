import { useMemo } from 'react';

const formatNumber = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return value.toFixed(3);
};

const formatAzimuth = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return `${value.toFixed(1)}°`;
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

        displayAzimuth: formatAzimuth(
          shot.azimuth ?? shot.relativeAzimuth ?? shot.azimuthDeg,
        ),

        displayRange: formatNumber(
          shot.rangeM ?? shot.range,
        ),

        displayHeight: formatNumber(shot.xLocal),

        displayLateral: formatNumber(shot.zLocal),
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