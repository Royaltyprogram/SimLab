import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimLabLayout, SimulationDetail } from './components/SimLabLayout';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimLabLayout />} />
          <Route path="/simulation/:id" element={<SimulationDetail />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;