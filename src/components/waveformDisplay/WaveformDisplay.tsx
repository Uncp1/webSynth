import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useAudioEngine } from '../../synth/audioEngineContext';

const WaveformDisplay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { filter } = useAudioEngine();
  const analyserRef = useRef<Tone.Analyser | null>(null);

  useEffect(() => {
    // Создаем анализатор с размером буфера 1024
    const analyser = new Tone.Analyser('waveform', 1024);
    analyserRef.current = analyser;
    // Подключаем фильтр (или любой другой нужный узел) к анализатору.
    filter.connect(analyser);
    return () => {
      // Отключаем анализатор при размонтировании компонента
      filter.disconnect(analyser);
    };
  }, [filter]);

  /*

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const draw = () => {
      const data = analyser.getValue() as Float32Array;
      if (ctx && data) {
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Начинаем рисовать линию фейформы
        ctx.beginPath();
        const sliceWidth = canvas.width / data.length;
        let x = 0;
        for (let i = 0; i < data.length; i++) {
          // Значения из анализатора обычно варьируются от -1 до 1. Преобразуем их в координаты canvas.
          const y = (1 - (data[i] + 1) / 2) * canvas.height;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  */
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    let lastUpdateTime = performance.now();
    const updateInterval = 50; // интервал обновления в миллисекундах (например, 100 мс = 10 кадров в секунду)

    const draw = () => {
      const now = performance.now();
      if (now - lastUpdateTime >= updateInterval) {
        lastUpdateTime = now;
        const data = analyser.getValue() as Float32Array;
        if (ctx && data) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();
          const sliceWidth = canvas.width / data.length;
          let x = 0;
          for (let i = 0; i < data.length; i++) {
            const y = (1 - (data[i] + 1) / 2) * canvas.height;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.strokeStyle = 'lime';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} width={600} height={200} />;
};

export default WaveformDisplay;
