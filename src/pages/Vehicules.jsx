import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Vehicules() {
  const [vehicules, setVehicules] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    immatriculation: '', marque: '', modele: '', capacite_kg: '', statut: 'disponible'
  })

  const fetchData = async () => {
    const res = await api.get('/vehicules')
    setVehicules(res.data)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editId) {
      await api.put(`/vehicules/${editId}`, form)
    } else {
      await api.post('/vehicules', form)
    }
    setShowModal(false)
    setEditId(null)
    setForm({ immatriculation: '', marque: '', modele: '', capacite_kg: '', statut: 'disponible' })
    fetchData()
  }

  const handleEdit = (v) => {
    setForm({ immatriculation: v.immatriculation, marque: v.marque, modele: v.modele, capacite_kg: v.capacite_kg, statut: v.statut })
    setEditId(v.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce véhicule ?')) {
      await api.delete(`/vehicules/${id}`)
      fetchData()
    }
  }

  const statutColor = (s) => {
    if (s === 'disponible') return 'bg-green-100 text-green-700'
    if (s === 'en_route') return 'bg-blue-100 text-blue-700'
    return 'bg-orange-100 text-orange-600'
  }

  const filtered = vehicules.filter(v =>
    search === '' ||
    v.immatriculation.toLowerCase().includes(search.toLowerCase()) ||
    v.marque.toLowerCase().includes(search.toLowerCase()) ||
    v.modele.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🚛 Véhicules</h1>
          <button onClick={() => { setShowModal(true); setEditId(null); setForm({ immatriculation: '', marque: '', modele: '', capacite_kg: '', statut: 'disponible' }) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            + Ajouter
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex gap-3">
          <input type="text" placeholder="🔍 Rechercher un véhicule..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          {search && <button onClick={() => setSearch('')} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">✕</button>}
        </div>

        <p className="text-sm text-gray-500 mb-2">{filtered.length} véhicule(s)</p>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Immatriculation', 'Marque', 'Modèle', 'Capacité (kg)', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">{v.immatriculation}</td>
                  <td className="px-4 py-3">{v.marque}</td>
                  <td className="px-4 py-3">{v.modele}</td>
                  <td className="px-4 py-3">{Number(v.capacite_kg).toLocaleString()} kg</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColor(v.statut)}`}>{v.statut}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(v)} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs hover:bg-yellow-200">✏️</button>
                    <button onClick={() => handleDelete(v.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-red-200">🗑️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Aucun véhicule trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editId ? 'Modifier' : 'Ajouter'} un véhicule</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                <input value={form.immatriculation} onChange={(e) => setForm({ ...form, immatriculation: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                  <input value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                  <input value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (kg)</label>
                <input type="number" value={form.capacite_kg} onChange={(e) => setForm({ ...form, capacite_kg: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="disponible">Disponible</option>
                  <option value="en_route">En route</option>
                  <option value="maintenance">Maintenance</option>
                </select>
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