export const CLUSTER_COLORS = [
  '#38bdf8',
  '#f472b6',
  '#a3e635',
  '#fbbf24',
  '#c084fc',
  '#fb7185',
  '#34d399',
  '#60a5fa',
];

export const MAX_ITERATIONS = 100;
export const CONVERGENCE_TOLERANCE = 1e-6;

export const clusterColor = (clusterIndex) =>
  CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length];