import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/', label: '🏠 Dashboard' },
    { to: '/employes', label: '👤 Employés' },
    { to: '/departements', label: '🏢 Départements' },
    { to: '/conges', label: '📅 Congés' },
    { to: '/trajets', label: '🚚 Trajets' },
    { to: '/vehicules', label: '🚛 Véhicules' },
  ]

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <span className="font-bold text-lg">👥 Gestion RH & Transport</span>
        <div className="flex items-center gap-1 flex-wrap">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === link.to
                  ? 'bg-white text-blue-700'
                  : 'hover:bg-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}