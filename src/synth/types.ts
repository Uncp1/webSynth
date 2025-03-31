import * as Tone from 'tone';

export type OscillatorType =
  | 'sine'
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'pulse'
  | 'pwm';

export type ModulationType = 'none' | 'hardsync' | 'ringmod';

export type EnvelopeDestination = 'vca2' | 'filter';

// Интерфейс для хука useAudioEngine (в TO DO)
export interface AudioEngineContextProps {
  synth1: Tone.PolySynth;
  synth2: Tone.PolySynth;
  filter: Tone.Filter;
  vca1: Tone.Volume;
  vca2: Tone.Volume;
  analyser: Tone.Analyser;
  filterEnvelope: Tone.Envelope;
  modulationNode: Tone.Gain | Tone.Multiply | null;
}
