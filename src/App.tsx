import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AudioEngineProvider } from './synth/audioEngineContext';
import SynthTest from './components/SynthTest';
import Filter from './components/filter/Filter';
import VCA from './components/VCA/VCA';

function App() {
  return (
    <>
      <Provider store={store}>
        <AudioEngineProvider>
          <VCA />
          <Filter />
          <SynthTest />
        </AudioEngineProvider>
      </Provider>
    </>
  );
}

export default App;
