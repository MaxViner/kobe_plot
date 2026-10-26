import styles from '../StatisticsScene.module.scss';

const formatMeters = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return `${value.toFixed(3)} м`;
};

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
              <th scope="col">Средняя высота X</th>
              <th scope="col">Среднее боковое Z</th>
              <th scope="col">СКО высоты X</th>
              <th scope="col">СКО бокового Z</th>
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

                <td>{formatMeters(row.meanX)}</td>
                <td>{formatMeters(row.meanZ)}</td>

                <td>{formatMeters(row.stdDevX)}</td>
                <td>{formatMeters(row.stdDevZ)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}