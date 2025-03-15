import React from 'react';
import * as Tone from 'tone';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateSynthSettings } from '../../store/synthSettingsSlice';
import styles from './VCA.module.css';
import { Knob } from '../knobs/Knob';

const VCA: React.FC = () => {
  const synthSettings = useSelector((state: RootState) => state.synthSettings);
  const dispatch: AppDispatch = useDispatch();

  const handleDetuneChange = (newValue: number) => {
    dispatch(updateSynthSettings({ detune: newValue }));
  };

  const handleOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(
      updateSynthSettings({
        oscillatorType: event.target.value as Tone.ToneOscillatorType,
      })
    );
  };

  const handleEnvelopeAttackChange = (newValue: number) => {
    dispatch(updateSynthSettings({ envelopeAttack: newValue }));
  };

  const handleEnvelopeDecayChange = (newValue: number) => {
    dispatch(updateSynthSettings({ envelopeDecay: newValue }));
  };

  const handleEnvelopeSustainChange = (newValue: number) => {
    dispatch(updateSynthSettings({ envelopeSustain: newValue }));
  };

  const handleEnvelopeReleaseChange = (newValue: number) => {
    dispatch(updateSynthSettings({ envelopeRelease: newValue }));
  };

  return (
    <div className={styles.synthSettings}>
      <h2 className={styles.synthSettings__title}>Synth Controls</h2>
      <div className={styles.synthSettings__controls}>
        <div className={styles.synthSettings__control}>
          <label htmlFor="oscillatorType">Oscillator Type</label>
          <select
            id="oscillatorType"
            value={synthSettings.oscillatorType}
            onChange={handleOscillatorTypeChange}
          >
            <option value="sawtooth">Sawtooth</option>
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="square">Square</option>
          </select>
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={-100} // Диапазон регулировки detune, можно настроить по необходимости
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
      </div>
    </div>
  );
};

export default VCA;
