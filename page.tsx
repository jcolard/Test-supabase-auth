'use client'
import { useState, useEffect } from 'react'
import { createClient, CATEGORIES, type ExpenseReport } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// ── Auth Page ──────────────────────────────────────────────────────────────
function AuthPage({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setMessage('')
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else if (data.user) onAuth(data.user)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Compte créé ! Vérifiez votre email pour confirmer.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #6ee7b7, #34d399)', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '22px' }}>💼</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.02em' }}>Notes de Frais</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Gérez vos dépenses professionnelles</p>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '10px', padding: '4px', marginBottom: '24px', gap: '4px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Syne, sans-serif', fontWeight: '600', transition: 'all 0.2s',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--muted)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none'
                }}>
                {m === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label>Email</label>
              <input type="email" placeholder="vous@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Mot de passe</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
            {message && <div style={{ background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.3)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>{message}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? <span className="spin">⟳</span> : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Expense Form ───────────────────────────────────────────────────────────
function ExpenseForm({ userId, onSaved, onCancel }: { userId: string; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], amount: '', category: 'transport', description: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    let receipt_path = null; let receipt_name = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('receipts').upload(path, file)
      if (uploadError) { setError('Erreur upload: ' + uploadError.message); setLoading(false); return }
      receipt_path = path; receipt_name = file.name
    }

    const { error } = await supabase.from('expense_reports').insert({
      user_id: userId, date: form.date, amount: parseFloat(form.amount),
      category: form.category, description: form.description, receipt_path, receipt_name
    })
    if (error) setError(error.message)
    else onSaved()
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Nouvelle note de frais</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label>Montant (€)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>
          <div>
            <label>Catégorie</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
          </div>
          <div>
            <label>Description</label>
            <textarea placeholder="Décrivez la dépense..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label>Justificatif (optionnel)</label>
            <div style={{ border: '1px dashed var(--border)', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
              onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); e.currentTarget.style.borderColor = 'var(--border)' }}>
              <input type="file" accept=".pdf,image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => e.target.files && setFile(e.target.files[0])} />
              {file ? (
                <div style={{ color: 'var(--accent)', fontSize: '13px' }}>📎 {file.name}</div>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Glisser un fichier ou <span style={{ color: 'var(--accent)' }}>parcourir</span><br /><span style={{ fontSize: '11px' }}>PDF, JPG, PNG — max 10 Mo</span></div>
              )}
            </div>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? <span className="spin">⟳</span> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Expense Card ───────────────────────────────────────────────────────────
function ExpenseCard({ expense, onDelete }: { expense: ExpenseReport; onDelete: (id: string) => void }) {
  const supabase = createClient()
  const cat = CATEGORIES[expense.category]

  async function openReceipt() {
    if (!expense.receipt_path) return
    const { data } = await supabase.storage.from('receipts').createSignedUrl(expense.receipt_path, 60)
    if (data) window.open(data.signedUrl, '_blank')
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette note de frais ?')) return
    if (expense.receipt_path) await supabase.storage.from('receipts').remove([expense.receipt_path])
    await supabase.from('expense_reports').delete().eq('id', expense.id)
    onDelete(expense.id)
  }

  return (
    <div className="card card-hover fade-in" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '42px', height: '42px', background: 'var(--surface2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{cat.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className={`tag tag-${expense.category}`}>{cat.label}</span>
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(expense.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.description}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: 'var(--accent)' }}>{expense.amount.toFixed(2)} €</span>
        {expense.receipt_path && (
          <button onClick={openReceipt} title="Voir justificatif" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>📎</button>
        )}
        <button onClick={handleDelete} title="Supprimer" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', fontSize: '13px', lineHeight: 1, color: '#f87171' }}>✕</button>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [expenses, setExpenses] = useState<ExpenseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => { fetchExpenses() }, [])

  async function fetchExpenses() {
    setLoading(true)
    const { data } = await supabase.from('expense_reports').select('*').order('date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const thisMonth = expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0,7))).reduce((s, e) => s + e.amount, 0)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #6ee7b7, #34d399)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💼</div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Notes de Frais</h1>
            <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0 }}>{user.email}</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Déconnexion</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: total.toFixed(2) + ' €', sub: expenses.length + ' note' + (expenses.length > 1 ? 's' : '') },
          { label: 'Ce mois', value: thisMonth.toFixed(2) + ' €', sub: new Date().toLocaleDateString('fr-FR', { month: 'long' }) },
          { label: 'Catégories', value: new Set(expenses.map(e => e.category)).size.toString(), sub: 'types de dépenses' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: '700', color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Actions + Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '5px 12px', borderRadius: '99px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontFamily: 'Syne', fontWeight: '600', transition: 'all 0.2s', borderColor: filter === 'all' ? 'var(--accent)' : 'var(--border)', background: filter === 'all' ? 'rgba(110,231,183,0.1)' : 'transparent', color: filter === 'all' ? 'var(--accent)' : 'var(--muted)' }}>Tout</button>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: '5px 12px', borderRadius: '99px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontFamily: 'Syne', fontWeight: '600', transition: 'all 0.2s', borderColor: filter === k ? 'var(--accent)' : 'var(--border)', background: filter === k ? 'rgba(110,231,183,0.1)' : 'transparent', color: filter === k ? 'var(--accent)' : 'var(--muted)' }}>{v.emoji} {v.label}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', paddingLeft: '20px', paddingRight: '20px' }}>
          + Nouvelle note
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}><span className="spin" style={{ fontSize: '24px' }}>⟳</span></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗂️</div>
          <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>Aucune note de frais{filter !== 'all' ? ' dans cette catégorie' : ''}</p>
          {filter === 'all' && <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>Cliquez sur "+ Nouvelle note" pour commencer</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(e => <ExpenseCard key={e.id} expense={e} onDelete={id => setExpenses(prev => prev.filter(ex => ex.id !== id))} />)}
        </div>
      )}

      {showForm && <ExpenseForm userId={user.id} onSaved={() => { setShowForm(false); fetchExpenses() }} onCancel={() => setShowForm(false)} />}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user || null); setChecking(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user || null))
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spin" style={{ fontSize: '28px', color: 'var(--accent)' }}>⟳</span>
    </div>
  )

  if (!user) return <AuthPage onAuth={setUser} />
  return <Dashboard user={user} onLogout={handleLogout} />
}
