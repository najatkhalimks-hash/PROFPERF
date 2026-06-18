// ══════════════════════════════════════════════════════════════════════════
// GSMI RMIS — Couche de données relationnelle
//
// PRINCIPE FONDAMENTAL : Saisie unique, aucune redondance.
// Chaque publication/projet/encadrement/prestation/rayonnement est stocké
// UNE SEULE FOIS, identifié de façon unique (DOI pour les publications,
// numéro AS pour les projets), et RÉFÉRENCÉ par tous les modules qui en
// ont besoin (KPI, réalisations, rapports, CV) plutôt que dupliqué.
//
// Stockage : localStorage avec clés séparées par entité (table-like).
// Limite pratique localStorage ~5-10 Mo — largement suffisant pour un
// institut de 30-80 chercheurs/affiliés sur plusieurs années.
// ══════════════════════════════════════════════════════════════════════════

const DB_PREFIX = 'gsmi_rmis_v1_'
const TABLES = {
  chercheurs:    DB_PREFIX + 'chercheurs',
  affilies:      DB_PREFIX + 'affilies',
  publications:  DB_PREFIX + 'publications',
  projets:       DB_PREFIX + 'projets',
  encadrements:  DB_PREFIX + 'encadrements',
  prestations:   DB_PREFIX + 'prestations',
  rayonnements:  DB_PREFIX + 'rayonnements',
  enseignements: DB_PREFIX + 'enseignements',
  affectations:  DB_PREFIX + 'affectations',
  previsions:    DB_PREFIX + 'previsions',
  revisions:     DB_PREFIX + 'revisions',
  audit_log:     DB_PREFIX + 'audit_log',
}

