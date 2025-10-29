import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './paginas/Login';
import { Tablero } from './paginas/Tablero';
import { RutaProtegida } from './componentes/comunes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/tablero"
          element={
            <RutaProtegida>
              <Tablero />
            </RutaProtegida>
          }
        />
        <Route path="/" element={<Navigate to="/tablero" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
