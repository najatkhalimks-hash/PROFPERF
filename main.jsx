import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ── État langue unique, partagé entre le bouton et toute l'App ───────────
function Root() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('gsmi_lang') || 'fr' } catch { return 'fr' }
  })

  function switchLang(l) {
    setLang(l)
    try { localStorage.setItem('gsmi_lang', l) } catch {}
  }

  return (
    <>
      {/* Bouton FR/EN fixe visible sur toutes les vues */}
      <div style={{ position:'fixed', top:12, right:14, zIndex:10000 }}>
        <div style={{ display:'flex', background:'rgba(13,27,42,.92)', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.3)' }}>
          {['fr','en'].map(l => (
            <button key={l} onClick={() => switchLang(l)}
              style={{ padding:'6px 13px', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit',
                       background: lang===l ? '#1A56DB' : 'transparent',
                       color: lang===l ? '#fff' : 'rgba(255,255,255,.5)',
                       transition:'background .15s' }}>
              {l==='fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </button>
          ))}
        </div>
      </div>
      {/* App reçoit lang comme prop — re-render garanti à chaque changement */}
      <App lang={lang} />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
