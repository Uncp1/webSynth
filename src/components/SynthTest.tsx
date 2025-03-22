import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useAudioEngine } from '../synth/audioEngineContext';
import styles from './keyboard.module.css';

const SynthTest: React.FC = () => {
  const { synth1, synth2 } = useAudioEngine();
  const [baseOctave, setBaseOctave] = useState(3);
  const [audioStarted, setAudioStarted] = useState(false);
  const [computerKeyboardEnabled, setComputerKeyboardEnabled] = useState(false);

  // Множество для отслеживания уже нажатых клавиш, чтобы избежать повторных срабатываний
  const activeKeys = useRef<Set<string>>(new Set());

  const handleNoteOn = async (note: string) => {
    if (!audioStarted) {
      // Активация аудиоконтекста после пользовательского взаимодействия
      await Tone.start();
      setAudioStarted(true);
    }
    synth1.triggerAttack(note);
    synth2.triggerAttack(note);
  };

  const handleNoteOff = (note: string) => {
    synth1.triggerRelease(note);
    synth2.triggerRelease(note);
  };
  // Определяем белые клавиши для двух октав
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const whiteKeys = [
    ...whiteNotes.map((note) => note + baseOctave),
    ...whiteNotes.map((note) => note + (baseOctave + 1)),
  ];
  // TO DO add one C in the end

  const getBlackKeysForOctave = (octave: number, offset: number) => {
    const keys = [];
    for (let i = 0; i < whiteNotes.length; i++) {
      // Черная клавиша отсутствует после E и B
      if (whiteNotes[i] === 'E' || whiteNotes[i] === 'B') continue;
      const noteName = whiteNotes[i] + '#' + octave;
      // change later!!!
      const left = (offset + i) * 60 + 40;
      keys.push({ note: noteName, left });
    }
    return keys;
  };

  const blackKeys = [
    ...getBlackKeysForOctave(baseOctave, 0),
    ...getBlackKeysForOctave(baseOctave + 1, 7),
  ];

  const handleOctaveUp = () => setBaseOctave((prev) => prev + 1);
  const handleOctaveDown = () => setBaseOctave((prev) => prev - 1);

  // Сопоставление клавиш компьютерной клавиатуры с нотами
  // TO DO вывести в ui
  const keyMapping: { [key: string]: string } = {
    a: 'C4',
    w: 'C#4',
    s: 'D4',
    e: 'D#4',
    d: 'E4',
    f: 'F4',
    t: 'F#4',
    g: 'G4',
    y: 'G#4',
    h: 'A4',
    u: 'A#4',
    j: 'B4',
    k: 'C5',
  };

  // Обработчики событий для компьютерной клавиатуры
  useEffect(() => {
    if (!computerKeyboardEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMapping[key] && !activeKeys.current.has(key)) {
        activeKeys.current.add(key);
        handleNoteOn(keyMapping[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMapping[key] && activeKeys.current.has(key)) {
        activeKeys.current.delete(key);
        handleNoteOff(keyMapping[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Очистка при отключении режима или размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      activeKeys.current.clear();
    };
  }, [computerKeyboardEnabled]);

  return (
    <div className={styles.container}>
      <h2>Keyboard (2 Octaves)</h2>
      <div className={styles.controls}>
        <button onClick={handleOctaveDown}>Octave -</button>
        <span>Current Octave: {baseOctave}</span>
        <button onClick={handleOctaveUp}>Octave +</button>
        <button onClick={() => setComputerKeyboardEnabled((prev) => !prev)}>
          {computerKeyboardEnabled ? 'Disable' : 'Enable'} Computer Keyboard
        </button>
      </div>
      <div className={styles.keyboard}>
        {whiteKeys.map((note, index) => (
          <button
            key={note}
            className={styles.key_white}
            style={{ left: `${index * 60}px` }}
            onMouseDown={() => handleNoteOn(note)}
            onMouseUp={() => handleNoteOff(note)}
            onMouseLeave={() => handleNoteOff(note)}
          >
            {note}
          </button>
        ))}
        {blackKeys.map(({ note, left }) => (
          <button
            key={note}
            className={styles.key_black}
            style={{ left: `${left}px` }}
            onMouseDown={() => handleNoteOn(note)}
            onMouseUp={() => handleNoteOff(note)}
            onMouseLeave={() => handleNoteOff(note)}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SynthTest;
