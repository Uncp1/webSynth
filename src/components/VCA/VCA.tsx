import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';

import styles from './VCA.module.css';
import { Knob } from '../knobs/Knob';
import { updateVCASettings } from '../../store/vcaSettingsSlice';

// VCA1 Component for the first synthesizer
export const VCA1: React.FC = () => {
  const synthSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  // Main oscillator handlers
  const handleDetuneChange = (newValue: number) => {
    dispatch(updateVCASettings({ detune1: newValue }));
  };

  const handleOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Restrict to valid values
    const value = event.target.value as
      | 'sine'
      | 'square'
      | 'triangle'
      | 'sawtooth'
      | 'fatsawtooth'
      | 'fattriangle'
      | 'fatsquare';
    dispatch(updateVCASettings({ oscillator1Type: value }));
  };

  // Envelope handlers
  const handleEnvelopeAttackChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope1Attack: newValue }));
  };

  const handleEnvelopeDecayChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope1Decay: newValue }));
  };

  const handleEnvelopeSustainChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope1Sustain: newValue }));
  };

  const handleEnvelopeReleaseChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope1Release: newValue }));
  };

  // Volume handler
  const handleVolumeChange = (newValue: number) => {
    dispatch(updateVCASettings({ vca1Volume: newValue }));
  };

  return (
    <div className={styles.synthSettings}>
      <h2 className={styles.synthSettings__title}>VCA 1 Controls</h2>
      <div className={styles.synthSettings__controls}>
        <div className={styles.synthSettings__control}>
          <label htmlFor="oscillator1Type">Oscillator Type</label>
          <select
            id="oscillator1Type"
            value={synthSettings.oscillator1Type}
            onChange={handleOscillatorTypeChange}
          >
            <option value="sawtooth">Sawtooth</option>
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="square">Square</option>
            <option value="fatsawtooth">Fat Sawtooth</option>
            <option value="fatsquare">Fat Square</option>
            <option value="fattriangle">Fat Triangle</option>
          </select>
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={-100}
            valueMax={100}
            onValueRawChange={handleDetuneChange}
            label="Detune (cents)"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleEnvelopeAttackChange}
            label="Attack"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleEnvelopeDecayChange}
            label="Decay"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={1}
            onValueRawChange={handleEnvelopeSustainChange}
            label="Sustain"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleEnvelopeReleaseChange}
            label="Release"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={-60}
            valueMax={6}
            onValueRawChange={handleVolumeChange}
            label="Volume (dB)"
            theme="pink"
          />
        </div>
      </div>
    </div>
  );
};

// VCA2 Component for the second synthesizer
export const VCA2: React.FC = () => {
  const synthSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  // Main oscillator handlers
  const handleDetuneChange = (newValue: number) => {
    dispatch(updateVCASettings({ detune2: newValue }));
  };

  const handleOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Restrict to valid values
    const value = event.target.value as
      | 'sine'
      | 'square'
      | 'triangle'
      | 'sawtooth'
      | 'fatsawtooth'
      | 'fattriangle'
      | 'fatsquare';
    dispatch(updateVCASettings({ oscillator2Type: value }));
  };

  // Envelope handlers
  const handleEnvelopeAttackChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope2Attack: newValue }));
  };

  const handleEnvelopeDecayChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope2Decay: newValue }));
  };

  const handleEnvelopeSustainChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope2Sustain: newValue }));
  };

  const handleEnvelopeReleaseChange = (newValue: number) => {
    dispatch(updateVCASettings({ envelope2Release: newValue }));
  };

  // Volume handler
  const handleVolumeChange = (newValue: number) => {
    dispatch(updateVCASettings({ vca2Volume: newValue }));
  };

  return (
    <div className={styles.synthSettings}>
      <h2 className={styles.synthSettings__title}>VCA 2 Controls</h2>
      <div className={styles.synthSettings__controls}>
        <div className={styles.synthSettings__control}>
          <label htmlFor="oscillator2Type">Oscillator Type</label>
          <select
            id="oscillator2Type"
            value={synthSettings.oscillator2Type}
            onChange={handleOscillatorTypeChange}
          >
            <option value="square">Square</option>
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="fatsawtooth">Fat Sawtooth</option>
            <option value="fatsquare">Fat Square</option>
            <option value="fattriangle">Fat Triangle</option>
          </select>
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={-100}
            valueMax={100}
            onValueRawChange={handleDetuneChange}
            label="Detune (cents)"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleEnvelopeAttackChange}
            label="Attack"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleEnvelopeDecayChange}
            label="Decay"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={1}
            onValueRawChange={handleEnvelopeSustainChange}
            label="Sustain"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleEnvelopeReleaseChange}
            label="Release"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={-60}
            valueMax={6}
            onValueRawChange={handleVolumeChange}
            label="Volume (dB)"
            theme="pink"
          />
        </div>
      </div>
    </div>
  );
};

// Composited VCA component that renders both VCA1 and VCA2
const VCA: React.FC = () => {
  return (
    <div>
      <VCA1 />
      <VCA2 />
    </div>
  );
};

export default VCA;
