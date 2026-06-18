// ══════════════════════════════════════════════════════════════════════════
// GSMI RMIS — Rapports Excel automatiques (§20)
// ══════════════════════════════════════════════════════════════════════════
import * as XLSX from 'xlsx'
import { computeRealisations, buildComparatif, computeScoreChercheur } from './kpi_engine.js'
import { getPrevision, getLastRevision, getPublicationsByDeclarant, getEncadrementsByPerson, getPrestationsByPerson, getRayonnementsByPerson } from './db.js'
import { GSMI_FULL_NAME, GSMI_AXES } from './constants.js'

function s(bold, bg='FFFFFF', fg='111928', align='left', sz=10) {
  return {
    font: { name:'Calibri', bold, sz, color:{rgb:fg} },
    fill: { patternType:'solid', fgColor:{rgb:bg.replace('#','')} },
    alignment: { horizontal:align, vertical:'center', wrapText:true },
    border: { top:{style:'thin',color:{rgb:'E5E7EB'}}, bottom:{style:'thin',color:{rgb:'E5E7EB'}}, left:{style:'thin',color:{rgb:'E5E7EB'}}, right:{style:'thin',color:{rgb:'E5E7EB'}} },
  }
}
function appendSheet(wb, headers, rows, title, color) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const r = XLSX.utils.decode_range(ws['!ref'])
  for (let c = r.s.c; c <= r.e.c; c++) { const a = XLSX.utils.encode_cell({r:0,c}); if (ws[a]) ws[a].s = s(true,color,'FFFFFF','center') }
  for (let ri = 1; ri <= r.e.r; ri++) for (let ci = r.s.c; ci <= r.e.c; ci++) {
    const a = XLSX.utils.encode_cell({r:ri,c:ci}); if (!ws[a]) ws[a] = {v:'',t:'s'}
    ws[a].s = s(false, ri%2===0?'F9FAFB':'FFFFFF','111928', ci===0?'left':'center')
  }
  ws['!cols'] = Array(headers.length).fill({wch:18})
  XLSX.utils.book_append_sheet(wb, ws, title)
  return ws
}

// ── Rapport individuel chercheur (Prévu/Révisé/Réalisé + KPI + détail) ───
export function generateRapportChercheur(chercheur, annee) {
  const wb = XLSX.utils.book_new()
  const email = chercheur.email
  const prev = getPrevision(email, annee)
  const rev  = getLastRevision(email, annee)
  const real = computeRealisations(email, annee)
  const comparatif = buildComparatif(prev, rev, real)
  const score = computeScoreChercheur(real)
  const date = new Date().toLocaleDateString('fr-MA')

  // Onglet 1 — Synthèse KPI
  const rows1 = [
    [`RAPPORT CHERCHEUR — ${GSMI_FULL_NAME.toUpperCase()}`, '', '', '', '', ''],
    [`${chercheur.prenom||''} ${chercheur.nom}`, chercheur.grade||'', chercheur.axe_principal||'', `Année : ${annee}`, `Généré le : ${date}`, ''],
    [''],
    [`Score global : ${score.total} / 100`, '', '', '', '', ''],
    [''],
    ['Indicateur', 'A — Prévu', 'B — Révisé', 'C — Réalisé', 'Écart C−A', 'Taux atteinte (%)'],
    ...comparatif.filter(r => r.A !== undefined || r.C !== undefined).map(r => [
      r.label, r.A ?? '—', r.B ?? '—', r.C ?? '—', r.ecart1 ?? '—', r.taux ?? '—',
    ]),
  ]
  const ws1 = appendSheet(wb, rows1[5], rows1.slice(6), '📊 Synthèse KPI', '0D1B2A')
  // Re-render with title rows manually since appendSheet assumes headers at row 0
  const wsFull = XLSX.utils.aoa_to_sheet(rows1)
  wsFull['A1'].s = s(true,'0D1B2A','FFFFFF','left',14)
  wsFull['A4'].s = s(true,'FFF8E6','B45309','left',12)
  for (let c=0;c<6;c++) { const a=XLSX.utils.encode_cell({r:5,c}); if(wsFull[a]) wsFull[a].s = s(true,'0D1B2A','FFFFFF','center') }
  for (let ri=6; ri<rows1.length; ri++) for (let c=0;c<6;c++) {
    const a = XLSX.utils.encode_cell({r:ri,c}); if (!wsFull[a]) wsFull[a]={v:'',t:'s'}
    wsFull[a].s = s(c===0, ri%2===0?'F9FAFB':'FFFFFF','111928', c===0?'left':'center')
  }
  wsFull['!cols'] = [{wch:32},{wch:12},{wch:12},{wch:12},{wch:12},{wch:16}]
  wb.SheetNames[0] = '📊 Synthèse KPI'
  wb.Sheets['📊 Synthèse KPI'] = wsFull

  // Onglet 2 — Publications détaillées
  const pubs = getPublicationsByDeclarant(email)
  appendSheet(wb,
    ['Titre','Journal','Année','Quartile','IF','Citations','Statut','Position','DOI'],
    pubs.map(p => [p.title||'', p.source||'', p.year||'', p.quartile||'', p.impact_factor||'', p.citations||0, p.statut||'',
      (p.declarants||[]).find(d=>d.email===email)?.position || '', p.doi||'']),
    '🔬 Publications', '047481')

  // Onglet 3 — Encadrement
  const enc = getEncadrementsByPerson(email)
  appendSheet(wb, ['Type','Étudiant','Sujet','Année','Statut'],
    enc.map(e => [e.type, e.etudiant, e.sujet, e.annee_academique, e.statut]), '🎓 Encadrement', '5521B5')

  // Onglet 4 — Prestations
  const prest = getPrestationsByPerson(email)
  appendSheet(wb, ['Intitulé','Type','Client','Année','Statut','Montant (MAD)'],
    prest.map(p => [p.intitule, p.type, p.client||'', p.annee_academique, p.statut, p.montant||0]), '💼 Prestations', 'B45309')

  // Onglet 5 — Rayonnement
  const ray = getRayonnementsByPerson(email)
  appendSheet(wb, ['Catégorie','Titre','Partenaire','Année','Statut'],
    ray.map(r => [r.categorie, r.titre, r.partenaire||'', r.annee_academique, r.statut||'']), '🌍 Rayonnement', '5521B5')

  const fn = `GSMI_Rapport_${chercheur.nom.replace(/\s+/g,'_')}_${annee.replace('/','_')}.xlsx`
  XLSX.writeFile(wb, fn)
  return fn
}

