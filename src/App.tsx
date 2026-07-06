import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Calendar from './pages/Calendar'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calendar" element={<Calendar />} />
      {/* Volgende pagina's, bv: */}
      {/* <Route path="/coureur/:id" element={<DriverProfile />} /> */}
    </Routes>
  )
}

export default App
