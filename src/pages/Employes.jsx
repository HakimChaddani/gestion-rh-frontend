import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Employes() {
  const [employes, setEmployes] = useState([])
  const [departements, setDepartements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDep, setFilterDep] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    poste: '', date_embauche: '', salaire: '', departement_id: ''
  })

  const fetchData = async () => {
    const [emp, dep] = await Promise.all([api.get('/employes'), api.get('/departements')])
    setEmployes(emp.data)
    setDepartements(dep.data)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editId) {
      await api.put(`/employes/${editId}`, form)
    } else {
      await api.post('/employes', form)
    }
    setShowModal(false)
    setEditId(null)
    setForm({ nom: '', prenom: '', email: '', telephone: '', poste: '', date_embauche: '', salaire: '', departement_id: '' })
    fetchData()
  }

  const handleEdit = (emp) => {
    setForm({
      nom: emp.nom, prenom: emp.prenom, email: emp.email,
      telephone: emp.telephone || '', poste: emp.poste,
      date_embauche: emp.date_embauche, salaire: emp.salaire,
      departement_id: emp.departement_id
    })
    setEditId(emp.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet employé ?')) {
      await api.delete(`/employes/${id}`)
      fetchData()
    }
  }

  // Filtrage
  const filtered = employes.filter(emp => {
    const matchSearch = search === '' ||
      emp.nom.toLowerCase().includes(search.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.poste.toLowerCase().includes(search.toLowerCase())
    const matchDep = filterDep === '' || emp.departement_id === parseInt(filterDep)
    const matchStatut = filterStatut === '' || emp.statut === filterStatut
    return matchSearch && matchDep && matchStatut
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👤 Employés</h1>
          <button onClick={() => { setShowModal(true); setEditId(null) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            + Ajouter
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom, email, poste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={filterDep}
            onChange={(e) => setFilterDep(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Tous les départements</option>
            {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          {(search || filterDep || filterStatut) && (
            <button
              onClick={() => { setSearch(''); setFilterDep(''); setFilterStatut('') }}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {/* Résultat */}
        <p className="text-sm text-gray-500 mb-2">{filtered.length} employé(s) trouvé(s)</p>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Nom', 'Email', 'Poste', 'Département', 'Salaire', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{emp.prenom} {emp.nom}</td>
                  <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                  <td className="px-4 py-3">{emp.poste}</td>
                  <td className="px-4 py-3">{emp.departement?.nom || '-'}</td>
                  <td className="px-4 py-3">{Number(emp.salaire).toLocaleString()} MAD</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {emp.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(emp)} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs hover:bg-yellow-200">✏️</button>
                    <button onClick={() => handleDelete(emp.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-red-200">🗑️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">Aucun employé trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editId ? 'Modifier' : 'Ajouter'} un employé</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                <input value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
                  <input type="date" value={form.date_embauche} onChange={(e) => setForm({ ...form, date_embauche: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (MAD)</label>
                  <input type="number" value={form.salaire} onChange={(e) => setForm({ ...form, salaire: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                <select value={form.departement_id} onChange={(e) => setForm({ ...form, departement_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Choisir --</option>
                  {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
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