import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './screens/Landing'
import { Game } from './screens/Game'
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} /> 
          <Route path="/game" element={<Game/>} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  )
}

export default App
