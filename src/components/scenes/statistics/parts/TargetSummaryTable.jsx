import styles from '../StatisticsScene.module.scss';

const formatMeters = (value) => `${value.toFixed(3)} м`;

export function TargetSummaryTable({
  statistics,
  selectedTargetId,
  onSelectTarget,
}) {
  return (
    <section className={styles.tableSection}>
      <h2 className={styles.tableTitle}>
        Сводка по мишеням
      </h2>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>
            Общие статистические показатели всех мишеней
          </caption>

          <thead>
            <tr>
              <th scope="col">Мишень</th>
              <th scope="col">Точек</th>
              <th scope="col">Кластеров</th>
              <th scope="col">Среднее X</th>
              <th scope="col">Среднее Y</th>
              <th scope="col">СКО X</th>
              <th scope="col">СКО Y</th>
            </tr>
          </thead>

          <tbody>
            {statistics.map((row) => (
              <tr
                key={row.targetId}
                className={[
                  styles.tableRow,
                  row.targetId === selectedTargetId
                    ? styles.tableRowSelected
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectTarget(row.targetId)}
              >
                <th scope="row" className={styles.targetCell}>
                  {row.targetId}
                </th>

                <td>{row.shotCount}</td>
                <td>{row.clusterCount}</td>
                <td>{formatMeters(row.meanX)}</td>
                <td>{formatMeters(row.meanY)}</td>
                <td>{formatMeters(row.stdDevX)}</td>
                <td>{formatMeters(row.stdDevY)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}