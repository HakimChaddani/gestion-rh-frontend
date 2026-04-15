import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employes from './pages/Employes'
import Departements from './pages/Departements'
import Conges from './pages/Conges'
import Trajets from './pages/Trajets'
import Vehicules from './pages/Vehicules'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employes" element={<PrivateRoute><Employes /></PrivateRoute>} />
          <Route path="/departements" element={<PrivateRoute><Departements /></PrivateRoute>} />
          <Route path="/conges" element={<PrivateRoute><Conges /></PrivateRoute>} />
          <Route path="/trajets" element={<PrivateRoute><Trajets /></PrivateRoute>} />
          <Route path="/vehicules" element={<PrivateRoute><Vehicules /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}