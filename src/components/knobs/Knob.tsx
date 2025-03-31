import React from 'react';
import { KnobBase } from './KnobBase';

type KnobBaseProps = React.ComponentProps<typeof KnobBase>;

type KnobProps = Pick<
  KnobBaseProps,
  | 'valueMin'
  | 'valueMax'
  | 'onValueRawChange'
  | 'theme'
  | 'label'
  | 'orientation'
> & {
  /**
   * Начальное значение. Если не передано, используется valueMin.
   */
  valueDefault?: number;
};

export function Knob({
  valueMin,
  valueMax,
  onValueRawChange,
  valueDefault = valueMin,
  ...props
}: KnobProps) {
  // Функции шага: постоянный шаг в 0.1 и увеличенный шаг 1
  const stepFn = () => 0.1;
  const stepLargerFn = () => 1;

  // Функция округления не изменяет значение, поскольку форматирование происходит в valueRawDisplayFn
  const valueRawRoundFn = (x: number): number => x;

  // Форматирование значения с точностью до одной десятой
  const valueRawDisplayFn = (x: number): string => x.toFixed(1);

  // Линейное отображение из диапазона [valueMin, valueMax] в [0, 1]
  const mapTo01 = (x: number) => (x - valueMin) / (valueMax - valueMin);
  // Обратное отображение: из [0, 1] обратно в [valueMin, valueMax]
  const mapFrom01 = (x: number) => x * (valueMax - valueMin) + valueMin;

  return (
    <KnobBase
      valueDefault={valueDefault}
      valueMin={valueMin}
      valueMax={valueMax}
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={valueRawDisplayFn}
      mapTo01={mapTo01}
      mapFrom01={mapFrom01}
      onValueRawChange={onValueRawChange}
      {...props}
    />
  );
}
