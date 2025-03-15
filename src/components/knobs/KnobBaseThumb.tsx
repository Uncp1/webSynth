import clsx from 'clsx';
import { mapFrom01Linear } from '../../utils/math/map01ToLinear';
import styles from './knob.module.css';

type KnobBaseThumbProps = {
  readonly theme: 'stone' | 'pink' | 'green' | 'sky';
  readonly value01: number;
};

export function KnobBaseThumb({ theme, value01 }: KnobBaseThumbProps) {
  const angleMin = -145;
  const angleMax = 145;
  const angle = mapFrom01Linear(value01, angleMin, angleMax);
  return (
    <div
      className={clsx(
        styles.wrapper,
        theme === 'stone' && styles.stone,
        theme === 'pink' && styles.pink,
        theme === 'green' && styles.green,
        theme === 'sky' && styles.sky
      )}
    >
      <div
        className={styles.inner}
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div className={styles.line} />
      </div>
    </div>
  );
}
