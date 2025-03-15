import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AudioEngineProvider } from './synth/audioEngineContext';
import SynthTest from './components/SynthTest';
import Filter from './components/filter/Filter';

function App() {
  return (
    <>
      <Provider store={store}>
        <AudioEngineProvider>
          <Filter />
          <SynthTest />
        </AudioEngineProvider>
      </Provider>
    </>
  );
}

export default App;
