import { List } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../ui/card/Card.jsx';
import styles from './TargetList.module.scss';

export function TargetList({
  targetIds,
  selectedTargetId,
  hoveredTargetId,
  onSelect,
  onHover,
  onLeave,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={<List size={16} className={styles.icon} />}>
          Мишени
        </CardTitle>

        <span className={styles.counter}>{targetIds.length}</span>
      </CardHeader>

      {targetIds.length === 0 ? (
        <p className={styles.empty}>Нет доступных мишеней.</p>
      ) : (
        <div
          role="listbox"
          aria-label="Список мишеней"
          className={styles.list}
          onMouseLeave={onLeave}
        >
          {targetIds.map((targetId) => {
            const isSelected = targetId === selectedTargetId;
            const isHovered = targetId === hoveredTargetId;

            return (
              <button
                key={targetId}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={[
                  styles.item,
                  isSelected ? styles.selected : '',
                  isHovered ? styles.hovered : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(targetId)}
                onMouseEnter={() => onHover(targetId)}
                onFocus={() => onHover(targetId)}
              >
                <span className={styles.marker} />
                {targetId}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}