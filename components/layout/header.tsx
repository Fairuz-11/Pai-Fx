'use client'

import { Search, User, Bell, Circle, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const [marketStatus] = useState<'open' | 'closed'>('open')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--card)] border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search pairs..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Market Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--muted)]">
            <Circle
              size={8}
              className={marketStatus === 'open' ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500'}
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Market {marketStatus === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>

          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-[var(--muted)] animate-pulse" />
          ) : session ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                <Bell size={20} className="text-[var(--muted-foreground)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">
                    {session.user?.name || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg py-2 z-20">
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <SettingsIcon size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-[var(--background)] transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
