import { useCallback, useRef, useState } from 'react';
import styles from './FileDropzone.module.scss';

export function FileDropzone({ title, description, onFile, accept = '.csv,text/csv' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') openPicker();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[styles.zone, dragging ? styles.dragging : '']
        .filter(Boolean)
        .join(' ')}
    >
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className={styles.input}
        onChange={(event) => {
          const file = event.target.files[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}