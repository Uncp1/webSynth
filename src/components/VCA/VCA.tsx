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

  // Основной осциллятор
  const handleDetuneChange = (newValue: number) => {
    dispatch(updateSynthSettings({ detune: newValue }));
  };

  const handleOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Ограничиваем выбор только допустимыми значениями
    const value = event.target.value as
      | 'sine'
      | 'square'
      | 'triangle'
      | 'sawtooth';
    dispatch(updateSynthSettings({ oscillatorType: value }));
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

  // Модулятор (второй осциллятор) и его огибающая
  const handleModulatorOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value as
      | 'sine'
      | 'square'
      | 'triangle'
      | 'sawtooth';
    dispatch(updateSynthSettings({ modulatorOscillatorType: value }));
  };

  const handleModulationEnvelopeAttackChange = (newValue: number) => {
    dispatch(updateSynthSettings({ modulationEnvelopeAttack: newValue }));
  };

  const handleModulationEnvelopeDecayChange = (newValue: number) => {
    dispatch(updateSynthSettings({ modulationEnvelopeDecay: newValue }));
  };

  const handleModulationEnvelopeSustainChange = (newValue: number) => {
    dispatch(updateSynthSettings({ modulationEnvelopeSustain: newValue }));
  };

  const handleModulationEnvelopeReleaseChange = (newValue: number) => {
    dispatch(updateSynthSettings({ modulationEnvelopeRelease: newValue }));
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
      </div>

      {/* Раздел управления модулятором */}
      <h2 className={styles.synthSettings__title}>Modulator Controls</h2>
      <div className={styles.synthSettings__controls}>
        <div className={styles.synthSettings__control}>
          <label htmlFor="modulatorOscillatorType">
            Modulator Oscillator Type
          </label>
          <select
            id="modulatorOscillatorType"
            value={synthSettings.modulatorOscillatorType}
            onChange={handleModulatorOscillatorTypeChange}
          >
            <option value="sawtooth">Sawtooth</option>
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="square">Square</option>
          </select>
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleModulationEnvelopeAttackChange}
            label="Mod Env Attack"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleModulationEnvelopeDecayChange}
            label="Mod Env Decay"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={1}
            onValueRawChange={handleModulationEnvelopeSustainChange}
            label="Mod Env Sustain"
            theme="green"
          />
        </div>
        <div className={styles.synthSettings__control}>
          <Knob
            valueMin={0}
            valueMax={5}
            onValueRawChange={handleModulationEnvelopeReleaseChange}
            label="Mod Env Release"
            theme="green"
          />
        </div>
      </div>
    </div>
  );
};

export default VCA;
