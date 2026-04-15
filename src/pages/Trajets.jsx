import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Trajets() {
  const [trajets, setTrajets] = useState([])
  const [employes, setEmployes] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterOperation, setFilterOperation] = useState('')
  const [form, setForm] = useState({
    employe_id: '', vehicule_id: '', date_entree: '',
    date_sortie: '', operation: 'STATIONNEMENT',
    nombre_jours: 1, prix_unitaire: ''
  })

  const operations = [
    'STATIONNEMENT',
    'DEBARDAGE TRACTEUR',
    'DEPLACEMENT',
  ]

  const fetchData = async () => {
    const [tra, emp, veh] = await Promise.all([
      api.get('/trajets'),
      api.get('/employes'),
      api.get('/vehicules'),
    ])
    setTrajets(tra.data)
    setEmployes(emp.data)
    setVehicules(veh.data)
  }

  useEffect(() => { fetchData() }, [])

  const montant = (t) => (Number(t.nombre_jours) * Number(t.prix_unitaire)).toLocaleString()
  const montantForm = () => (Number(form.nombre_jours) * Number(form.prix_unitaire)).toLocaleString()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editId) {
      await api.put(`/trajets/${editId}`, form)
    } else {
      await api.post('/trajets', form)
    }
    setShowModal(false)
    setEditId(null)
    setForm({ employe_id: '', vehicule_id: '', date_entree: '', date_sortie: '', operation: 'STATIONNEMENT', nombre_jours: 1, prix_unitaire: '' })
    fetchData()
  }

  const handleEdit = (t) => {
    setForm({
      employe_id: t.employe_id,
      vehicule_id: t.vehicule_id,
      date_entree: t.date_entree,
      date_sortie: t.date_sortie || '',
      operation: t.operation,
      nombre_jours: t.nombre_jours,
      prix_unitaire: t.prix_unitaire,
    })
    setEditId(t.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette opération ?')) {
      await api.delete(`/trajets/${id}`)
      fetchData()
    }
  }

  const totalMontant = trajets.reduce((sum, t) => sum + Number(t.nombre_jours) * Number(t.prix_unitaire), 0)

  const filtered = trajets.filter(t => {
    const vehicule = t.vehicule?.immatriculation?.toLowerCase() || ''
    const matchSearch = search === '' || vehicule.includes(search.toLowerCase())
    const matchOp = filterOperation === '' || t.operation === filterOperation
    return matchSearch && matchOp
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🚛 Opérations Véhicules</h1>
          <button onClick={() => { setShowModal(true); setEditId(null) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            + Nouvelle opération
          </button>
        </div>

        {/* Total */}
        <div className="bg-blue-600 text-white rounded-2xl shadow p-4 mb-4 flex justify-between items-center">
          <span className="font-medium">💰 Total des opérations</span>
          <span className="text-2xl font-bold">{totalMontant.toLocaleString()} MAD</span>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-wrap gap-3">
          <input type="text" placeholder="🔍 Rechercher par véhicule..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <select value={filterOperation} onChange={(e) => setFilterOperation(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Toutes les opérations</option>
            {operations.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          {(search || filterOperation) && (
            <button onClick={() => { setSearch(''); setFilterOperation('') }}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">
              ✕ Réinitialiser
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2">{filtered.length} opération(s)</p>

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Date Entrée', 'Date Sortie', 'Véhicule', 'Chauffeur', 'Opération', 'Nbre Jours', 'Prix Unitaire', 'Montant', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">{t.date_entree}</td>
                  <td className="px-3 py-3 text-gray-400">{t.date_sortie || '—'}</td>
                  <td className="px-3 py-3 font-bold">{t.vehicule?.immatriculation}</td>
                  <td className="px-3 py-3">{t.chauffeur?.prenom} {t.chauffeur?.nom}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.operation === 'STATIONNEMENT' ? 'bg-orange-100 text-orange-600' :
                      t.operation === 'DEBARDAGE TRACTEUR' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{t.operation}</span>
                  </td>
                  <td className="px-3 py-3 text-center">{t.nombre_jours}</td>
                  <td className="px-3 py-3">{Number(t.prix_unitaire).toLocaleString()}</td>
                  <td className="px-3 py-3 font-bold text-green-600">{montant(t)}</td>
                  <td className="px-3 py-3 flex gap-1">
                    <button onClick={() => handleEdit(t)} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200">✏️</button>
                    <button onClick={() => handleDelete(t.id)} className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200">🗑️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-gray-400 py-8">Aucune opération trouvée</td></tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={7} className="px-3 py-3 text-right">TOTAL</td>
                  <td className="px-3 py-3 text-green-600">
                    {filtered.reduce((sum, t) => sum + Number(t.nombre_jours) * Number(t.prix_unitaire), 0).toLocaleString()} MAD
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editId ? 'Modifier' : 'Nouvelle'} opération</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chauffeur</label>
                  <select value={form.employe_id} onChange={(e) => setForm({ ...form, employe_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">-- Choisir --</option>
                    {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
                  <select value={form.vehicule_id} onChange={(e) => setForm({ ...form, vehicule_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">-- Choisir --</option>
                    {vehicules.map(v => <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opération</label>
                <select value={form.operation} onChange={(e) => setForm({ ...form, operation: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  {operations.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Entrée</label>
                  <input type="date" value={form.date_entree} onChange={(e) => setForm({ ...form, date_entree: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Sortie</label>
                  <input type="date" value={form.date_sortie} onChange={(e) => setForm({ ...form, date_sortie: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de jours</label>
                  <input type="number" min="1" value={form.nombre_jours} onChange={(e) => setForm({ ...form, nombre_jours: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (MAD)</label>
                  <input type="number" value={form.prix_unitaire} onChange={(e) => setForm({ ...form, prix_unitaire: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              {/* Montant calculé */}
              {form.nombre_jours && form.prix_unitaire && (
                <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">💰 Montant calculé</span>
                  <span className="text-green-600 font-bold text-lg">{montantForm()} MAD</span>
                </div>
              )}

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