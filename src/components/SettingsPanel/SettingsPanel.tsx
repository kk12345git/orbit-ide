import { useSettingsStore } from '../../stores/settingsStore'
import { useUIStore } from '../../stores/uiStore'
import type { Theme, ColorScheme, EditorFont, TabSize } from '../../stores/settingsStore'
import styles from './SettingsPanel.module.css'

const COLOR_SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'solarized', label: 'Solarized' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'high-contrast', label: 'High Contrast' },
]

const FONTS: { value: EditorFont; label: string }[] = [
  { value: 'jetbrains-mono', label: 'JetBrains Mono' },
  { value: 'fira-code', label: 'Fira Code' },
  { value: 'cascadia-code', label: 'Cascadia Code' },
  { value: 'system', label: 'System Monospace' },
]

export default function SettingsPanel() {
  const { theme, colorScheme, editorFont, fontSize, tabSize, wordWrap,
    setTheme, setColorScheme, setEditorFont, setFontSize, setTabSize, toggleWordWrap } = useSettingsStore()
  const setSettingsOpen = useUIStore(s => s.setSettingsOpen)

  return (
    <div className={styles.overlay} onClick={() => setSettingsOpen(false)}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚙️ Settings</h2>
          <button className={styles.closeBtn} onClick={() => setSettingsOpen(false)}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Theme */}
          <section className={styles.section}>
            <label className={styles.label}>Theme</label>
            <div className={styles.segmented}>
              {(['dark', 'light'] as Theme[]).map(t => (
                <button
                  key={t}
                  className={`${styles.segBtn} ${theme === t ? styles.active : ''}`}
                  onClick={() => setTheme(t)}
                >{t === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
              ))}
            </div>
          </section>

          {/* Color Scheme */}
          <section className={styles.section}>
            <label className={styles.label}>Color Scheme</label>
            <select
              className={styles.select}
              value={colorScheme}
              onChange={e => setColorScheme(e.target.value as ColorScheme)}
            >
              {COLOR_SCHEMES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </section>

          {/* Font */}
          <section className={styles.section}>
            <label className={styles.label}>Editor Font</label>
            <select
              className={styles.select}
              value={editorFont}
              onChange={e => setEditorFont(e.target.value as EditorFont)}
            >
              {FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </section>

          {/* Font Size */}
          <section className={styles.section}>
            <label className={styles.label}>Font Size: {fontSize}px</label>
            <div className={styles.row}>
              <button className={styles.iconBtn} onClick={() => setFontSize(fontSize - 1)}>−</button>
              <input
                type="range"
                min={10} max={24}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className={styles.slider}
              />
              <button className={styles.iconBtn} onClick={() => setFontSize(fontSize + 1)}>+</button>
            </div>
          </section>

          {/* Tab Size */}
          <section className={styles.section}>
            <label className={styles.label}>Tab Size</label>
            <div className={styles.segmented}>
              {([2, 4] as TabSize[]).map(n => (
                <button
                  key={n}
                  className={`${styles.segBtn} ${tabSize === n ? styles.active : ''}`}
                  onClick={() => setTabSize(n)}
                >{n} spaces</button>
              ))}
            </div>
          </section>

          {/* Word Wrap */}
          <section className={styles.section}>
            <label className={styles.label}>Word Wrap</label>
            <button
              className={`${styles.segBtn} ${wordWrap ? styles.active : ''}`}
              onClick={toggleWordWrap}
            >{wordWrap ? '✅ On' : '⬜ Off'}</button>
          </section>
        </div>
      </div>
    </div>
  )
}
