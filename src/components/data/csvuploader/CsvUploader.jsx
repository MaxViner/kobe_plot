import { Download, FileUp, FlaskConical } from 'lucide-react';
import { Button } from '../../ui/button/Button.jsx';
import { Card, CardHeader, CardTitle } from '../../ui/card/Card.jsx';
import { FileDropzone } from '../../ui/filedropzone/FileDropzone.jsx';
import { MetricRow } from '../../ui/metricrow/MetricRow.jsx';
import styles from './CsvUploader.module.scss';

export function CsvUploader({
  dataset,
  onLoadCsv,
  onLoadMock,
  onDownloadTemplate,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={<FileUp size={16} className={styles.icon} />}>
          Источник данных
        </CardTitle>

        <div className={styles.headerActions}>
          <Button size="sm" onClick={onDownloadTemplate}>
            <Download size={14} />
            Шаблон
          </Button>

          <Button size="sm" variant="primary" onClick={onLoadMock}>
            <FlaskConical size={14} />
            Тестовый набор
          </Button>
        </div>
      </CardHeader>

      <FileDropzone
        title="Перетащите CSV или нажмите для выбора"
        description="target_id, azimuth_deg, range_m; метаданные — # key=value"
        onFile={onLoadCsv}
      />

      {dataset && (
        <dl className={styles.metrics}>
          <MetricRow
            label="Источник"
            value={dataset.source === 'csv' ? 'CSV' : 'Mock'}
          />

          <MetricRow label="Точек" value={dataset.shots.length} />

          <MetricRow
            label="Сетка"
            value={`${dataset.metadata.gridRows ?? '?'} × ${
              dataset.metadata.gridCols ?? '?'
            }`}
          />

          <MetricRow
            label="Шаг сетки"
            value={`${dataset.metadata.dx.toFixed(2)} × ${
              dataset.metadata.dy.toFixed(2)
            } м`}
          />
        </dl>
      )}
    </Card>
  );
}