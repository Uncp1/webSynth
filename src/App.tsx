import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AudioEngineProvider } from './synth/audioEngineContext';
import SynthTest from './components/SynthTest';

function App() {
  return (
    <>
      <Provider store={store}>
        <AudioEngineProvider>
          <SynthTest />
        </AudioEngineProvider>
      </Provider>
    </>
  );
}

export default App;
