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
  // Round any input value to an integer
  const roundToInt = (value: number): number => Math.round(value);

  // Function to handle value changes and ensure they're integers
  const handleValueChange = (value: number) => {
    if (onValueRawChange) {
      onValueRawChange(roundToInt(value));
    }
  };

  // Function to format display value (makes sure it's an integer with no decimal)
  const valueRawDisplayFn = (x: number): string => Math.round(x).toString();

  // Step functions that ensure step size is always 1 for integer knobs
  const stepFn = () => 1;
  const stepLargerFn = () => 5; // Larger step for faster adjustment (e.g., 5 semitones)

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
