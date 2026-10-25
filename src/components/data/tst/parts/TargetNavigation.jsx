import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../../ui/button/Button.jsx';
import styles from '../TargetShotsTable.module.scss';

export function TargetNavigation({
  targetId,
  currentIndex,
  totalCount,
  previousTargetId,
  nextTargetId,
  canGoPrevious,
  canGoNext,
  onBack,
  onSelectTarget,
}) {
  return (
    <div className={styles.navigation}>
      <Button
        size="sm"
        variant="ghost"
        onClick={onBack}
        aria-label="Вернуться к списку мишеней"
      >
        <ArrowLeft size={14} />
        Назад
      </Button>

      <span className={styles.navigationMeta}>
        Мишень {targetId} · {currentIndex + 1} из {totalCount}
      </span>

      <div className={styles.navigationActions}>
        <Button
          size="sm"
          variant="ghost"
          disabled={!canGoPrevious}
          onClick={() => onSelectTarget(previousTargetId)}
          aria-label="Предыдущая мишень"
        >
          <ArrowLeft size={14} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={!canGoNext}
          onClick={() => onSelectTarget(nextTargetId)}
          aria-label="Следующая мишень"
        >
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}