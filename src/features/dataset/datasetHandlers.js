import { createMockDataset, downloadCsvTemplate } from '../csv/csvMock';
import { parseBallisticsCsv } from '../../features/csv/csvParser';

export const createLoadCsvHandler =
  (onDataset, onError) =>
  async (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onError('Поддерживаются только CSV-файлы.');
      return;
    }

    try {
      const text = await file.text();
      const dataset = parseBallisticsCsv(text, file.name);

      if (dataset.shots.length === 0) {
        onError('Файл не содержит валидных измерений.');
        return;
      }

      onDataset(dataset);
    } catch {
      onError('Не удалось прочитать CSV-файл.');
    }
  };

export const createLoadMockHandler =
  (onDataset) =>
  () => {
    onDataset(createMockDataset());
  };

export const createDownloadTemplateHandler =
  () =>
  () => {
    downloadCsvTemplate();
  };