import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Conges() {
  const [conges, setConges] = useState([])
  const [employes, setEmployes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employe_id: '', date_debut: '', date_fin: '', motif: '' })
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterEmploye, setFilterEmploye] = useState('')

  const fetchData = async () => {
    const [con, emp] = await Promise.all([api.get('/conges'), api.get('/employes')])
    setConges(con.data)
    setEmployes(emp.data)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/conges', form)
    setShowModal(false)
    setForm({ employe_id: '', date_debut: '', date_fin: '', motif: '' })
    fetchData()
  }

  const handleStatut = async (id, statut) => {
    await api.put(`/conges/${id}`, { statut })
    fetchData()
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce congé ?')) {
      await api.delete(`/conges/${id}`)
      fetchData()
    }
  }

  const badgeColor = (statut) => {
    if (statut === 'approuve') return 'bg-green-100 text-green-700'
    if (statut === 'refuse') return 'bg-red-100 text-red-600'
    return 'bg-orange-100 text-orange-600'
  }

  // Filtrage
  const filtered = conges.filter(con => {
    const nomComplet = `${con.employe?.prenom} ${con.employe?.nom}`.toLowerCase()
    const matchSearch = search === '' ||
      nomComplet.includes(search.toLowerCase()) ||
      con.motif.toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut === '' || con.statut === filterStatut
    const matchEmploye = filterEmploye === '' || con.employe_id === parseInt(filterEmploye)
    return matchSearch && matchStatut && matchEmploye
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📅 Congés</h1>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            + Demande de congé
          </button>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Rechercher par employé ou motif..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={filterEmploye}
            onChange={(e) => setFilterEmploye(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Tous les employés</option>
            {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="approuve">Approuvé</option>
            <option value="refuse">Refusé</option>
          </select>
          {(search || filterStatut || filterEmploye) && (
            <button
              onClick={() => { setSearch(''); setFilterStatut(''); setFilterEmploye('') }}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2">{filtered.length} congé(s) trouvé(s)</p>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Employé', 'Début', 'Fin', 'Motif', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((con) => (
                <tr key={con.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{con.employe?.prenom} {con.employe?.nom}</td>
                  <td className="px-4 py-3">{con.date_debut}</td>
                  <td className="px-4 py-3">{con.date_fin}</td>
                  <td className="px-4 py-3 text-gray-500">{con.motif}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor(con.statut)}`}>
                      {con.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {con.statut === 'en_attente' && (
                        <>
                          <button onClick={() => handleStatut(con.id, 'approuve')} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200">✅</button>
                          <button onClick={() => handleStatut(con.id, 'refuse')} className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200">❌</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(con.id)} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-200">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Aucun congé trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nouvelle demande de congé</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                <select value={form.employe_id} onChange={(e) => setForm({ ...form, employe_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Choisir --</option>
                  {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Enregistrer</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}