import type { Route } from '../../hooks/useHashRouter'
import { useExport } from '../../context'
import { ExportButton } from '../ExportButton'
import styles from './NavHeader.module.css'

interface NavHeaderProps {
  currentRoute: Route
  onNavigate: (route: Route) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function NavHeader({ currentRoute, onNavigate, theme, onToggleTheme }: NavHeaderProps) {
  const { exportOptions, targetRef } = useExport()
  const showExport = exportOptions !== null && targetRef !== null

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Harp Diem</h1>

      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <button
          className={`${styles.navTab} ${currentRoute === '/' ? styles.navTabActive : ''}`}
          onClick={() => onNavigate('/')}
          aria-current={currentRoute === '/' ? 'page' : undefined}
        >
          Scales
        </button>
        <button
          className={`${styles.navTab} ${currentRoute === '/quiz' ? styles.navTabActive : ''}`}
          onClick={() => onNavigate('/quiz')}
          aria-current={currentRoute === '/quiz' ? 'page' : undefined}
        >
          Quiz
        </button>
      </nav>

      <div className={styles.actions}>
        {showExport && (
          <ExportButton exportOptions={exportOptions} targetRef={targetRef} />
        )}
        <button
          className={styles.themeToggle}
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
        </button>
      </div>
    </header>
  )
}
