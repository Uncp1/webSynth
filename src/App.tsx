import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AudioEngineProvider } from './synth/audioEngineContext';
import SynthTest from './components/SynthTest';
import Filter from './components/filter/Filter';
import VCA from './components/VCA/VCA';
import WaveformDisplay from './components/waveformDisplay/WaveformDisplay';

function App() {
  return (
    <>
      <Provider store={store}>
        <AudioEngineProvider>
          <section className="controll__container">
            <VCA />
            <Filter />
          </section>
          <SynthTest />
          {/*    <WaveformDisplay /> */}
        </AudioEngineProvider>
      </Provider>
    </>
  );
}

export default App;
