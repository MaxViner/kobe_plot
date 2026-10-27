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

      </CardHeader>

      <FileDropzone
        title="Перетащите CSV или нажмите для выбора"
        description="target_id, azimuth_deg, range_m; метаданные — # key=value"
        onFile={onLoadCsv}
      />
    </Card>
  );
}