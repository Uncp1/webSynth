import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AudioEngineProvider } from './synth/audioEngineContext';
import Filter from './components/filter/Filter';
import VCA from './components/VCA/VCA';
import Oscilloscope from './components/Oscilloscope/Oscilloscope';
import Keyboard from './components/keyboard/Keyboard';
import ADSRBank from './components/Envelope/Envelope';

function App() {
  return (
    <div className="synth-container">
      <Provider store={store}>
        <AudioEngineProvider>
          {/* Main synth grid - 3 columns instead of 2-column layout */}
          <div className="synth-grid">
            {/* Column 1: Oscillators */}
            <div className="synth-column">
              <VCA />
            </div>

            {/* Column 2: Filter */}
            <div className="synth-column">
              <Filter />
            </div>

            {/* Column 3: Envelopes */}
            <div className="synth-column">
              <ADSRBank />
            </div>
          </div>

          {/* Bottom panels */}
          <div className="synth-bottom-panels">
            <Oscilloscope />
            <Keyboard />
          </div>
        </AudioEngineProvider>
      </Provider>
    </div>
  );
}

export default App;
