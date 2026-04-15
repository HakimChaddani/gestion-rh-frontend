import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const [stats, setStats] = useState({
    employes: 0,
    departements: 0,
    conges: 0,
    congesEnAttente: 0,
  })
  const [employes, setEmployes] = useState([])
  const [departements, setDepartements] = useState([])
  const [conges, setConges] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emp, dep, con] = await Promise.all([
          api.get('/employes'),
          api.get('/departements'),
          api.get('/conges'),
        ])
        setEmployes(emp.data)
        setDepartements(dep.data)
        setConges(con.data)
        setStats({
          employes: emp.data.length,
          departements: dep.data.length,
          conges: con.data.length,
          congesEnAttente: con.data.filter(c => c.statut === 'en_attente').length,
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [])

  // Graphique 1 : Employés par département (Bar)
  const employesParDep = {
    labels: departements.map(d => d.nom),
    datasets: [
      {
        label: 'Nombre d\'employés',
        data: departements.map(d =>
          employes.filter(e => e.departement_id === d.id).length
        ),
        backgroundColor: [
          '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
          '#EF4444', '#06B6D4', '#F97316', '#84CC16',
        ],
        borderRadius: 8,
      },
    ],
  }

  // Graphique 2 : Statut des congés (Doughnut)
  const congesParStatut = {
    labels: ['En attente', 'Approuvés', 'Refusés'],
    datasets: [
      {
        data: [
          conges.filter(c => c.statut === 'en_attente').length,
          conges.filter(c => c.statut === 'approuve').length,
          conges.filter(c => c.statut === 'refuse').length,
        ],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  }

  // Graphique 3 : Statut des employés (Doughnut)
  const employesParStatut = {
    labels: ['Actifs', 'Inactifs'],
    datasets: [
      {
        data: [
          employes.filter(e => e.statut === 'actif').length,
          employes.filter(e => e.statut === 'inactif').length,
        ],
        backgroundColor: ['#3B82F6', '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  }

  const cards = [
    { label: 'Employés', value: stats.employes, icon: '👤', color: 'bg-blue-500' },
    { label: 'Départements', value: stats.departements, icon: '🏢', color: 'bg-green-500' },
    { label: 'Congés total', value: stats.conges, icon: '📅', color: 'bg-purple-500' },
    { label: 'Congés en attente', value: stats.congesEnAttente, icon: '⏳', color: 'bg-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
              <div className={`${card.color} text-white text-3xl w-14 h-14 rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">👥 Employés par département</h2>
            {departements.length > 0 ? (
              <Bar
                data={employesParDep}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            ) : (
              <p className="text-gray-400 text-center py-8">Aucun département trouvé</p>
            )}
          </div>

          {/* Doughnut congés */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Statut des congés</h2>
            {conges.length > 0 ? (
              <div className="flex justify-center">
                <div style={{ width: '280px' }}>
                  <Doughnut
                    data={congesParStatut}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Aucun congé trouvé</p>
            )}
          </div>
        </div>

        {/* Doughnut employés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Statut des employés</h2>
            {employes.length > 0 ? (
              <div className="flex justify-center">
                <div style={{ width: '280px' }}>
                  <Doughnut
                    data={employesParStatut}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Aucun employé trouvé</p>
            )}
          </div>

          {/* Résumé rapide */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Résumé rapide</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium">Taux d'activité</span>
                <span className="text-blue-600 font-bold">
                  {employes.length > 0
                    ? Math.round((employes.filter(e => e.statut === 'actif').length / employes.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-gray-700 font-medium">Congés approuvés</span>
                <span className="text-green-600 font-bold">
                  {conges.filter(c => c.statut === 'approuve').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                <span className="text-gray-700 font-medium">Congés en attente</span>
                <span className="text-orange-600 font-bold">
                  {conges.filter(c => c.statut === 'en_attente').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-gray-700 font-medium">Congés refusés</span>
                <span className="text-red-600 font-bold">
                  {conges.filter(c => c.statut === 'refuse').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}