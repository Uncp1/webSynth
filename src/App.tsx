import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AudioEngineProvider } from './synth/audioEngineContext';
import SynthTest from './components/SynthTest';
import Filter from './components/filter/Filter';
import VCA from './components/VCA/VCA';
import Oscilloscope from './components/Oscilloscope/Oscilloscope';
import Keyboard from './components/keyboard/Keyboard';
import ADSRBank from './components/Envelope/Envelope';

function App() {
  return (
    <>
      <Provider store={store}>
        <AudioEngineProvider>
          <section className="controll__container">
            <VCA />
            <Filter />
          </section>
          <Keyboard />
          <ADSRBank />
          {/*  <SynthTest />*/}
          <Oscilloscope />
        </AudioEngineProvider>
      </Provider>
    </>
  );
}

export default App;
