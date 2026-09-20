'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  User, Lock, Sliders, Trash2, Loader2,
  CheckCircle, AlertCircle, ChevronRight, Eye, EyeOff,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'

type Tab = 'profile' | 'password' | 'preferences' | 'danger'

interface UserData {
  id: string
  name: string
  email: string
  createdAt: string
  preferences: {
    defaultTimeframe: string
    defaultProvider: string
    theme: string
  } | null
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Success / error messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // Form states
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [defaultTimeframe, setDefaultTimeframe] = useState('1h')
  const [defaultProvider, setDefaultProvider] = useState('mock')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') fetchSettings()
  }, [status])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (res.ok) {
        setUserData(data.user)
        setName(data.user.name || '')
        setDefaultTimeframe(data.user.preferences?.defaultTimeframe || '1h')
        setDefaultProvider(data.user.preferences?.defaultProvider || 'mock')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', name }),
      })
      const data = await res.json()
      if (res.ok) {
        showMsg('success', 'Profile updated successfully')
        await update({ name })
        fetchSettings()
      } else {
        showMsg('error', data.error || 'Failed to update profile')
      }
    } catch {
      showMsg('error', 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showMsg('error', 'New passwords do not match')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        showMsg('success', 'Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showMsg('error', data.error || 'Failed to update password')
      }
    } catch {
      showMsg('error', 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'preferences', defaultTimeframe, defaultProvider }),
      })
      const data = await res.json()
      if (res.ok) {
        showMsg('success', 'Preferences saved')
      } else {
        showMsg('error', data.error || 'Failed to save preferences')
      }
    } catch {
      showMsg('error', 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== session?.user?.email) {
      showMsg('error', 'Email does not match')
      return
    }
    try {
      const res = await fetch('/api/settings', { method: 'DELETE' })
      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      } else {
        showMsg('error', 'Failed to delete account')
      }
    } catch {
      showMsg('error', 'Something went wrong')
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',     label: 'Profile',      icon: <User size={16} /> },
    { id: 'password',    label: 'Password',     icon: <Lock size={16} /> },
    { id: 'preferences', label: 'Preferences',  icon: <Sliders size={16} /> },
    { id: 'danger',      label: 'Danger Zone',  icon: <Trash2 size={16} /> },
  ]

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Toast message */}
        {message && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}>
            {message.type === 'success'
              ? <CheckCircle size={16} />
              : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar tabs */}
          <nav className="md:w-52 flex-shrink-0">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-2">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                      } ${tab.id === 'danger' ? '!text-red-500 hover:!bg-red-500/10' : ''}`}
                    >
                      {tab.icon}
                      {tab.label}
                      {activeTab === tab.id && (
                        <ChevronRight size={14} className="ml-auto" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── Profile ── */}
            {activeTab === 'profile' && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-base font-semibold text-[var(--foreground)] mb-6">Profile</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {userData?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{userData?.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{userData?.email}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Member since {userData?.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userData?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--muted-foreground)] cursor-not-allowed"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Email cannot be changed</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Password ── */}
            {activeTab === 'password' && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-base font-semibold text-[var(--foreground)] mb-1">Change Password</h2>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  Use a strong password with at least 6 characters.
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Current */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-10 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-10 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 bg-[var(--background)] border rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-500'
                          : 'border-[var(--border)]'
                      }`}
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving || (!!confirmPassword && newPassword !== confirmPassword)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Preferences ── */}
            {activeTab === 'preferences' && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-base font-semibold text-[var(--foreground)] mb-1">Preferences</h2>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  Customize your trading experience.
                </p>

                <form onSubmit={handleUpdatePreferences} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Default Timeframe
                    </label>
                    <select
                      value={defaultTimeframe}
                      onChange={(e) => setDefaultTimeframe(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {['1m','5m','15m','30m','1h','4h','1D','1W'].map(tf => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Used as default when opening charts and analysis
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Market Data Provider
                    </label>
                    <select
                      value={defaultProvider}
                      onChange={(e) => setDefaultProvider(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="mock">Mock (Demo Data)</option>
                      <option value="twelvedata">TwelveData (Real-Time)</option>
                      <option value="alphavantage">Alpha Vantage</option>
                    </select>
                  </div>

                  {/* Info cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[var(--muted)] rounded-lg">
                      <p className="text-xs font-medium text-[var(--foreground)] mb-1">AI Provider</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {process.env.NEXT_PUBLIC_AI_PROVIDER || 'Groq (LLaMA)'}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--muted)] rounded-lg">
                      <p className="text-xs font-medium text-[var(--foreground)] mb-1">Account Type</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Standard</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Danger Zone ── */}
            {activeTab === 'danger' && (
              <div className="bg-[var(--card)] border border-red-500/30 rounded-lg p-6">
                <h2 className="text-base font-semibold text-red-500 mb-1">Danger Zone</h2>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  These actions are irreversible. Please proceed with caution.
                </p>

                <div className="border border-red-500/20 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Delete Account</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Permanently delete your account, watchlist, journal, and all data. This cannot be undone.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--foreground)] mb-2">
                      Type your email to confirm: <span className="text-red-500">{session?.user?.email}</span>
                    </label>
                    <input
                      type="email"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={session?.user?.email || ''}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-red-500/30 rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== session?.user?.email}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  )
}
