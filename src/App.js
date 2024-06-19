import "./i18n";

import Navbar from './components/Navbar';
import Conjunctions from './routes/Conjunctions/Conjunctions';
import Home from './routes/Home';
import ManoeuvreSuggestions from './routes/Manoeuvres/ManoeuvreSuggestions';
import ManoeuvreSequence from './routes/Manoeuvres/ManoeuvreSimulation';
import { Route, Routes, useLocation } from 'react-router-dom';

import * as React from 'react';
import { ThemeSetup } from "./styles/theme";

import { SelectedValuesProvider } from "./components/SelectedValuesContext";


export default function App() {
  const location = useLocation();

  return (
    <>
      <SelectedValuesProvider>
        <ThemeSetup>
          {location.pathname !== '/' && <Navbar />}
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/conjunctions' element={<Conjunctions />} />
            <Route path='/conjunctions/:conjunctionId/manoeuvres' element={<ManoeuvreSuggestions />} />
            <Route path='/conjunctions/:conjunctionId/simulation' element={<ManoeuvreSequence />} />
          </Routes>
        </ThemeSetup>
      </SelectedValuesProvider>
    </>
  );
}
