import { useId, useState } from 'react';
import {
  KnobHeadless,
  KnobHeadlessLabel,
  KnobHeadlessOutput,
  useKnobKeyboardControls,
} from 'react-knob-headless';
import { KnobBaseThumb } from './KnobBaseThumb';
import { mapFrom01Linear, mapTo01Linear } from '../../utils/math/map01ToLinear';
import styles from './knob.module.css';

type KnobHeadlessProps = React.ComponentProps<typeof KnobHeadless>;
type KnobBaseThumbProps = React.ComponentProps<typeof KnobBaseThumb>;
type KnobBaseProps = Pick<
  KnobHeadlessProps,
  | 'valueMin'
  | 'valueMax'
  | 'valueRawRoundFn'
  | 'valueRawDisplayFn'
  | 'orientation'
  | 'mapTo01'
  | 'mapFrom01'
  | 'onValueRawChange'
> &
  Pick<KnobBaseThumbProps, 'theme'> & {
    readonly label: string;
    readonly valueDefault: number;
    readonly stepFn: (valueRaw: number) => number;
    readonly stepLargerFn: (valueRaw: number) => number;
  };

export function KnobBase({
  theme,
  label,
  valueDefault,
  valueMin,
  valueMax,
  valueRawRoundFn,
  onValueRawChange,
  valueRawDisplayFn,
  orientation,
  stepFn,
  stepLargerFn,
  mapTo01 = mapTo01Linear,
  mapFrom01 = mapFrom01Linear,
}: KnobBaseProps) {
  const knobId = useId();
  const labelId = useId();
  const [valueRaw, setValueRaw] = useState<number>(valueDefault);
  const value01 = mapTo01(valueRaw, valueMin, valueMax);
  const step = stepFn(valueRaw);
  const stepLarger = stepLargerFn(valueRaw);
  const dragSensitivity = 0.006;

  // Обработчик, который обновляет локальное состояние и вызывает переданный колбэк (если есть)
  const handleValueRawChange = (newValue: number) => {
    setValueRaw(newValue);
    if (onValueRawChange) {
      onValueRawChange(newValue);
    }
  };

  const keyboardControlHandlers = useKnobKeyboardControls({
    valueRaw,
    valueMin,
    valueMax,
    step,
    stepLarger,
    onValueRawChange: handleValueRawChange,
  });

  return (
    <div className={styles.container}>
      <KnobHeadlessLabel id={labelId}>{label}</KnobHeadlessLabel>
      <KnobHeadless
        id={knobId}
        aria-labelledby={labelId}
        className="relative w-16 h-16 outline-none"
        valueMin={valueMin}
        valueMax={valueMax}
        valueRaw={valueRaw}
        valueRawRoundFn={valueRawRoundFn}
        valueRawDisplayFn={valueRawDisplayFn}
        dragSensitivity={dragSensitivity}
        orientation={orientation}
        mapTo01={mapTo01}
        mapFrom01={mapFrom01}
        onValueRawChange={handleValueRawChange}
        {...keyboardControlHandlers}
      >
        <KnobBaseThumb theme={theme} value01={value01} />
      </KnobHeadless>
      <KnobHeadlessOutput htmlFor={knobId}>
        {valueRawDisplayFn(valueRaw)}
      </KnobHeadlessOutput>
    </div>
  );
}
