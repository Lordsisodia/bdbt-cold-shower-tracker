import { useState } from 'react'

function App() {
  const [showers, setShowers] = useState(0)

  const addShower = () => {
    setShowers(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Cold Shower Tracker
        </h1>
        <div className="mb-6">
          <div className="text-6xl font-bold text-blue-800 mb-2">
            {showers}
          </div>
          <p className="text-gray-600">Cold Showers Taken</p>
        </div>
        <button
          onClick={addShower}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Add Cold Shower
        </button>
      </div>
    </div>
  )
}

export default App