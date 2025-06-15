import './App.scss'
import { GameCanvas } from './components/GameCanvas'

function App() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
      }}
    >
      <GameCanvas />
    </div>
  )
}

export default App
