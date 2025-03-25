import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useAudioEngine } from '../../synth/audioEngineContext';
import styles from './Keyboard.module.css';

interface KeyProps {
  note: string;
  isBlack: boolean;
  left: number;
  isActive: boolean;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  computerKey: string | null;
  showComputerKeys: boolean;
}

// Find computer key for a given note
const findComputerKey = (
  note: string,
  keyMapping: Record<string, string>
): string | null => {
  for (const [key, mappedNote] of Object.entries(keyMapping)) {
    if (mappedNote === note) {
      return key;
    }
  }
  return null;
};

// Individual key component
const Key: React.FC<KeyProps> = ({
  note,
  isBlack,
  left,
  isActive,
  onNoteOn,
  onNoteOff,
}) => {
  const keyClass = isBlack
    ? `${styles.key} ${styles.blackKey} ${isActive ? styles.activeBlack : ''}`
    : `${styles.key} ${styles.whiteKey} ${isActive ? styles.activeWhite : ''}`;

  return (
    <div
      className={keyClass}
      style={{ left: `${left}px` }}
      onMouseDown={() => onNoteOn(note)}
      onMouseUp={() => onNoteOff(note)}
      onMouseEnter={(e) => {
        // If mouse button is pressed when entering, trigger note
        if (e.buttons === 1) {
          onNoteOn(note);
        }
      }}
      onMouseLeave={() => onNoteOff(note)}
      onTouchStart={(e) => {
        e.preventDefault();
        onNoteOn(note);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onNoteOff(note);
      }}
    >
      <div className={styles.keyLabel}>{note}</div>
    </div>
  );
};

