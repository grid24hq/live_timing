import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Volgende pagina's, bv: */}
      {/* <Route path="/coureur/:id" element={<DriverProfile />} /> */}
      {/* <Route path="/kalender" element={<Calendar />} /> */}
    </Routes>
  )
}

export default App
