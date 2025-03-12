// SynthTest.tsx
import React from 'react';
import * as Tone from 'tone';
import { useAudioEngine } from '../synth/audioEngineContext';

const SynthTest: React.FC = () => {
  const { synth } = useAudioEngine();

  const handlePlayNote = async () => {
    // Tone.start() требуется для активации AudioContext после пользовательского взаимодействия
    await Tone.start();
    synth.triggerAttackRelease('C4', '8n');
  };

  return (
    <div>
      <h2>Click the button to play a note</h2>
      <button onClick={handlePlayNote}>Play Note</button>
    </div>
  );
};

export default SynthTest;
