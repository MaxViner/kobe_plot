import Papa from 'papaparse';
import { toGlobalPoint } from '../../math/coordinates';

const MOCK_METADATA = {
  dx: 2,
  dy: 2,
  targetRadiusM: 0.35,
  shotsPerTarget: 24,
  lineNumbers: [240, 241, 242],
  targetsPerLine: 4,
};

const CLUSTERS = [
  {
    seriesId: 'A',
    offsetX: -0.28,
    offsetY: -0.04,
    sigma: 0.09,
  },
  {
    seriesId: 'B',
    offsetX: 0.32,
    offsetY: 0.06,
    sigma: 0.13,
  },
];

const gaussianRandom = () => {
  let u1 = Math.random();
  let u2 = Math.random();

  if (u1 === 0) u1 = Number.EPSILON;
  if (u2 === 0) u2 = Number.EPSILON;

  return (
    Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  );
};

const createTargetId = (lineNumber, targetNumber) =>
  `${lineNumber}-${targetNumber}`;

const createShot = ({
  lineNumber,
  targetNumber,
  targetId,
  row,
  col,
  index,
  metadata,
}) => {
  const cluster = CLUSTERS[index % CLUSTERS.length];
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.03 + Math.abs(gaussianRandom()) * cluster.sigma;

  const local = {
    x: cluster.offsetX + Math.cos(angle) * radius,
    y: cluster.offsetY + Math.sin(angle) * radius * 0.8,
  };

  const global = toGlobalPoint(row, col, local, metadata);
  const azimuthRad = Math.atan2(local.x, local.y);
  const azimuthDeg = ((azimuthRad * 180) / Math.PI + 360) % 360;
  const rangeM = Math.hypot(local.x, local.y);

  return {
    id: `${targetId}-${index + 1}`,
    targetId,
    lineNumber,
    targetNumber,
    targetRow: row,
    targetCol: col,
    azimuthDeg,
    rangeM,
    xLocal: local.x,
    yLocal: local.y,
    xGlobal: global.x,
    yGlobal: global.y,
    seriesId: cluster.seriesId,
    timestamp: new Date(Date.UTC(2026, 0, 1, 10, 0, index)).toISOString(),
  };
};

export const createMockDataset = () => {
  const metadata = {
    dx: MOCK_METADATA.dx,
    dy: MOCK_METADATA.dy,
    targetRadiusM: MOCK_METADATA.targetRadiusM,
    shotsPerTarget: MOCK_METADATA.shotsPerTarget,
    gridRows: MOCK_METADATA.lineNumbers.length,
    gridCols: MOCK_METADATA.targetsPerLine,
  };

  const shots = [];

  MOCK_METADATA.lineNumbers.forEach((lineNumber, row) => {
    for (let targetIndex = 0; targetIndex < metadata.gridCols; targetIndex += 1) {
      const targetNumber = targetIndex + 1;
      const targetId = createTargetId(lineNumber, targetNumber);

      for (let index = 0; index < metadata.shotsPerTarget; index += 1) {
        shots.push(
          createShot({
            lineNumber,
            targetNumber,
            targetId,
            row,
            col: targetIndex,
            index,
            metadata,
          }),
        );
      }
    }
  });

  return {
    metadata,
    shots,
    issues: [],
    source: 'mock',
    fileName: 'mock-ballistics.csv',
  };
};

export const createCsvTemplate = () => {
  const rows = [
    {
      line_number: 240,
      target_number: 1,
      target_id: '240-1',
      azimuth_deg: 10,
      range_m: 0.12,
      series_id: 'A',
      timestamp: '2026-01-01T10:00:00Z',
    },
    {
      line_number: 240,
      target_number: 2,
      target_id: '240-2',
      azimuth_deg: 190,
      range_m: 0.18,
      series_id: 'B',
      timestamp: '2026-01-01T10:00:05Z',
    },
    {
      line_number: 241,
      target_number: 1,
      target_id: '241-1',
      azimuth_deg: 45,
      range_m: 0.22,
      series_id: 'A',
      timestamp: '2026-01-01T10:01:00Z',
    },
  ];

  const metadataComments = [
    `# dx=${MOCK_METADATA.dx}`,
    `# dy=${MOCK_METADATA.dy}`,
    `# target_radius_m=${MOCK_METADATA.targetRadiusM}`,
    `# shots_per_target=${MOCK_METADATA.shotsPerTarget}`,
  ];

  const csvBody = Papa.unparse(rows, {
    header: true,
    delimiter: ',',
    newline: '\n',
  });

  return [...metadataComments, csvBody].join('\n');
};

export const downloadCsvTemplate = () => {
  const csv = createCsvTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'ballistics-template.csv';
  link.click();

  URL.revokeObjectURL(url);
};