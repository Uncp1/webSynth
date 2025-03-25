import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateVCASettings } from '../../store/vcaSettingsSlice';
import { Knob } from '../knobs/Knob';
import styles from './Envelope.module.css';

interface ADSRProps {
  index: 1 | 2; // Either for oscillator 1 or 2
}

const ADSR: React.FC<ADSRProps> = ({ index }) => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const dispatch: AppDispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get envelope-specific settings based on oscillator index
  const attack =
    index === 1 ? vcaSettings.envelope1Attack : vcaSettings.envelope2Attack;
  const decay =
    index === 1 ? vcaSettings.envelope1Decay : vcaSettings.envelope2Decay;
  const sustain =
    index === 1 ? vcaSettings.envelope1Sustain : vcaSettings.envelope2Sustain;
  const release =
    index === 1 ? vcaSettings.envelope1Release : vcaSettings.envelope2Release;

  // Handler functions for each envelope parameter
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

  // Draw the ADSR envelope visualization on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles
    ctx.lineWidth = 2;
    ctx.strokeStyle = index === 1 ? '#48bb78' : '#4299e1'; // Green for OSC1, Blue for OSC2

    // Calculate points and timing
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;

    // Scale time values to fit in the canvas
    const totalDuration = attack + decay + 1 + release; // 1 = sustain duration visualization
    const timeScale = (width - padding * 2) / totalDuration;

    // Scale points
    const startX = padding;
    const startY = height - padding;

    // Calculate key points
    const attackX = startX + attack * timeScale;
    const attackY = padding; // Top

    const decayX = attackX + decay * timeScale;
    const decayY = height - padding - sustain * (height - padding * 2);

    const sustainX = decayX + 1 * timeScale; // Visualize 1 second of sustain
    const sustainY = decayY;

    const releaseX = sustainX + release * timeScale;
    const releaseY = height - padding;

    // Begin path
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    // Attack line (to peak)
    ctx.lineTo(attackX, attackY);

    // Decay line (from peak to sustain level)
    ctx.lineTo(decayX, decayY);

    // Sustain line (horizontal at sustain level)
    ctx.lineTo(sustainX, sustainY);

    // Release line (from sustain level back to zero)
    ctx.lineTo(releaseX, releaseY);

    // Stroke the path
    ctx.stroke();

    // Draw grid and labels
    drawGrid(ctx, width, height, padding);
  }, [attack, decay, sustain, release, index]);

  // Draw grid for the envelope visualization
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number
  ) => {
    ctx.save();

    // Grid style
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * (width - padding * 2);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * (height - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px sans-serif';

    // Time labels at bottom
    ctx.textAlign = 'center';
    ctx.fillText('0s', padding, height - 5);
    ctx.fillText(
      Math.round(attack + decay + 1) + 's',
      width - padding,
      height - 5
    );

    // Amplitude labels on left
    ctx.textAlign = 'right';
    ctx.fillText('0', padding - 5, height - padding);
    ctx.fillText('1', padding - 5, padding);

    ctx.restore();
  };

  return (
    <div
      className={`${styles.adsr} ${
        index === 1 ? styles.osc1Theme : styles.osc2Theme
      }`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>ADSR Envelope {index}</h3>
      </div>

      <div className={styles.visualizer}>
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          className={styles.canvas}
        />
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
