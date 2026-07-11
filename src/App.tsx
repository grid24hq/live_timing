import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar' // Importeer de nieuwe Navbalk
import Home from './pages/Home'
import LiveTiming from './pages/LiveTiming'
import Calendar from './pages/Calendar'
import Standen from './pages/Standen'
import Coureurs from './pages/Coureurs'
import Circuits from './pages/Circuits'

export default function App() {
  return (
    <>
      {/* De Navbalk staat nu veilig bovenaan, zonder dubbele router-fouten! */}
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live-timing" element={<LiveTiming />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/standen" element={<Standen />} />
        <Route path="/coureurs" element={<Coureurs />} />
        <Route path="/circuits" element={<Circuits />} />
      </Routes>
    </>
  )
}
