import React from 'react';
import { KnobBase } from './KnobBase';

type KnobBaseProps = React.ComponentProps<typeof KnobBase>;

type SteppedKnobProps = Pick<
  KnobBaseProps,
  | 'valueMin'
  | 'valueMax'
  | 'onValueRawChange'
  | 'theme'
  | 'label'
  | 'orientation'
  | 'valueDefault'
>;

export function SteppedKnob({
  valueMin,
  valueMax,
  onValueRawChange,
  valueDefault = valueMin,
  ...props
}: SteppedKnobProps) {
  const roundToInt = (value: number): number => Math.round(value);

  const handleValueChange = (value: number) => {
    if (onValueRawChange) {
      onValueRawChange(roundToInt(value));
    }
  };

  const valueRawDisplayFn = (x: number): string => Math.round(x).toString();

  const stepFn = () => 1;
  const stepLargerFn = () => 5;

  return (
    <KnobBase
      valueDefault={roundToInt(valueDefault)}
      valueMin={valueMin}
      valueMax={valueMax}
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueRawRoundFn={roundToInt}
      valueRawDisplayFn={valueRawDisplayFn}
      onValueRawChange={handleValueChange}
      {...props}
    />
  );
}
