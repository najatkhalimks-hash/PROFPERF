// ══════════════════════════════════════════════════════════════════════════
// GSMI RMIS — CV académique automatique (§21)
// Généré à 100% depuis les données déjà saisies. Aucune ressaisie.
// Export : fenêtre imprimable → "Enregistrer en PDF" (natif navigateur,
// fiable sans dépendance serveur ni librairie PDF lourde).
// ══════════════════════════════════════════════════════════════════════════
import { getPublicationsByDeclarant, getEncadrementsByPerson, getRayonnementsByPerson, getEnseignementsByPerson } from './db.js'
import { computeRealisations } from './kpi_engine.js'

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

const LABELS = {
  fr: {
    cv: 'Curriculum Vitae Académique', orcid: 'ORCID', scopus: 'Scopus Author ID',
    contact: 'Contact', publications: 'Publications', formation: 'Encadrement académique',
    enseignement: 'Enseignement', rayonnement: 'Rayonnement & Valorisation',
    expertise: "Domaines d'expertise", hindex: 'H-index', generated: 'Généré automatiquement le',
    soumise:'Soumise', acceptee:'Acceptée', publiee:'Publiée',
  },
  en: {
    cv: 'Academic Curriculum Vitae', orcid: 'ORCID', scopus: 'Scopus Author ID',
    contact: 'Contact', publications: 'Publications', formation: 'Academic Supervision',
    enseignement: 'Teaching', rayonnement: 'Outreach & Valorization',
    expertise: 'Areas of Expertise', hindex: 'H-index', generated: 'Automatically generated on',
    soumise:'Submitted', acceptee:'Accepted', publiee:'Published',
  },
}

export function generateCVHtml(chercheur, opts = {}) {
  const lang = opts.lang || 'fr'
  const short = opts.short || false
  const L = LABELS[lang]
  const email = chercheur.email
  const pubs = getPublicationsByDeclarant(email).sort((a,b) => (b.year||'').localeCompare(a.year||''))
  const enc  = getEncadrementsByPerson(email)
  const ray  = getRayonnementsByPerson(email)
  const ens  = getEnseignementsByPerson(email)
  const pubsShown = short ? pubs.slice(0, 10) : pubs

  const pubItems = pubsShown.map(p => {
    const decl = (p.declarants||[]).find(d => d.email === email)
    return `<li><strong>${esc(p.authors || decl?.nom || '')}</strong> (${esc(p.year||'')}). ${esc(p.title)}.
      <em>${esc(p.source||'')}</em>${p.volume ? ', vol. '+esc(p.volume) : ''}${p.pages ? ', pp. '+esc(p.pages) : ''}.
      ${p.doi ? `DOI: ${esc(p.doi)}` : ''} ${p.quartile && p.quartile !== 'Non classé' ? `[${esc(p.quartile)}]` : ''}</li>`
  }).join('')

  const encItems = enc.map(e => `<li>${esc(e.type)} — ${esc(e.etudiant)} : « ${esc(e.sujet)} » (${esc(e.statut)})</li>`).join('')
  const rayItems = ray.map(r => `<li>${esc(r.categorie)} — ${esc(r.titre)}${r.partenaire ? ' · '+esc(r.partenaire) : ''}</li>`).join('')
  const ensItems = ens.map(e => `<li>${esc(e.module)} (${esc(e.filiere||'')}) — ${esc(e.heures)}h — ${esc(e.semestre)} ${esc(e.annee_academique)}</li>`).join('')

  const expertiseBlock = chercheur.expertise_domaines
    ? `<div class="section"><h2>${L.expertise}</h2><p>${esc(chercheur.expertise_domaines).replace(/\n/g,'<br>')}</p></div>` : ''

  return `<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="UTF-8">
<title>CV — ${esc(chercheur.nom)} ${esc(chercheur.prenom||'')}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;max-width:780px;margin:40px auto;color:#111928;line-height:1.5;padding:0 24px}
  h1{font-size:26px;margin:0 0 4px;color:#0D1B2A}
  .subtitle{color:#6B7280;font-size:14px;margin:0 0 20px}
  h2{font-size:16px;color:#0D1B2A;border-bottom:2px solid #047481;padding-bottom:4px;margin:28px 0 12px;text-transform:uppercase;letter-spacing:.04em}
  .contact{font-size:13px;color:#374151;margin-bottom:6px}
  .ids{font-size:12px;color:#6B7280;margin-bottom:18px}
  ul{padding-left:20px;font-size:13px}
  li{margin-bottom:8px}
  .footer{margin-top:36px;font-size:11px;color:#9CA3AF;border-top:1px solid #E5E7EB;padding-top:10px}
  @media print{ body{margin:0;padding:20px} }
</style></head>
<body>
  <h1>${esc(chercheur.prenom||'')} ${esc(chercheur.nom)}</h1>
  <p class="subtitle">${esc(chercheur.grade||'')} — ${esc(chercheur.axe_principal||'')} — GSMI / UM6P</p>
  <p class="contact">📧 ${esc(chercheur.email)} ${chercheur.telephone ? ' · 📞 '+esc(chercheur.telephone) : ''}</p>
  <p class="ids">
    ${chercheur.orcid ? `${L.orcid}: ${esc(chercheur.orcid)} · ` : ''}
    ${chercheur.scopus_id ? `${L.scopus}: ${esc(chercheur.scopus_id)} · ` : ''}
    ${chercheur.h_index ? `${L.hindex}: ${esc(chercheur.h_index)}` : ''}
  </p>

  ${expertiseBlock}

  <div class="section"><h2>${L.publications} (${pubs.length})</h2><ul>${pubItems || '<li>—</li>'}</ul></div>
  ${encItems ? `<div class="section"><h2>${L.formation}</h2><ul>${encItems}</ul></div>` : ''}
  ${ensItems ? `<div class="section"><h2>${L.enseignement}</h2><ul>${ensItems}</ul></div>` : ''}
  ${rayItems ? `<div class="section"><h2>${L.rayonnement}</h2><ul>${rayItems}</ul></div>` : ''}

  <p class="footer">${L.generated} ${new Date().toLocaleDateString(lang==='fr'?'fr-MA':'en-US')} — GSMI Research Management Information System</p>
  <script>window.onload = () => setTimeout(() => window.print(), 400)</script>
</body></html>`
}

export function openCVForPrint(chercheur, opts) {
  const html = generateCVHtml(chercheur, opts)
  const win = window.open('', '_blank')
  if (!win) { alert('Veuillez autoriser les fenêtres pop-up pour générer le CV.'); return }
  win.document.write(html)
  win.document.close()
}
