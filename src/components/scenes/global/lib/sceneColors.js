export const SERIES_COLORS = {
  A: '#38bdf8',
  B: '#f472b6',
};

export const FALLBACK_COLORS = ['#38bdf8', '#f472b6'];

export const getShotColor = (shot, index) => {
  if (shot.seriesId && SERIES_COLORS[shot.seriesId]) {
    return SERIES_COLORS[shot.seriesId];
  }

  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};