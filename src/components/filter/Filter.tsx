import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateFilterSettings } from '../../store/filterSettingsSlice';
import styles from './Filter.module.css';
import { KnobFrequency } from '../knobs/KnobFrequency';
import { Knob } from '../knobs/Knob';

const Filter: React.FC = () => {
  const filterSettings = useSelector(
    (state: RootState) => state.filterSettings
  );
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();

  const handleFrequencyChange = (newValue: number) => {
    dispatch(updateFilterSettings({ frequency: newValue }));
  };

  const handleQChange = (newValue: number) => {
    dispatch(updateFilterSettings({ Q: newValue }));
  };

  const handleEnvAmountChange = (newValue: number) => {
    dispatch(updateFilterSettings({ envelopeAmount: newValue }));
  };

  const handleDistortionToggle = () => {
    dispatch(
      updateFilterSettings({
        distortionEnabled: !filterSettings.distortionEnabled,
      })
    );
  };

  const handleDistortionAmountChange = (newValue: number) => {
    dispatch(updateFilterSettings({ distortionAmount: newValue }));
  };

  const handleDistortionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(
      updateFilterSettings({
        distortionType: e.target.value as 'soft' | 'hard' | 'fuzz',
      })
    );
  };

  const isEnvelopeModulatingFilter =
    vcaSettings.envelope2Destination === 'filter';

  return (
    <div className={styles.filter}>
      <h2 className={styles.filter__title}>Filter Controls</h2>

      {/* WIP! Distortion Section  */}
      <div className={styles.distortionSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Distortion</h3>
          <button
            className={`${styles.toggleButton} ${
              filterSettings.distortionEnabled ? styles.active : ''
            }`}
            onClick={handleDistortionToggle}
          >
            {filterSettings.distortionEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div
          className={`${styles.distortionControls} ${
            !filterSettings.distortionEnabled && styles.disabled
          }`}
        >
          <div className={styles.filter__control}>
            <Knob
              valueMin={0}
              valueMax={1}
              valueDefault={filterSettings.distortionAmount}
              onValueRawChange={handleDistortionAmountChange}
              label="Amount"
              theme="stone"
            />
          </div>

          <div className={styles.distortionTypeContainer}>
            <label
              htmlFor="distortion-type"
              className={styles.distortionTypeLabel}
            >
              Type:
            </label>
            <select
              id="distortion-type"
              value={filterSettings.distortionType}
              onChange={handleDistortionTypeChange}
              className={styles.distortionTypeSelector}
              disabled={!filterSettings.distortionEnabled}
            >
              <option value="soft">Soft Clip</option>
              <option value="hard">Hard Clip</option>
              <option value="fuzz">Fuzz</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.separator}></div>

      {/* Filter Section */}
      <div className={styles.filter__controls}>
        <div className={styles.filter__control}>
          <KnobFrequency
            onValueRawChange={handleFrequencyChange}
            label="Frequency"
            theme="green"
          />
        </div>
        <div className={styles.filter__control}>
          <Knob
            valueMin={0}
            valueMax={10}
            valueDefault={filterSettings.Q}
            onValueRawChange={handleQChange}
            label="Q"
            theme="green"
          />
        </div>

        {isEnvelopeModulatingFilter && (
          <div className={styles.filter__control}>
            <Knob
              valueMin={-100}
              valueMax={100}
              valueDefault={filterSettings.envelopeAmount}
              onValueRawChange={handleEnvAmountChange}
              label="Env Amount"
              theme="sky" // Using the envelope 2 theme color
            />
            <div className={styles.modulationSource}>
              <span>Mod: Env 2</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
