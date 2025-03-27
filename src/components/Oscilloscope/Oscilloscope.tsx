import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import styles from './Oscilloscope.module.css';

const Oscilloscope: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(true);
  const [displayMode, setDisplayMode] = useState<'waveform' | 'fft'>(
    'waveform'
  );
  const [timeScale, setTimeScale] = useState(1);

  // Create analyzer on component mount or when display mode changes
  useEffect(() => {
    // Create an analyzer with buffer size 2048 for better resolution
    const analyser = new Tone.Analyser(displayMode, 2048);
    analyserRef.current = analyser;

    // Connect directly to Tone.Destination to ensure we get all audio
    Tone.Destination.connect(analyser);

    // Clean up when component unmounts or display mode changes
    return () => {
      if (analyser) {
        Tone.Destination.disconnect(analyser);
        analyser.dispose();
      }
    };
  }, [displayMode]);

  // Set up canvas drawing
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isRunning) {
      cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
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

        // Calculate timeScale - allows zooming in/out of waveform
        const scaledLength = Math.floor(data.length / timeScale);
        const sliceWidth = canvas.width / scaledLength;

        // Start drawing the waveform path
        ctx.beginPath();
        let x = 0;

        // Track max amplitude for signal detection
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

        // Set waveform style with glow effect
        ctx.strokeStyle = '#7aa2f7'; // Blue line
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(122, 162, 247, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.stroke();

        // Reset shadow for other elements
        ctx.shadowBlur = 0;
      }
    };

    // Function to draw frequency spectrum (FFT)
    const drawFFT = () => {
      const data = analyser.getValue() as Float32Array;

      if (ctx && data) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        drawGrid();

        // Draw the frequency bars
        const barWidth = canvas.width / data.length;

        // Track if we have any significant frequency content
        let hasSignal = false;

        // Draw frequency bars
        for (let i = 0; i < data.length; i++) {
          // FFT data is in dB (-100 to 0), normalize to 0-1 range
          const dbValue = data[i] as number;
          const normalizedValue = (dbValue + 100) / 100; // Map -100..0 to 0..1

          // Check if we have signal
          if (normalizedValue > 0.2) hasSignal = true;

          const barHeight = normalizedValue * canvas.height;

          // Use gradient coloring based on frequency and amplitude
          const hue = (i / data.length) * 180 + 200; // Blue to violet gradient
          const saturation = 70 + normalizedValue * 30; // Increasing saturation with amplitude
          const lightness = 40 + normalizedValue * 20; // Brighter for higher amplitudes

          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

          // Draw frequency bar
          ctx.fillRect(
            i * barWidth,
            canvas.height - barHeight,
            barWidth - 1, // Small gap between bars
            barHeight
          );
        }

        // Add frequency labels
        drawFrequencyLabels();
      }
    };

    // Function to draw grid lines
    const drawGrid = () => {
      if (!ctx) return;

      ctx.save();

      // Semi-transparent grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = (i / 5) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Highlight the center line for waveform display
      if (displayMode === 'waveform') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw frequency labels for FFT display
    const drawFrequencyLabels = () => {
      if (!ctx || displayMode !== 'fft') return;

      ctx.save();
      ctx.font = '9px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

      // Log scale frequency labels
      const freqLabels = [100, 500, 1000, 5000, 10000, 20000];

      for (const freq of freqLabels) {
        // Converting frequency to x position
        // Simple approximation - this would be more accurate with actual FFT bin frequency mapping
        const x = ((Math.log10(freq) - 2) / 2.3) * canvas.width;

        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 3);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();

        let label;
        if (freq >= 1000) {
          label = `${freq / 1000}k`;
        } else {
          label = `${freq}`;
        }

        ctx.fillText(label, x - 8, canvas.height - 5);
      }

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
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Clean up animation frame on effect cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
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

  return (
    <div className={styles.oscilloscope}>
      <h2 className={styles.title}>Audio Oscilloscope</h2>

      <div className={styles.controls}>
        <button
          className={`${styles.button} ${isRunning ? styles.active : ''}`}
          onClick={togglePlayback}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          className={`${styles.button} ${
            displayMode === 'fft' ? styles.active : ''
          }`}
          onClick={toggleDisplayMode}
        >
          {displayMode === 'waveform' ? 'Show Spectrum' : 'Show Waveform'}
        </button>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          className={styles.canvas}
        />

        {/* Frequency scale for FFT mode or time scale for waveform mode */}
        {displayMode === 'fft' ? (
          <div className={styles.scaleLabel}>Frequency →</div>
        ) : (
          <div className={styles.scaleLabel}>Time →</div>
        )}
      </div>
    </div>
  );
};

export default Oscilloscope;
