'use client'

import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

const THEME_STORAGE_KEY = 'pokesunshine-theme'

type Theme = 'light' | 'dark'

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function hasSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export default function ThemeToggle() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!hasSavedTheme()) {
        applyTheme(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  const handleToggle = () => {
    const nextTheme: Theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'

    applyTheme(nextTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // The theme still applies for this page when storage is unavailable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text transition-colors duration-150 hover:border-accent hover:bg-surface-hover hover:text-primary"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="theme-icon-light h-5 w-5" aria-hidden="true" />
      <Moon className="theme-icon-dark hidden h-5 w-5" aria-hidden="true" />
    </button>
  )
}
