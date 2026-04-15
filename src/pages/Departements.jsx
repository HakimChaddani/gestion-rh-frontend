import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Departements() {
  const [departements, setDepartements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nom: '', description: '' })
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  const fetchDepartements = async () => {
    const res = await api.get('/departements')
    setDepartements(res.data)
  }

  useEffect(() => { fetchDepartements() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editId) {
      await api.put(`/departements/${editId}`, form)
    } else {
      await api.post('/departements', form)
    }
    setShowModal(false)
    setForm({ nom: '', description: '' })
    setEditId(null)
    fetchDepartements()
  }

  const handleEdit = (dep) => {
    setForm({ nom: dep.nom, description: dep.description || '' })
    setEditId(dep.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce département ?')) {
      await api.delete(`/departements/${id}`)
      fetchDepartements()
    }
  }

  // Filtrage
  const filtered = departements.filter(dep =>
    search === '' ||
    dep.nom.toLowerCase().includes(search.toLowerCase()) ||
    (dep.description && dep.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏢 Départements</h1>
          <button
            onClick={() => { setShowModal(true); setEditId(null); setForm({ nom: '', description: '' }) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Ajouter
          </button>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex gap-3">
          <input
            type="text"
            placeholder="🔍 Rechercher un département..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2">{filtered.length} département(s) trouvé(s)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dep) => (
            <div key={dep.id} className="bg-white rounded-2xl shadow p-5">
              <div className="text-3xl mb-2">🏢</div>
              <h2 className="font-bold text-gray-800 text-lg">{dep.nom}</h2>
              <p className="text-gray-500 text-sm mt-1">{dep.description || 'Aucune description'}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(dep)} className="flex-1 bg-yellow-100 text-yellow-700 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-200">✏️ Modifier</button>
                <button onClick={() => handleDelete(dep.id)} className="flex-1 bg-red-100 text-red-600 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200">🗑️ Supprimer</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-8">Aucun département trouvé</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editId ? 'Modifier' : 'Ajouter'} un département</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
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