// Computer key mapping display component
const ComputerKeyMapping: React.FC<{ keyMapping: Record<string, string> }> = ({
  keyMapping,
}) => {
  return (
    <div className={styles.keyMappingContainer}>
      <h3>Computer Keyboard Mapping</h3>
      <div className={styles.keyMappingGrid}>
        {Object.entries(keyMapping).map(([key, note]) => (
          <div key={key} className={styles.keyMapItem}>
            <div className={styles.computerKey}>{key.toUpperCase()}</div>
            <div className={styles.mappedNote}>{note}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Keyboard: React.FC = () => {
  const { synth1, synth2 } = useAudioEngine();
  const [baseOctave, setBaseOctave] = useState(3);
  const [audioStarted, setAudioStarted] = useState(false);
  const [computerKeyboardEnabled, setComputerKeyboardEnabled] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [showKeyMapping, setShowKeyMapping] = useState(false);
  const [mouseIsDown, setMouseIsDown] = useState(false);

  // Ref for tracking active computer keys
  const activeKeys = useRef<Set<string>>(new Set());

  // Start audio context and trigger note
  const handleNoteOn = async (note: string) => {
    if (!audioStarted) {
      await Tone.start();
      setAudioStarted(true);
    }

    // Add to active notes for visual feedback
    setActiveNotes((prev) => {
      const updated = new Set(prev);
      updated.add(note);
      return updated;
    });

    synth1.triggerAttack(note);
    synth2.triggerAttack(note);
  };

  // Release note
  const handleNoteOff = (note: string) => {
    // Remove from active notes
    setActiveNotes((prev) => {
      const updated = new Set(prev);
      updated.delete(note);
      return updated;
    });

    synth1.triggerRelease(note);
    synth2.triggerRelease(note);
  };

  // Define white notes for keyboard
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  // Generate notes for current octave range
  const generateKeyboardLayout = () => {
    const whiteKeys: { note: string; left: number }[] = [];
    const blackKeys: { note: string; left: number }[] = [];

    // Calculate white keys
    let whiteKeyCount = 0;
    for (let octave = baseOctave; octave <= baseOctave + 1; octave++) {
      whiteNotes.forEach((noteName) => {
        const note = `${noteName}${octave}`;
        whiteKeys.push({
          note,
          left: whiteKeyCount * 40,
        });
        whiteKeyCount++;
      });
    }
    // Add the final C for the 2-octave keyboard
    whiteKeys.push({
      note: `C${baseOctave + 2}`,
      left: whiteKeyCount * 40,
    });

    // Calculate black keys
    for (let octave = baseOctave; octave <= baseOctave + 1; octave++) {
      whiteNotes.forEach((noteName, index) => {
        // Black keys don't exist after E and B
        if (noteName !== 'E' && noteName !== 'B') {
          const note = `${noteName}#${octave}`;
          // Find the left position (between white keys)
          const whiteKeyIndex = whiteNotes.indexOf(noteName);
          const octaveOffset = (octave - baseOctave) * 7;
          const left = (octaveOffset + whiteKeyIndex) * 40 + 25;

          blackKeys.push({ note, left });
        }
      });
    }

    return { whiteKeys, blackKeys };
  };

  const { whiteKeys, blackKeys } = generateKeyboardLayout();

  // Computer keyboard mapping
  const keyMapping: Record<string, string> = {
    a: `C${baseOctave}`,
    w: `C#${baseOctave}`,
    s: `D${baseOctave}`,
    e: `D#${baseOctave}`,
    d: `E${baseOctave}`,
    f: `F${baseOctave}`,
    t: `F#${baseOctave}`,
    g: `G${baseOctave}`,
    y: `G#${baseOctave}`,
    h: `A${baseOctave}`,
    u: `A#${baseOctave}`,
    j: `B${baseOctave}`,
    k: `C${baseOctave + 1}`,
    o: `C#${baseOctave + 1}`,
    l: `D${baseOctave + 1}`,
    p: `D#${baseOctave + 1}`,
    ';': `E${baseOctave + 1}`,
    "'": `F${baseOctave + 1}`,
  };

  // Handle computer keyboard events
  useEffect(() => {
    if (!computerKeyboardEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Prevent repeating keys and check if key exists in mapping
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

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      activeKeys.current.clear();
    };
  }, [computerKeyboardEnabled, baseOctave]);

  // Handle octave changes
  const handleOctaveChange = (direction: number) => {
    // First ensure all notes are off to prevent stuck notes
    Array.from(activeNotes).forEach((note) => {
      handleNoteOff(note);
    });

    setBaseOctave((prev) => {
      const newOctave = prev + direction;
      // Limit octave range to reasonable values (0-7)
      return Math.min(Math.max(newOctave, 0), 7);
    });
  };

  // Toggle computer keyboard input
  const toggleComputerKeyboard = () => {
    setComputerKeyboardEnabled((prev) => !prev);
    // When disabling, make sure to clear any active keys
    if (computerKeyboardEnabled) {
      activeKeys.current.forEach((key) => {
        if (keyMapping[key]) {
          handleNoteOff(keyMapping[key]);
        }
      });
      activeKeys.current.clear();
    }
  };

  // Reset all notes (panic button)
  const handlePanic = () => {
    synth1.releaseAll();
    synth2.releaseAll();
    setActiveNotes(new Set());
    activeKeys.current.clear();
  };

  // Toggle key mapping display
  const toggleKeyMapping = () => {
    setShowKeyMapping((prev) => !prev);
  };

  return (
    <div className={styles.keyboardContainer}>
      <h2>Keyboard Controller</h2>

      <div className={styles.controls}>
        <div className={styles.octaveControls}>
          <button
            className={styles.controlButton}
            onClick={() => handleOctaveChange(-1)}
            disabled={baseOctave <= 0}
          >
            Octave -
          </button>
          <span className={styles.octaveDisplay}>Octave: {baseOctave}</span>
          <button
            className={styles.controlButton}
            onClick={() => handleOctaveChange(1)}
            disabled={baseOctave >= 7}
          >
            Octave +
          </button>
        </div>

        <div className={styles.keyboardControls}>
          <button
            className={`${styles.controlButton} ${
              computerKeyboardEnabled ? styles.activeButton : ''
            }`}
            onClick={toggleComputerKeyboard}
          >
            {computerKeyboardEnabled ? 'Disable' : 'Enable'} Computer Keyboard
          </button>

          <button className={styles.controlButton} onClick={handlePanic}>
            Panic (All Notes Off)
          </button>

          <button
            className={`${styles.controlButton} ${
              showKeyMapping ? styles.activeButton : ''
            }`}
            onClick={toggleKeyMapping}
          >
            {showKeyMapping ? 'Hide' : 'Show'} Key Mapping
          </button>
        </div>
      </div>

      {showKeyMapping && computerKeyboardEnabled && (
        <ComputerKeyMapping keyMapping={keyMapping} />
      )}

      <div className={styles.keyboardWrapper}>
        <div
          className={styles.keyboard}
          style={{ width: `${whiteKeys.length * 40}px` }}
        >
          {/* Render white keys first (lower z-index) */}
          {whiteKeys.map(({ note, left }) => {
            // Find matching computer key if any
            const computerKey =
              Object.entries(keyMapping).find(
                ([, mappedNote]) => mappedNote === note
              )?.[0] || null;

            return (
              <Key
                key={note}
                note={note}
                isBlack={false}
                left={left}
                isActive={activeNotes.has(note)}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
                computerKey={computerKey}
                showComputerKeys={computerKeyboardEnabled}
              />
            );
          })}

          {/* Render black keys on top */}
          {blackKeys.map(({ note, left }) => {
            // Find matching computer key if any
            const computerKey =
              Object.entries(keyMapping).find(
                ([, mappedNote]) => mappedNote === note
              )?.[0] || null;

            return (
              <Key
                key={note}
                note={note}
                isBlack={true}
                left={left}
                isActive={activeNotes.has(note)}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
                computerKey={computerKey}
                showComputerKeys={computerKeyboardEnabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Keyboard;
