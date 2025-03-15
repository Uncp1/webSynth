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
  const dispatch: AppDispatch = useDispatch();

  const handleFrequencyChange = (newValue: number) => {
    dispatch(updateFilterSettings({ frequency: newValue }));
  };

  const handleQChange = (newValue: number) => {
    dispatch(updateFilterSettings({ Q: newValue }));
  };

  return (
    <div className={styles.filter}>
      <h2 className={styles.filter__title}>Filter Controls</h2>
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
            onValueRawChange={handleQChange}
            label="Q"
            theme="green"
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
