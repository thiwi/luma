import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import CreateEvent from './features/create-event/CreateEvent';
import EnergyRoom from './features/energy-room/EnergyRoom';
import Premium from './features/premium/Premium';
import Home from './features/home/Home';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}> 
          <Route index element={<Home />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="energy/:eventId" element={<EnergyRoom />} />
          <Route path="premium" element={<Premium />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
);
