export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export const degToRad = (degrees) => degrees * DEG_TO_RAD;
export const radToDeg = (radians) => radians * RAD_TO_DEG;

export const normalizeAngle = (angle) => {
  const normalized = angle % 360;

  return normalized < 0
    ? normalized + 360
    : normalized;
};

export const polarToLocal = (azimuthDeg, rangeM) => {
  if (!Number.isFinite(azimuthDeg) || !Number.isFinite(rangeM)) {
    throw new Error(
      'polarToLocal: azimuth_deg и range_m должны быть числами',
    );
  }

  if (rangeM < 0) {
    throw new Error(
      'polarToLocal: range_m не может быть отрицательным',
    );
  }

  const azimuthRad = degToRad(azimuthDeg);

  return {
    // X — высота (вверх).
    x: rangeM * Math.cos(azimuthRad),

    // Z — боковое отклонение.
    z: rangeM * Math.sin(azimuthRad),
  };
};

export const localToPolar = (x, y) => {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('localToPolar: x и y должны быть числами');
  }

  const rangeM = Math.hypot(x, y);
  const azimuthRad = Math.atan2(y, x);
  const azimuthDeg = (radToDeg(azimuthRad) + 360) % 360;

  return {
    azimuthDeg,
    rangeM,
  };
};

export const targetCenter = (row, col, metadata) => {
  if (
    !metadata ||
    !Number.isFinite(metadata.dx) ||
    !Number.isFinite(metadata.dy)
  ) {
    throw new Error(
      'targetCenter: metadata.dx и metadata.dy обязательны',
    );
  }

  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    throw new Error(
      'targetCenter: row и col должны быть целыми числами',
    );
  }

  return {
    x: col * metadata.dx,
    y: row * metadata.dy,
  };
};

export const toGlobalPoint = (row, col, localPoint, metadata) => {
  if (
    !localPoint ||
    !Number.isFinite(localPoint.x) ||
    !Number.isFinite(localPoint.z)
  ) {
    throw new Error(
      'toGlobalPoint: localPoint.x и localPoint.z обязательны',
    );
  }

  const center = targetCenter(row, col, metadata);

  return {
    // Z — вбок, поэтому X сцены.
    x: center.x + localPoint.z,

    // X — вверх, поэтому Y сцены.
    y: center.y + localPoint.x,
  };
};

export const computeBounds = (shots) => {
  if (!Array.isArray(shots) || shots.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 1,
      maxY: 1,
      width: 1,
      height: 1,
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const shot of shots) {
    if (
      !shot ||
      !Number.isFinite(shot.xGlobal) ||
      !Number.isFinite(shot.yGlobal)
    ) {
      continue;
    }

    minX = Math.min(minX, shot.xGlobal);
    minY = Math.min(minY, shot.yGlobal);
    maxX = Math.max(maxX, shot.xGlobal);
    maxY = Math.max(maxY, shot.yGlobal);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return {
      minX: 0,
      minY: 0,
      maxX: 1,
      maxY: 1,
      width: 1,
      height: 1,
    };
  }

  const paddingX = Math.max((maxX - minX) * 0.08, 0.25);
  const paddingY = Math.max((maxY - minY) * 0.08, 0.25);

  minX -= paddingX;
  minY -= paddingY;
  maxX += paddingX;
  maxY += paddingY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, Number.EPSILON),
    height: Math.max(maxY - minY, Number.EPSILON),
  };
};

export const transformDataset = (
  parsedDataset,
  metadataOverrides = {},
) => {
  if (!parsedDataset || !Array.isArray(parsedDataset.shots)) {
    throw new Error(
      'transformDataset: ожидается объект с массивом shots',
    );
  }

  const metadata = {
    ...parsedDataset.metadata,
    ...metadataOverrides,
  };

  const approachCourse = metadata.approachCourse ?? 270;

  const { shots } = parsedDataset;
  const targetsById = new Map();

  for (const sourceShot of shots) {
    // Единственная новая операция:
    // из исходного азимута вычитаем курс захода.
    const correctedAzimuth = normalizeAngle(
      sourceShot.azimuthDeg - approachCourse,
    );

    const local = polarToLocal(
      correctedAzimuth,
      sourceShot.rangeM,
    );

    const global = toGlobalPoint(
      sourceShot.targetRow,
      sourceShot.targetCol,
      local,
      metadata,
    );

      const shot = {
        ...sourceShot,

        azimuth: correctedAzimuth,
        relativeAzimuth: correctedAzimuth,
        range: sourceShot.rangeM,
        rLocal: sourceShot.rangeM,

        xLocal: local.x,
        zLocal: local.z,

        xGlobal: global.x,
        yGlobal: global.y,
      };

    const targetShots = targetsById.get(shot.targetId);

    if (targetShots) {
      targetShots.push(shot);
    } else {
      targetsById.set(shot.targetId, [shot]);
    }
  }

  for (const targetShots of targetsById.values()) {
    targetShots.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
  }

  const targetIds = [...targetsById.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  const allShots = [...targetsById.values()].flat();

  return {
    ...parsedDataset,
    metadata,
    shots: allShots,
    targetsById,
    targetIds,
    bounds: computeBounds(allShots),
  };
};