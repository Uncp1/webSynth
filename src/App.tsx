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
          <div className="synth-grid">
            <div className="synth-grid-left">
              <VCA />
            </div>
            <div className="synth-grid-right">
              <Filter />
              <ADSRBank />
            </div>
          </div>
          <Oscilloscope />
          <Keyboard />
        </AudioEngineProvider>
      </Provider>
    </div>
  );
}

export default App;
