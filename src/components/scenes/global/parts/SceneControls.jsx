import { Maximize, Minus, Plus } from 'lucide-react';
import { Button } from '../../../ui/button/Button';
import styles from '../GlobalSceneView.module.scss';

export function SceneControls({ onZoomIn, onZoomOut, onReset }) {
  return (
    <div className={styles.controls}>
      <Button
        size="sm"
        variant="ghost"
        onClick={onZoomIn}
        aria-label="Приблизить"
      >
        <Plus size={14} />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={onZoomOut}
        aria-label="Отдалить"
      >
        <Minus size={14} />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={onReset}
        aria-label="Сбросить вид"
      >
        <Maximize size={14} />
      </Button>
    </div>
  );
}