import { CsvUploader } from '../../components/data/csvuploader/CsvUploader.jsx';
import { TargetList } from '../../components/data/targetlist/TargetList.jsx';
import { Sidebar } from '../../components/layout/Sidebar.jsx';
import styles from './DatasetSidebarWidget.module.scss';

export function DatasetSidebarWidget({
  dataset,
  parsedDataset,
  selectedTargetId,
  hoveredTargetId,
  error,
  onLoadCsv,
  onLoadMock,
  onDownloadTemplate,
  onSelectTarget,
  onHoverTarget,
  onLeaveTarget,
}) {
  return (
    <Sidebar>
      <CsvUploader
        dataset={parsedDataset}
        onLoadCsv={onLoadCsv}
        onLoadMock={onLoadMock}
        onDownloadTemplate={onDownloadTemplate}
      />

      {error && <p className={styles.error}>{error}</p>}

      {dataset && (
        <TargetList
          targetIds={dataset.targetIds}
          selectedTargetId={selectedTargetId}
          hoveredTargetId={hoveredTargetId}
          onSelect={onSelectTarget}
          onHover={onHoverTarget}
          onLeave={onLeaveTarget}
        />
      )}
    </Sidebar>
  );
}