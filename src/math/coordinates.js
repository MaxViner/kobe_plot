export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export const degToRad = (degrees) => degrees * DEG_TO_RAD;

export const radToDeg = (radians) => radians * RAD_TO_DEG;

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
    x: rangeM * Math.sin(azimuthRad),
    y: rangeM * Math.cos(azimuthRad),
  };
};

export const localToPolar = (x, y) => {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('localToPolar: x и y должны быть числами');
  }

  const rangeM = Math.hypot(x, y);
  const azimuthRad = Math.atan2(x, y);
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
    !Number.isFinite(localPoint.y)
  ) {
    throw new Error(
      'toGlobalPoint: localPoint.x и localPoint.y обязательны',
    );
  }

  const center = targetCenter(row, col, metadata);

  return {
    x: center.x + localPoint.x,
    y: center.y + localPoint.y,
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

export const transformDataset = (parsedDataset) => {
  if (!parsedDataset || !Array.isArray(parsedDataset.shots)) {
    throw new Error(
      'transformDataset: ожидается объект с массивом shots',
    );
  }

  const { metadata, shots } = parsedDataset;
  const targetsById = new Map();

  for (const sourceShot of shots) {
    const local = polarToLocal(
      sourceShot.azimuthDeg,
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

      azimuth: sourceShot.azimuthDeg,
      range: sourceShot.rangeM,
      rLocal: sourceShot.rangeM,

      xLocal: local.x,
      yLocal: local.y,
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

  return {
    ...parsedDataset,
    shots: [...targetsById.values()].flat(),
    targetsById,
    targetIds,
    bounds: computeBounds([...targetsById.values()].flat()),
  };
};