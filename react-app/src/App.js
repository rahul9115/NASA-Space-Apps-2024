import logo from './logo.svg';
import './App.css';
import ChatWrapper from './components/ChatWrapper/ChatWrapper'
import Header from './components/Header/Header'
import { SourceProvider } from './SourceContext';


function App() {
  return (
    <div className="App">
      <SourceProvider>
        <Header/>
        <div className="App-header">
          <ChatWrapper/>
        </div>
      </SourceProvider>
    </div>
  );
}

export default App;
