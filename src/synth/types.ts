import * as Tone from 'tone';

// Определения типов для синтезатора
export type OscillatorType =
  | 'sine'
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'pulse'
  | 'pwm'
  | 'custom';

export type ModulationType = 'none' | 'hardsync' | 'ringmod' | 'fm';

export type EnvelopeDestination = 'vca2' | 'filter';

// Интерфейс для хука useAudioEngine
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

// Интерфейс для модуля осцилляторов
export interface OscillatorModuleProps {
  synth1: Tone.PolySynth;
  synth2: Tone.PolySynth;
  vcaSettings: any; // Используем any пока что для простоты, можно уточнить позже
}

// Интерфейс для модуля фильтра
export interface FilterModuleProps {
  filter: Tone.Filter;
  filterEnvelope: Tone.Envelope;
  filterEnvScaler: Tone.Gain;
  synth2: Tone.PolySynth;
  vcaSettings: any;
  filterSettings: any;
}

// Интерфейс для модуля модуляции
export interface ModulationModuleProps {
  synth1: Tone.PolySynth;
  synth2: Tone.PolySynth;
  vca1: Tone.Volume;
  vca2: Tone.Volume;
  filter: Tone.Filter;
  vcaSettings: any;
  modulationNodeRef: React.MutableRefObject<Tone.Gain | Tone.Multiply | null>;
}

// Состояние активных нот
export interface ActiveNotesState {
  activeNotes: Set<string>;
}
