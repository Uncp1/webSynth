import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateVCASettings } from '../../store/vcaSettingsSlice';
import { Knob } from '../knobs/Knob';
import styles from './Envelope.module.css';

export type EnvelopeDestination = 'vca2' | 'filter';
interface ADSRProps {
  index: 1 | 2;
}

const ADSR: React.FC<ADSRProps> = ({ index }) => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  const attack =
    index === 1 ? vcaSettings.envelope1Attack : vcaSettings.envelope2Attack;
  const decay =
    index === 1 ? vcaSettings.envelope1Decay : vcaSettings.envelope2Decay;
  const sustain =
    index === 1 ? vcaSettings.envelope1Sustain : vcaSettings.envelope2Sustain;
  const release =
    index === 1 ? vcaSettings.envelope1Release : vcaSettings.envelope2Release;

  const destination = index === 2 ? vcaSettings.envelope2Destination : 'vca';

  const handleAttackChange = (value: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ envelope1Attack: value }));
    } else {
      dispatch(updateVCASettings({ envelope2Attack: value }));
    }
  };

  const handleDecayChange = (value: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ envelope1Decay: value }));
    } else {
      dispatch(updateVCASettings({ envelope2Decay: value }));
    }
  };

  const handleSustainChange = (value: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ envelope1Sustain: value }));
    } else {
      dispatch(updateVCASettings({ envelope2Sustain: value }));
    }
  };

  const handleReleaseChange = (value: number) => {
    if (index === 1) {
      dispatch(updateVCASettings({ envelope1Release: value }));
    } else {
      dispatch(updateVCASettings({ envelope2Release: value }));
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as EnvelopeDestination;
    dispatch(updateVCASettings({ envelope2Destination: value }));
  };

  return (
    <div
      className={`${styles.adsr} ${
        index === 1 ? styles.osc1Theme : styles.osc2Theme
      }`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>ADSR Envelope {index}</h3>
        {index === 2 && (
          <div className={styles.destinationSelector}>
            <label htmlFor="envelope2Destination">Destination:</label>
            <select
              id="envelope2Destination"
              value={destination}
              onChange={handleDestinationChange}
              className={styles.selector}
            >
              <option value="vca2">VCA2</option>
              <option value="filter">Filter</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.knobRow}>
          <div className={styles.knobWrapper}>
            <Knob
              valueMin={0.001}
              valueMax={5}
              onValueRawChange={handleAttackChange}
              label="Attack"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          <div className={styles.knobWrapper}>
            <Knob
              valueMin={0.001}
              valueMax={5}
              onValueRawChange={handleDecayChange}
              label="Decay"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          <div className={styles.knobWrapper}>
            <Knob
              valueMin={0}
              valueMax={1}
              onValueRawChange={handleSustainChange}
              label="Sustain"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>

          <div className={styles.knobWrapper}>
            <Knob
              valueMin={0.001}
              valueMax={10}
              onValueRawChange={handleReleaseChange}
              label="Release"
              theme={index === 1 ? 'green' : 'sky'}
            />
          </div>
        </div>

        <div className={styles.parameterValues}>
          <div className={styles.parameterValue}>
            <span>A:</span> {attack.toFixed(2)}s
          </div>
          <div className={styles.parameterValue}>
            <span>D:</span> {decay.toFixed(2)}s
          </div>
          <div className={styles.parameterValue}>
            <span>S:</span> {(sustain * 100).toFixed(0)}%
          </div>
          <div className={styles.parameterValue}>
            <span>R:</span> {release.toFixed(2)}s
          </div>
        </div>
      </div>
    </div>
  );
};

const ADSRBank: React.FC = () => {
  return (
    <div className={styles.adsrBank}>
      <h2 className={styles.bankTitle}>Envelope Controls</h2>
      <div className={styles.adsrSection}>
        <ADSR index={1} />
        <ADSR index={2} />
      </div>
    </div>
  );
};

export default ADSRBank;
