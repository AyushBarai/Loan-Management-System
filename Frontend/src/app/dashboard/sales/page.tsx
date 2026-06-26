'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface Lead {
  _id: string
  name: string
  email: string
  createdAt: string
  hasApplied: boolean
}

export default function SalesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (!['admin', 'sales'].includes(user.role)) { router.push('/dashboard'); return }
    api.get('/executive/leads')
      .then(res => setLeads(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, router])

  const applied = leads.filter(l => l.hasApplied)
  const pending = leads.filter(l => !l.hasApplied)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales — Lead Tracking</h1>
        <p className="text-gray-500 mt-1">Monitor registered borrowers and their application status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Registered', value: leads.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Applied', value: applied.length, color: 'bg-green-50 text-green-700' },
          { label: 'Not Yet Applied', value: pending.length, color: 'bg-yellow-50 text-yellow-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card text-center text-gray-400 py-12">Loading leads...</div>
      ) : (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">All Borrowers</h2>
          {leads.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No borrowers registered yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Name</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Registered</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-900">{lead.name}</td>
                      <td className="py-3 px-2 text-gray-600">{lead.email}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`badge ${lead.hasApplied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {lead.hasApplied ? 'Applied' : 'Not Applied'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}