// ── Rapport consolidé par axe ──────────────────────────────────────────────
export function generateRapportAxe(axe, personnes, annee) {
  const wb = XLSX.utils.book_new()
  const rows = personnes.map(p => {
    const real = computeRealisations(p.email, annee)
    const score = computeScoreChercheur(real)
    return [p.nom, p.grade, real.publications.acceptees, real.publications.q1, real.impact.citations,
      real.formation.doctorants, real.prestations.total, score.total]
  })
  appendSheet(wb,
    ['Nom','Grade','Publications acc.','Q1','Citations','Doctorants','Prestations','Score /100'],
    rows, `📊 ${axe}`, '047481')
  XLSX.writeFile(wb, `GSMI_Rapport_Axe_${axe.replace(/[^a-zA-Z0-9]/g,'_')}_${annee.replace('/','_')}.xlsx`)
}

// ── Rapport institutionnel global (Direction / Présidence) ───────────────
export function generateRapportInstitutionnel(chercheurs, affilies, annee) {
  const wb = XLSX.utils.book_new()
  const all = [...chercheurs, ...affilies]
  let totalPub=0, totalQ1=0, totalCit=0, totalDoct=0, totalBrevets=0, totalRevenus=0

  const rows = all.map(p => {
    const real = computeRealisations(p.email, annee)
    totalPub += real.publications.acceptees; totalQ1 += real.publications.q1
    totalCit += real.impact.citations; totalDoct += real.formation.doctorants
    totalBrevets += real.rayonnement.brevets; totalRevenus += real.prestations.revenus
    return [p.nom, p.axe_principal || p.axe || '', real.publications.acceptees, real.publications.q1, real.impact.citations, real.formation.doctorants]
  })

  const summary = [
    [`RAPPORT INSTITUTIONNEL GSMI — ${annee}`, '', ''],
    [`Généré le ${new Date().toLocaleDateString('fr-MA')}`, '', ''],
    [''],
    ['Indicateur global', 'Valeur', ''],
    ['Publications acceptées (total)', totalPub, ''],
    ['Dont Q1', totalQ1, ''],
    ['Citations totales', totalCit, ''],
    ['Doctorants encadrés', totalDoct, ''],
    ['Brevets', totalBrevets, ''],
    ['Revenus prestations (MAD)', totalRevenus.toLocaleString('fr-MA'), ''],
    ['Effectif (chercheurs + affiliés)', all.length, ''],
  ]
  const wsS = XLSX.utils.aoa_to_sheet(summary)
  wsS['A1'].s = s(true,'0D1B2A','FFFFFF','left',14)
  summary.forEach((_,i) => { const a=`A${i+1}`; if (wsS[a] && !wsS[a].s) wsS[a].s = s(i>=3,'FFFFFF','111928','left') })
  wsS['!cols'] = [{wch:34},{wch:20},{wch:10}]
  XLSX.utils.book_append_sheet(wb, wsS, '📊 Synthèse institutionnelle')

  appendSheet(wb, ['Nom','Axe','Pub. acc.','Q1','Citations','Doctorants'], rows, '👥 Détail par personne', '1A56DB')

  XLSX.writeFile(wb, `GSMI_Rapport_Institutionnel_${annee.replace('/','_')}.xlsx`)
}
