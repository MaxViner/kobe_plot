import Papa from 'papaparse';
import { polarToLocal, toGlobalPoint } from '../../math/coordinates';

const METADATA_KEYS = new Set([
  'dx',
  'dy',
  'grid_cols',
  'grid_rows',
  'shots_per_target',
  'target_radius_m',
]);

const normalizeHeader = (header) =>
  String(header ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const parseFiniteNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const parsePositiveInteger = (value) => {
  const parsedValue = parseFiniteNumber(value);

  if (parsedValue === null || !Number.isInteger(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const extractMetadataAndCsv = (csvText) => {
  const metadata = {};
  const dataLines = [];

  csvText.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine.startsWith('#')) {
      dataLines.push(line);
      return;
    }

    const withoutComment = trimmedLine.replace(/^#+\s*/, '');

    const separatorIndexes = [
      withoutComment.indexOf('='),
      withoutComment.indexOf(':'),
    ].filter((index) => index >= 0);

    if (separatorIndexes.length === 0) {
      return;
    }

    const separatorIndex = Math.min(...separatorIndexes);
    const key = normalizeHeader(
      withoutComment.slice(0, separatorIndex),
    );
    const rawValue = withoutComment.slice(separatorIndex + 1);
    const value = parseFiniteNumber(rawValue);

    if (!METADATA_KEYS.has(key) || value === null) {
      return;
    }

    metadata[key] = value;
  });

  return {
    metadata,
    csv: dataLines.join('\n'),
  };
};

const resolveMetadata = (headerMetadata, shots) => {
  const metadata = {
    dx: headerMetadata.dx ?? 1,
    dy: headerMetadata.dy ?? headerMetadata.dx ?? 1,
    gridCols: headerMetadata.grid_cols ?? null,
    gridRows: headerMetadata.grid_rows ?? null,
    shotsPerTarget: headerMetadata.shots_per_target ?? null,
    targetRadiusM: headerMetadata.target_radius_m ?? 0.3,
  };

  if (metadata.gridCols === null && shots.length > 0) {
    metadata.gridCols =
      Math.max(...shots.map((shot) => shot.targetCol)) + 1;
  }

  if (metadata.gridRows === null && shots.length > 0) {
    metadata.gridRows =
      Math.max(...shots.map((shot) => shot.targetRow)) + 1;
  }

  if (metadata.targetRadiusM <= 0) {
    metadata.targetRadiusM = 0.3;
  }

  return metadata;
};

const createTargetId = (lineNumber, targetNumber) =>
  `${lineNumber}-${targetNumber}`;

export const parseBallisticsCsv = (csvText, fileName) => {
  const defaultMetadata = {
    dx: 1,
    dy: 1,
    gridCols: null,
    gridRows: null,
    shotsPerTarget: null,
    targetRadiusM: 0.3,
  };

  if (typeof csvText !== 'string' || csvText.trim() === '') {
    return {
      metadata: defaultMetadata,
      shots: [],
      issues: [
        {
          row: 0,
          message: 'CSV-файл пуст или не содержит текста',
        },
      ],
      source: 'csv',
      fileName,
    };
  }

  const { metadata: headerMetadata, csv } =
    extractMetadataAndCsv(csvText);

  const issues = [];

  const parseResult = Papa.parse(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
    transform: (value) =>
      typeof value === 'string' ? value.trim() : value,
  });

  const shots = [];

  parseResult.data.forEach((row, index) => {
    const rowNumber = index + 2;

    const declaredTargetId =
      String(row.target_id ?? row.target ?? '').trim();

    const azimuthDeg = parseFiniteNumber(
      row.azimuth_deg ?? row.azimuth,
    );

    const rangeM = parseFiniteNumber(row.range_m ?? row.range);

    if (azimuthDeg === null) {
      issues.push({
        row: rowNumber,
        message:
          'Некорректное или отсутствующее значение azimuth / azimuth_deg',
      });
      return;
    }

    if (azimuthDeg < 0 || azimuthDeg >= 360) {
      issues.push({
        row: rowNumber,
        message: `Некорректный азимут ${azimuthDeg}: ожидается значение от 0 до 360`,
      });
      return;
    }

    if (rangeM === null) {
      issues.push({
        row: rowNumber,
        message:
          'Некорректное или отсутствующее значение range / range_m',
      });
      return;
    }

    if (rangeM < 0) {
      issues.push({
        row: rowNumber,
        message: 'Отрицательная дальность range_m',
      });
      return;
    }

    let lineNumber = parsePositiveInteger(row.line_number);
    let targetNumber = parsePositiveInteger(row.target_number);

    // Новый формат: target_id вида "240-6".
    if (
      lineNumber === null &&
      targetNumber === null &&
      declaredTargetId
    ) {
      const targetIdParts = declaredTargetId.split('-');

      if (targetIdParts.length >= 2) {
        const parsedLineNumber = parsePositiveInteger(
          targetIdParts[0],
        );

        const parsedTargetNumber = parsePositiveInteger(
          targetIdParts[1],
        );

        if (
          parsedLineNumber !== null &&
          parsedTargetNumber !== null
        ) {
          lineNumber = parsedLineNumber;
          targetNumber = parsedTargetNumber;
        }
      }
    }

    if (lineNumber === null || lineNumber < 0) {
      issues.push({
        row: rowNumber,
        message:
          'Некорректный line_number: ожидается целое число или target_id вида "240-6"',
      });
      return;
    }

    if (targetNumber === null || targetNumber < 1) {
      issues.push({
        row: rowNumber,
        message:
          'Некорректный target_number: ожидается целое число от 1 или target_id вида "240-6"',
      });
      return;
    }

    const targetId = createTargetId(lineNumber, targetNumber);

    if (declaredTargetId && declaredTargetId !== targetId) {
      issues.push({
        row: rowNumber,
        message: `target_id "${declaredTargetId}" не совпадает с line_number/target_number. Ожидался: "${targetId}"`,
      });
      return;
    }

    const targetRow = lineNumber;
    const targetCol = targetNumber - 1;

    const provisionalMetadata = {
      dx: headerMetadata.dx ?? 1,
      dy: headerMetadata.dy ?? headerMetadata.dx ?? 1,
    };

    const local = polarToLocal(azimuthDeg, rangeM);

    const global = toGlobalPoint(
      targetRow,
      targetCol,
      local,
      provisionalMetadata,
    );

    shots.push({
      id:
        String(row.shot_id ?? '').trim() ||
        `${targetId}-${rowNumber}`,

      targetId,
      lineNumber,
      targetNumber,
      targetRow,
      targetCol,

      azimuthDeg,
      rangeM,

      xLocal: local.x,
      yLocal: local.y,
      xGlobal: global.x,
      yGlobal: global.y,

      seriesId:
        row.series_id === undefined || row.series_id === null
          ? undefined
          : String(row.series_id),

      timestamp:
        typeof row.timestamp === 'string' && row.timestamp
          ? row.timestamp
          : undefined,
    });
  });

  parseResult.errors.forEach((error) => {
    issues.push({
      row: error.row ?? 0,
      message: `Ошибка CSV: ${error.message}`,
    });
  });

  if (shots.length === 0) {
    issues.push({
      row: 0,
      message: 'Не найдено ни одной валидной записи',
    });
  }

  const metadata = resolveMetadata(headerMetadata, shots);

  return {
    metadata,
    shots,
    issues,
    source: 'csv',
    fileName,
  };
};