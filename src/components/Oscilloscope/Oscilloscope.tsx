import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useAudioEngine } from '../../synth/audioEngineContext';
import styles from './Oscilloscope.module.css';

//Говнокод ниже, следует поработать над ним
const Oscilloscope: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { filter, synth1, synth2 } = useAudioEngine();
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [displayMode, setDisplayMode] = useState<'waveform' | 'fft'>(
    'waveform'
  );
  const [timeScale, setTimeScale] = useState(1);
  const [signalDetected, setSignalDetected] = useState(false);

  // Create analyzer on component mount
  useEffect(() => {
    // Create an analyzer with buffer size 2048 for better resolution
    const analyser = new Tone.Analyser(displayMode, 2048);
    analyserRef.current = analyser;

    // Connect directly to Tone.Destination to ensure we get all audio
    Tone.Destination.connect(analyser);

    // Display connection status
    console.log('Oscilloscope connected to audio path');

    return () => {
      // Clean up when component unmounts
      Tone.Destination.disconnect(analyser);
      analyser.dispose();
      console.log('Oscilloscope disconnected');
    };
  }, [displayMode]);

  // Set up canvas drawing
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;

    if (!canvas || !analyserRef.current || !isRunning) return;

    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    // Function to draw waveform
    const drawWaveform = () => {
      const data = analyser.getValue() as Float32Array;

      if (ctx && data) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines for reference
        drawGrid();

        // Set up styling
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00FF00'; // Bright green for visibility

        // Calculate timeScale - allows zooming in/out of waveform
        const scaledLength = Math.floor(data.length / timeScale);
        const sliceWidth = canvas.width / scaledLength;

        // Start drawing the waveform path
        ctx.beginPath();
        let x = 0;

        // Check if we're getting any signal (not just silence)
        let hasSignal = false;
        let maxAmplitude = 0;

        for (let i = 0; i < scaledLength; i++) {
          // Map audio data (-1 to 1) to canvas Y coordinate
          const dataIndex = Math.floor(i * timeScale);
          const v = data[dataIndex];

          // Track max amplitude for signal detection
          const amplitude = Math.abs(v);
          if (amplitude > maxAmplitude) {
            maxAmplitude = amplitude;
          }

          // Center waveform vertically (use half canvas height as center)
          const y = canvas.height / 2 + (-v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        // Update signal detected state
        if (maxAmplitude > 0.01) {
          hasSignal = true;
          setSignalDetected(true);
        } else {
          setSignalDetected(false);
        }

        // Stroke the waveform path
        ctx.stroke();

        // Add debug text
        ctx.font = '12px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Max amplitude: ${maxAmplitude.toFixed(4)}`, 10, 20);
        ctx.fillText(`Buffer size: ${data.length}`, 10, 40);
        ctx.fillText(`Signal detected: ${hasSignal ? 'Yes' : 'No'}`, 10, 60);
      }
    };

    // Function to draw frequency spectrum (FFT)
    const drawFFT = () => {
      const data = analyser.getValue() as Float32Array;

      if (ctx && data) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the frequency bars
        const barWidth = canvas.width / data.length;
        const heightScale = canvas.height / 256;

        // Draw grid for frequency reference
        drawGrid();

        // Draw frequency bars
        for (let i = 0; i < data.length; i++) {
          // FFT data is in dB (-100 to 0), normalize to 0-1 range
          const dbValue = data[i] as number;
          const normalizedValue = (dbValue + 100) / 100;
          const barHeight = normalizedValue * canvas.height;

          // Use gradient coloring based on frequency
          const hue = (i / data.length) * 240; // Blue to red gradient
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

          ctx.fillRect(
            i * barWidth,
            canvas.height - barHeight,
            barWidth,
            barHeight
          );
        }
      }
    };

    // Function to draw grid lines
    const drawGrid = () => {
      if (!ctx) return;

      // Save current drawing state
      ctx.save();

      // Set up grid style
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.5;

      // Draw horizontal grid lines (amplitude)
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw vertical grid lines (time)
      for (let i = 0; i <= 8; i++) {
        const x = (i / 8) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Add center line with different style
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Restore previous drawing state
      ctx.restore();
    };

    // Animation loop function
    const animate = () => {
      if (displayMode === 'waveform') {
        drawWaveform();
      } else {
        drawFFT();
      }

      // Request next frame for animation
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Clean up animation frame on effect cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, displayMode, timeScale]);

  // Handle display mode toggle
  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === 'waveform' ? 'fft' : 'waveform'));
  };

  // Handle playback toggle
  const togglePlayback = () => {
    setIsRunning((prev) => !prev);
  };

  // Handle time scale change
  const handleTimeScaleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTimeScale(parseFloat(event.target.value));
  };

  return (
    <div className={styles.oscilloscope}>
      <h2 className={styles.title}>Audio Oscilloscope</h2>

      <div className={styles.controls}>
        <button className={styles.button} onClick={togglePlayback}>
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button className={styles.button} onClick={toggleDisplayMode}>
          {displayMode === 'waveform' ? 'Show Spectrum' : 'Show Waveform'}
        </button>

        {displayMode === 'waveform' && (
          <div className={styles.sliderContainer}>
            <label>Zoom:</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={timeScale}
              onChange={handleTimeScaleChange}
              className={styles.slider}
            />
          </div>
        )}
      </div>
      {/*
        <div className={styles.status}>
          {!signalDetected && (
            <div className={styles.noSignal}>
              No audio signal detected. Try playing some notes or press "Test
              Tone".
            </div>
          )}
        </div>
      */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className={styles.canvas}
        />
      </div>
    </div>
  );
};

export default Oscilloscope;
