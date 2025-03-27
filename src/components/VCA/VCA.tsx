import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateVCASettings } from '../../store/vcaSettingsSlice';
import * as Tone from 'tone';
import { Knob } from '../knobs/Knob';
import styles from './VCA.module.css';

// Oscillator waveform type
type OscillatorType =
  | 'sine'
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'fatsawtooth'
  | 'fattriangle'
  | 'fatsquare'
  | 'pulse'
  | 'pwm';

interface OscillatorProps {
  index: 1 | 2; // Either oscillator 1 or 2
}

// Oscillator label display component
const OscillatorLabel: React.FC<{ type: OscillatorType }> = ({ type }) => {
  // Get display name based on oscillator type
  const getDisplayName = (type: OscillatorType) => {
    switch (type) {
      case 'sine':
        return 'Sine';
      case 'square':
        return 'Square';
      case 'triangle':
        return 'Triangle';
      case 'sawtooth':
        return 'Sawtooth';
      case 'fatsawtooth':
        return 'Fat Saw';
      case 'fatsquare':
        return 'Fat Square';
      case 'fattriangle':
        return 'Fat Triangle';
      case 'pulse':
        return 'Pulse';
      case 'pwm':
        return 'PWM';
      default:
        return type;
    }
  };

  return (
    <div className={styles.currentType}>
      <span>{getDisplayName(type)}</span>
    </div>
  );
};

const Oscillator: React.FC<OscillatorProps> = ({ index }) => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  // Get oscillator-specific settings
  const oscillatorType =
    index === 1 ? vcaSettings.oscillator1Type : vcaSettings.oscillator2Type;
  const detune = index === 1 ? vcaSettings.detune1 : vcaSettings.detune2;
  const volume = index === 1 ? vcaSettings.vca1Volume : vcaSettings.vca2Volume;
  const semitone = index === 1 ? vcaSettings.semitone1 : vcaSettings.semitone2;
  const pulseWidth =
    index === 1 ? vcaSettings.pulseWidth1 : vcaSettings.pulseWidth2;
  const phase = index === 1 ? vcaSettings.phase1 : vcaSettings.phase2;

  // Local states for additional UI elements
  const [showWaveformSelector, setShowWaveformSelector] = useState(false);

  // Define handler functions
  const handleOscillatorTypeChange = (newType: OscillatorType) => {
    if (index === 1) {
      dispatch(updateVCASettings({ oscillator1Type: newType }));
    } else {
      dispatch(updateVCASettings({ oscillator2Type: newType }));
    }
    // Hide selector after selection
    setShowWaveformSelector(false);
  };

  const handleDetuneChange = (newValue: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ detune1: newValue }));
    } else {
      dispatch(updateVCASettings({ detune2: newValue }));
    }
  };

  const handleVolumeChange = (newValue: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ vca1Volume: newValue }));
    } else {
      dispatch(updateVCASettings({ vca2Volume: newValue }));
    }
  };

  const handleSemitoneChange = (newValue: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ semitone1: newValue }));
    } else {
      dispatch(updateVCASettings({ semitone2: newValue }));
    }
  };

  const handlePulseWidthChange = (newValue: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ pulseWidth1: newValue }));
    } else {
      dispatch(updateVCASettings({ pulseWidth2: newValue }));
    }
  };

  const handlePhaseChange = (newValue: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ phase1: newValue }));
    } else {
      dispatch(updateVCASettings({ phase2: newValue }));
    }
  };

  // Toggle the oscillator on/off
  const [isEnabled, setIsEnabled] = useState(true);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);

    // Set volume to -Infinity when disabled, or restore to previous value when enabled
    if (index === 1) {
      dispatch(
        updateVCASettings({
          vca1Volume: newState ? (volume < -60 ? -12 : volume) : -Infinity,
        })
      );
    } else {
      dispatch(
        updateVCASettings({
          vca2Volume: newState ? (volume < -60 ? -12 : volume) : -Infinity,
        })
      );
    }
  };

  // Function to render waveform buttons grid
  const renderWaveformButtons = () => {
    const waveforms: OscillatorType[] = [
      'sine',
      'triangle',
      'sawtooth',
      'square',
      'fattriangle',
      'fatsawtooth',
      'fatsquare',
      'pulse',
      'pwm',
    ];

    return (
      <div className={styles.waveformGrid}>
        {waveforms.map((type) => (
          <button
            key={type}
            className={`${styles.waveformButton} ${
              oscillatorType === type ? styles.active : ''
            }`}
            onClick={() => handleOscillatorTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
    );
  };

  // Get appropriate color based on oscillator index
  const themeColor = index === 1 ? styles.osc1Theme : styles.osc2Theme;

  return (
    <div
      className={`${styles.oscillator} ${
        !isEnabled ? styles.disabled : ''
      } ${themeColor}`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>OSC {index}</h3>
        <OscillatorLabel type={oscillatorType} />
        <button
          className={`${styles.toggleButton} ${
            isEnabled ? styles.enabled : styles.disabled
          }`}
          onClick={handleToggle}
        >
          {isEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className={styles.waveformSection}>
        <button
          className={styles.waveformSelector}
          onClick={() => setShowWaveformSelector(!showWaveformSelector)}
        >
          {showWaveformSelector ? 'Hide Waveforms' : 'Select Waveform'}
        </button>

        {showWaveformSelector && renderWaveformButtons()}
      </div>

      <div className={styles.controls}>
        <div className={styles.knobRow}>
          <div className={styles.knobWrapper}>
            <Knob
              valueMin={-100}
              valueMax={100}
              onValueRawChange={handleDetuneChange}
              label="Fine"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          <div className={styles.knobWrapper}>
            <Knob
              valueMin={-24}
              valueMax={24}
              onValueRawChange={handleSemitoneChange}
              label="Semitones"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          <div className={styles.knobWrapper}>
            <Knob
              valueMin={-60}
              valueMax={0}
              onValueRawChange={handleVolumeChange}
              label="Level"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>
        </div>

        <div className={styles.knobRow}>
          <div className={styles.knobWrapper}>
            <Knob
              valueMin={0}
              valueMax={360}
              onValueRawChange={handlePhaseChange}
              label="Phase"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          {(oscillatorType === 'pulse' || oscillatorType === 'pwm') && (
            <div className={styles.knobWrapper}>
              <Knob
                valueMin={0}
                valueMax={1}
                onValueRawChange={handlePulseWidthChange}
                label="Width"
                theme={index === 1 ? 'green' : 'sky'}
              />
            </div>
          )}
        </div>

        <div className={styles.parameterValue}>
          <span>Semitones:</span> {semitone > 0 ? `+${semitone}` : semitone}
        </div>
      </div>
    </div>
  );
};

// Oscillator bank component
const OscillatorBank: React.FC = () => {
  return (
    <div className={styles.oscillatorBank}>
      <h2 className={styles.bankTitle}>Oscillators</h2>
      <div className={styles.oscillatorSection}>
        <Oscillator index={1} />
        <Oscillator index={2} />
      </div>
    </div>
  );
};

export default OscillatorBank;