function readTable(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function writeTable(key, rows) {
  try { localStorage.setItem(key, JSON.stringify(rows)); return true } catch (e) {
    console.error('Storage write failed (quota?):', e); return false
  }
}
function logAudit(action, table, recordId, summary) {
  const log = readTable(TABLES.audit_log)
  log.push({ ts: new Date().toISOString(), action, table, recordId, summary })
  writeTable(TABLES.audit_log, log.slice(-2000))
}

// ══════════════════════════════════════════════════════════════════════════
// CHERCHEURS
// ══════════════════════════════════════════════════════════════════════════
export function upsertChercheur(data) {
  const all = readTable(TABLES.chercheurs)
  const idx = all.findIndex(c => c.email === data.email)
  const record = { ...all[idx], ...data, id: data.email, updated_at: new Date().toISOString() }
  if (idx >= 0) { all[idx] = record; logAudit('update', 'chercheurs', data.email, 'Profil mis à jour') }
  else { record.created_at = record.updated_at; all.push(record); logAudit('create', 'chercheurs', data.email, 'Nouveau chercheur') }
  writeTable(TABLES.chercheurs, all)
  return record
}
export function getChercheurs() { return readTable(TABLES.chercheurs) }
export function getChercheur(email) { return readTable(TABLES.chercheurs).find(c => c.email === email) || null }

// ══════════════════════════════════════════════════════════════════════════
// AFFILIÉS
// ══════════════════════════════════════════════════════════════════════════
export function upsertAffilie(data) {
  const all = readTable(TABLES.affilies)
  const idx = all.findIndex(a => a.email === data.email)
  const record = { ...all[idx], ...data, id: data.email, updated_at: new Date().toISOString() }
  if (idx >= 0) { all[idx] = record; logAudit('update', 'affilies', data.email, 'Affilié mis à jour') }
  else { record.created_at = record.updated_at; all.push(record); logAudit('create', 'affilies', data.email, 'Nouvel affilié') }
  writeTable(TABLES.affilies, all)
  return record
}
export function getAffilies() { return readTable(TABLES.affilies) }
export function getAffilie(email) { return readTable(TABLES.affilies).find(a => a.email === email) || null }

// ══════════════════════════════════════════════════════════════════════════
// PUBLICATIONS — DOI = identifiant unique. Fusion des co-déclarants GSMI
// au lieu de dupliquer la ligne (§2 Élimination des doublons).
// ══════════════════════════════════════════════════════════════════════════
function normalizeDoi(doi) {
  if (!doi) return null
  return doi.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
}
function pubKey(p) {
  const d = normalizeDoi(p.doi)
  return d || `nodoi::${(p.title||'').trim().toLowerCase()}::${p.year||''}`
}

export function upsertPublication(pub) {
  const all = readTable(TABLES.publications)
  const key = pubKey(pub)
  const idx = all.findIndex(p => pubKey(p) === key)

  if (idx >= 0) {
    const existing = all[idx]
    const declarants = existing.declarants || []
    const already = declarants.find(d => d.email === pub.declarant_email)
    if (!already) {
      declarants.push({
        email: pub.declarant_email, nom: pub.declarant_nom, type: pub.declarant_type,
        position: pub.position_auteur, first_author: pub.position_auteur === 'Premier auteur',
      })
    }
    const merged = { ...existing, ...pub, doi: existing.doi || pub.doi, declarants, updated_at: new Date().toISOString() }
    all[idx] = merged
    logAudit('merge', 'publications', key, `Co-déclarant ajouté : ${pub.declarant_nom}`)
    writeTable(TABLES.publications, all)
    return { record: merged, wasNew: false }
  }

  const record = {
    ...pub, id: key,
    declarants: [{
      email: pub.declarant_email, nom: pub.declarant_nom, type: pub.declarant_type,
      position: pub.position_auteur, first_author: pub.position_auteur === 'Premier auteur',
    }],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  all.push(record)
  logAudit('create', 'publications', key, `Nouvelle publication : ${pub.title}`)
  writeTable(TABLES.publications, all)
  return { record, wasNew: true }
}

export function getPublications() { return readTable(TABLES.publications) }
export function getPublicationsByDeclarant(email) {
  return getPublications().filter(p => (p.declarants||[]).some(d => d.email === email))
}
export function deletePublication(id) {
  writeTable(TABLES.publications, readTable(TABLES.publications).filter(p => p.id !== id))
  logAudit('delete', 'publications', id, 'Publication supprimée')
}

// Fractional Counting (§2) : Contribution = 1 / nombre total d'auteurs.
// Utilise le nombre d'auteurs CrossRef si connu, sinon nb de déclarants GSMI.
export function fractionalCount(pub) {
  const totalAuthors = pub.nb_auteurs_total || (pub.declarants||[]).length || 1
  return 1 / totalAuthors
}

// ══════════════════════════════════════════════════════════════════════════
// PROJETS — Numéro AS = identifiant unique
// ══════════════════════════════════════════════════════════════════════════
export function upsertProjet(data) {
  const all = readTable(TABLES.projets)
  const idx = all.findIndex(p => p.num_as === data.num_as)
  const record = { ...all[idx], ...data, id: data.num_as, updated_at: new Date().toISOString() }
  if (idx >= 0) { all[idx] = record; logAudit('update', 'projets', data.num_as, 'Projet mis à jour') }
  else { record.created_at = record.updated_at; all.push(record); logAudit('create', 'projets', data.num_as, `Nouveau projet : ${data.intitule}`) }
  writeTable(TABLES.projets, all)
  return record
}
export function getProjets() { return readTable(TABLES.projets) }
export function getProjet(numAs) { return readTable(TABLES.projets).find(p => p.num_as === numAs) || null }
export function deleteProjet(numAs) { writeTable(TABLES.projets, readTable(TABLES.projets).filter(p => p.num_as !== numAs)) }
// Projets où la personne est déclarée responsable ou co-responsable — pour les KPI par personne
export function getProjetsByPerson(email) {
  return readTable(TABLES.projets).filter(p =>
    p.responsable === email ||
    (p.co_responsables || '').toLowerCase().includes(email.toLowerCase()) ||
    p.declarant_email === email
  )
}
export function getProjetsByAnnee(email, annee) {
  return getProjetsByPerson(email).filter(p => p.annee_academique === annee)
}

// ══════════════════════════════════════════════════════════════════════════
// ENCADREMENTS — Doctorat / Master / PFE
// ══════════════════════════════════════════════════════════════════════════
export function getEncadrements() { return readTable(TABLES.encadrements) }
export function getEncadrementsByPerson(email) { return getEncadrements().filter(e => e.encadrant_email === email) }
export function setEncadrements(email, rows) {
  const all = readTable(TABLES.encadrements).filter(e => e.encadrant_email !== email)
  writeTable(TABLES.encadrements, [...all, ...rows.map(r => ({ ...r, encadrant_email: email }))])
}

// ══════════════════════════════════════════════════════════════════════════
// PRESTATIONS
// ══════════════════════════════════════════════════════════════════════════
export function getPrestations() { return readTable(TABLES.prestations) }
export function getPrestationsByPerson(email) { return getPrestations().filter(p => p.declarant_email === email) }
export function setPrestations(email, rows) {
  const all = readTable(TABLES.prestations).filter(p => p.declarant_email !== email)
  writeTable(TABLES.prestations, [...all, ...rows.map(r => ({ ...r, declarant_email: email }))])
}

// ══════════════════════════════════════════════════════════════════════════
// RAYONNEMENT & VALORISATION
// ══════════════════════════════════════════════════════════════════════════
export function getRayonnements() { return readTable(TABLES.rayonnements) }
export function getRayonnementsByPerson(email) { return getRayonnements().filter(r => r.declarant_email === email) }
export function setRayonnements(email, rows) {
  const all = readTable(TABLES.rayonnements).filter(r => r.declarant_email !== email)
  writeTable(TABLES.rayonnements, [...all, ...rows.map(r => ({ ...r, declarant_email: email }))])
}

// ══════════════════════════════════════════════════════════════════════════
// ENSEIGNEMENTS
// ══════════════════════════════════════════════════════════════════════════
export function getEnseignements() { return readTable(TABLES.enseignements) }
export function getEnseignementsByPerson(email) { return getEnseignements().filter(e => e.declarant_email === email) }
export function setEnseignements(email, rows) {
  const all = readTable(TABLES.enseignements).filter(e => e.declarant_email !== email)
  writeTable(TABLES.enseignements, [...all, ...rows.map(r => ({ ...r, declarant_email: email }))])
}

// ══════════════════════════════════════════════════════════════════════════
// AFFECTATIONS — lien Affilié ↔ Projet (% ≤ 100)
// ══════════════════════════════════════════════════════════════════════════
export function getAffectations() { return readTable(TABLES.affectations) }
export function getAffectationsByAffilie(email) { return getAffectations().filter(a => a.affilie_email === email) }
export function setAffectations(email, rows) {
  const all = readTable(TABLES.affectations).filter(a => a.affilie_email !== email)
  writeTable(TABLES.affectations, [...all, ...rows.map(r => ({ ...r, affilie_email: email }))])
}
export function affectationTotal(rows) { return (rows||[]).reduce((a,r)=>a+(+r.pourcentage||0),0) }

// ══════════════════════════════════════════════════════════════════════════
// PRÉVISIONS & RÉVISIONS
// ══════════════════════════════════════════════════════════════════════════
export function upsertPrevision(email, annee, data) {
  const all = readTable(TABLES.previsions)
  const idx = all.findIndex(p => p.email === email && p.annee === annee)
  const record = { ...all[idx], ...data, email, annee, statut: data.statut || 'Soumis', updated_at: new Date().toISOString() }
  if (idx >= 0) all[idx] = record; else { record.created_at = record.updated_at; all.push(record) }
  writeTable(TABLES.previsions, all)
  logAudit('upsert', 'previsions', `${email}::${annee}`, 'Prévision enregistrée')
  return record
}
export function getPrevision(email, annee) { return readTable(TABLES.previsions).find(p => p.email === email && p.annee === annee) || null }
export function getPrevisions() { return readTable(TABLES.previsions) }

export function addRevision(email, annee, data) {
  const all = readTable(TABLES.revisions)
  const record = { email, annee, ...data, date: new Date().toISOString() }
  all.push(record)
  writeTable(TABLES.revisions, all)
  logAudit('create', 'revisions', `${email}::${annee}`, `Révision : ${data.motif||''}`)
  return record
}
export function getRevisions(email, annee) { return readTable(TABLES.revisions).filter(r => r.email===email && r.annee===annee) }
export function getLastRevision(email, annee) {
  const revs = getRevisions(email, annee)
  return revs.length ? revs[revs.length-1] : null
}

// ══════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ══════════════════════════════════════════════════════════════════════════
export function getAuditLog(limit = 100) { return readTable(TABLES.audit_log).slice(-limit).reverse() }

// ══════════════════════════════════════════════════════════════════════════
// UTILITAIRES ADMIN
// ══════════════════════════════════════════════════════════════════════════
export function clearAllData() { Object.values(TABLES).forEach(k => localStorage.removeItem(k)) }
export function exportRawDatabase() {
  const dump = {}
  Object.entries(TABLES).forEach(([name, key]) => { dump[name] = readTable(key) })
  return dump
}
export function getStorageSizeKB() {
  let total = 0
  Object.values(TABLES).forEach(k => { total += (localStorage.getItem(k) || '').length })
  return Math.round(total / 1024 * 10) / 10
}
