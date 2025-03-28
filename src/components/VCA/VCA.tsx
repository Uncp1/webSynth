import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateVCASettings } from '../../store/vcaSettingsSlice';
import { Knob } from '../knobs/Knob';
import { SteppedKnob } from '../knobs/SteppedKnob';
import styles from './VCA.module.css';

// Переделать на импорт из store
type OscillatorType =
  | 'sine'
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'pulse'
  | 'pwm';

type ModulationType = 'none' | 'hardsync' | 'ringmod' | 'fm';

interface OscillatorProps {
  index: 1 | 2; // Either oscillator 1 or 2
}

const OscillatorLabel: React.FC<{ type: OscillatorType; isFat: boolean }> = ({
  type,
  isFat,
}) => {
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
      case 'pulse':
        return 'Pulse';
      case 'pwm':
        return 'PWM';
    }
  };

  return (
    <div className={styles.currentType}>
      <span>
        {isFat ? 'Fat ' : ''}
        {getDisplayName(type)}
      </span>
    </div>
  );
};

const Oscillator: React.FC<OscillatorProps> = ({ index }) => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  // Get oscillator-specific settings
  const oscillatorType =
    index === 1 ? vcaSettings.oscillator1Type : vcaSettings.oscillator2Type;
  const isFat = index === 1 ? vcaSettings.isFat1 : vcaSettings.isFat2;
  const detune = index === 1 ? vcaSettings.detune1 : vcaSettings.detune2;
  const volume = index === 1 ? vcaSettings.vca1Volume : vcaSettings.vca2Volume;
  const semitone = index === 1 ? vcaSettings.semitone1 : vcaSettings.semitone2;
  const spread = index === 1 ? vcaSettings.spread1 : vcaSettings.spread2;
  const pulseWidth =
    index === 1 ? vcaSettings.pulseWidth1 : vcaSettings.pulseWidth2;
  const phase = index === 1 ? vcaSettings.phase1 : vcaSettings.phase2;

  // Local states for additional UI elements
  const [showWaveformSelector, setShowWaveformSelector] = useState(false);

  // Check if oscillator type is pulse or pwm
  const isPulseOrPWM = oscillatorType === 'pulse' || oscillatorType === 'pwm';

  // Define handler functions
  const handleOscillatorTypeChange = (newType: OscillatorType) => {
    if (index === 1) {
      // If switching to pulse/pwm, disable FAT mode
      if ((newType === 'pulse' || newType === 'pwm') && isFat) {
        dispatch(
          updateVCASettings({
            oscillator1Type: newType,
            isFat1: false,
          })
        );
      } else {
        dispatch(updateVCASettings({ oscillator1Type: newType }));
      }
    } else {
      // If switching to pulse/pwm, disable FAT mode
      if ((newType === 'pulse' || newType === 'pwm') && isFat) {
        dispatch(
          updateVCASettings({
            oscillator2Type: newType,
            isFat2: false,
          })
        );
      } else {
        dispatch(updateVCASettings({ oscillator2Type: newType }));
      }
    }
    // Hide selector after selection
    setShowWaveformSelector(false);
  };

  const handleFatToggle = () => {
    // Only allow toggle if not pulse or pwm
    if (!isPulseOrPWM) {
      if (index === 1) {
        dispatch(updateVCASettings({ isFat1: !isFat }));
      } else {
        dispatch(updateVCASettings({ isFat2: !isFat }));
      }
    }
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

  const handleSpreadChange = (newValue: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ spread1: newValue }));
    } else {
      dispatch(updateVCASettings({ spread2: newValue }));
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
        <OscillatorLabel type={oscillatorType} isFat={isFat} />
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
        <div className={styles.waveformControls}>
          <button
            className={styles.waveformSelector}
            onClick={() => setShowWaveformSelector(!showWaveformSelector)}
          >
            {showWaveformSelector ? 'Hide' : 'Wave'}
          </button>

          <button
            className={`${styles.fatButton} ${isFat ? styles.active : ''} ${
              isPulseOrPWM ? styles.disabled : ''
            }`}
            onClick={handleFatToggle}
            disabled={isPulseOrPWM}
          >
            FAT
          </button>
        </div>

        {showWaveformSelector && renderWaveformButtons()}
      </div>

      <div className={styles.controls}>
        <div className={styles.knobRow}>
          <div className={styles.knobWrapper}>
            <Knob
              valueMin={-100}
              valueMax={100}
              valueDefault={detune}
              onValueRawChange={handleDetuneChange}
              label="Fine"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>
          <div className={styles.knobWrapper}>
            <Knob
              valueMin={0}
              valueMax={360}
              valueDefault={phase}
              onValueRawChange={handlePhaseChange}
              label="Phase"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>
          {isFat && (
            <div className={styles.knobWrapper}>
              <SteppedKnob
                valueMin={0}
                valueMax={100}
                valueDefault={spread}
                onValueRawChange={handleSpreadChange}
                label="Spread"
                theme={index === 1 ? 'green' : 'sky'}
              />
            </div>
          )}

          {(oscillatorType === 'pulse' || oscillatorType === 'pwm') && (
            <div className={styles.knobWrapper}>
              <Knob
                valueMin={0}
                valueMax={1}
                valueDefault={pulseWidth}
                onValueRawChange={handlePulseWidthChange}
                label="Width"
                theme={index === 1 ? 'green' : 'sky'}
              />
            </div>
          )}
          <div className={styles.knobWrapper}>
            <SteppedKnob
              valueMin={-24}
              valueMax={24}
              valueDefault={semitone}
              onValueRawChange={handleSemitoneChange}
              label="Semitones"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          <div className={styles.knobWrapper}>
            <Knob
              valueMin={-60}
              valueMax={0}
              valueDefault={volume}
              onValueRawChange={handleVolumeChange}
              label="Level"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a new component for modulation controls
const ModulationControls: React.FC = () => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  const handleModulationTypeChange = (type: ModulationType) => {
    dispatch(updateVCASettings({ modulationType: type }));
  };

  const handleModulationAmountChange = (amount: number) => {
    dispatch(updateVCASettings({ modulationAmount: amount }));
  };

  return (
    <div className={styles.modulationSection}>
      <h3 className={styles.modulationTitle}>Cross Modulation</h3>

      <div className={styles.modulationTypes}>
        <button
          className={`${styles.modulationButton} ${
            vcaSettings.modulationType === 'none' ? styles.active : ''
          }`}
          onClick={() => handleModulationTypeChange('none')}
        >
          None
        </button>
        <button
          className={`${styles.modulationButton} ${
            vcaSettings.modulationType === 'hardsync' ? styles.active : ''
          }`}
          onClick={() => handleModulationTypeChange('hardsync')}
        >
          Hard Sync
        </button>
        <button
          className={`${styles.modulationButton} ${
            vcaSettings.modulationType === 'ringmod' ? styles.active : ''
          }`}
          onClick={() => handleModulationTypeChange('ringmod')}
        >
          Ring Mod
        </button>
        <button
          className={`${styles.modulationButton} ${
            vcaSettings.modulationType === 'fm' ? styles.active : ''
          }`}
          onClick={() => handleModulationTypeChange('fm')}
        >
          FM
        </button>
      </div>

      {vcaSettings.modulationType !== 'none' && (
        <div className={styles.modulationAmount}>
          <SteppedKnob
            valueMin={0}
            valueMax={100}
            valueDefault={vcaSettings.modulationAmount}
            onValueRawChange={handleModulationAmountChange}
            label="Amount"
            theme="green"
          />
        </div>
      )}
    </div>
  );
};

const OscillatorBank: React.FC = () => {
  return (
    <div className={styles.oscillatorBank}>
      <h2 className={styles.bankTitle}>Oscillators</h2>
      <div className={styles.oscillatorSection}>
        <Oscillator index={1} />
        <Oscillator index={2} />
      </div>
      {/*  <ModulationControls />  */}
    </div>
  );
};

export default OscillatorBank;
