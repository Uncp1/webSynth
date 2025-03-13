import React, { useState } from 'react';
import * as Tone from 'tone';
import { useAudioEngine } from '../synth/audioEngineContext';
import styles from './keyboard.module.css';

const SynthTest: React.FC = () => {
  const { synth } = useAudioEngine();
  const [baseOctave, setBaseOctave] = useState(3);
  const [audioStarted, setAudioStarted] = useState(false);

  const handleNoteOn = async (note: string) => {
    if (!audioStarted) {
      // Активация аудиоконтекста после пользовательского взаимодействия
      await Tone.start();
      setAudioStarted(true);
    }
    synth.triggerAttack(note);
  };

  const handleNoteOff = () => {
    synth.triggerRelease();
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

  return (
    <div className={styles.container}>
      <h2>Keyboard (2 Octaves)</h2>
      <div className={styles.controls}>
        <button onClick={handleOctaveDown}>Octave -</button>
        <span>Current Octave: {baseOctave}</span>
        <button onClick={handleOctaveUp}>Octave +</button>
      </div>
      <div className={styles.keyboard}>
        {whiteKeys.map((note, index) => (
          <button
            key={note}
            className={styles.key_white}
            style={{ left: `${index * 60}px` }}
            onMouseDown={() => handleNoteOn(note)}
            onMouseUp={handleNoteOff}
            onMouseLeave={handleNoteOff}
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
            onMouseUp={handleNoteOff}
            onMouseLeave={handleNoteOff}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SynthTest;
