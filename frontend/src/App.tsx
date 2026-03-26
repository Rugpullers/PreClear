import ScrollAnimation from './components/ScrollAnimation'

const App: React.FC = () => {
  return (
    <div className="app">
      <ScrollAnimation />
      <div style={{ height: '500vh' }}>
        {/* Spacer to allow scrolling */}
      </div>
    </div>
  )
}

export default App
