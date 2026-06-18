// ══════════════════════════════════════════════════════════════════════════
// GSMI RMIS — Moteur de calcul des KPI
//
// PRINCIPE (§2 du cahier des charges) : le chercheur ne remplit JAMAIS la
// rubrique "Réalisations". Tout est calculé ici à partir des données brutes
// (publications, projets, encadrements, prestations, rayonnement).
// ══════════════════════════════════════════════════════════════════════════
import {
  getPublicationsByDeclarant, getEncadrementsByPerson, getPrestationsByPerson,
  getRayonnementsByPerson, getEnseignementsByPerson, fractionalCount, getProjetsByAnnee,
} from './db.js'

// ── Réalisations d'une personne pour une année académique donnée ─────────
// C'est la fonction centrale : remplace la saisie manuelle de "Réalisations".
export function computeRealisations(email, annee) {
  const pubs    = getPublicationsByDeclarant(email).filter(p => p.annee_academique === annee)
  const proj_pubs_all = getPublicationsByDeclarant(email) // pour citations cumulées, pas filtré année
  const enc     = getEncadrementsByPerson(email).filter(e => e.annee_academique === annee)
  const prest   = getPrestationsByPerson(email).filter(p => p.annee_academique === annee)
  const ray     = getRayonnementsByPerson(email).filter(r => r.annee_academique === annee)
  const ens     = getEnseignementsByPerson(email).filter(e => e.annee_academique === annee)

  const soumises  = pubs.filter(p => p.statut === 'Soumise' || p.statut === 'Acceptée' || p.statut === 'Publiée').length
  const acceptees = pubs.filter(p => p.statut === 'Acceptée' || p.statut === 'Publiée').length
  const publiees  = pubs.filter(p => p.statut === 'Publiée').length
  const q1 = pubs.filter(p => p.quartile === 'Q1').length
  const q2 = pubs.filter(p => p.quartile === 'Q2').length
  const q3 = pubs.filter(p => p.quartile === 'Q3').length
  const q4 = pubs.filter(p => p.quartile === 'Q4').length
  const oa = pubs.filter(p => p.open_access && p.open_access !== 'Non').length
  const fractionalTotal = pubs.reduce((a,p) => a + fractionalCount(p), 0)

  const citations = proj_pubs_all.reduce((a,p) => a + (+p.citations || 0), 0)
  const ifValues = proj_pubs_all.map(p => +p.impact_factor).filter(v => !isNaN(v) && v > 0)
  const ifMoyen = ifValues.length ? ifValues.reduce((a,v)=>a+v,0)/ifValues.length : null
  const ifMedian = ifValues.length ? [...ifValues].sort((a,b)=>a-b)[Math.floor(ifValues.length/2)] : null

  const positions = proj_pubs_all.flatMap(p => (p.declarants||[]).filter(d => d.email === email).map(d => d.position))
  const premierAuteur = positions.filter(p => p === 'Premier auteur').length
  const deuxiemeAuteur = positions.filter(p => p === 'Deuxième auteur').length
  const dernierAuteur = positions.filter(p => p === 'Dernier auteur').length
  const auteurCorrespondant = positions.filter(p => p === 'Auteur correspondant').length
  const auteurUnique = positions.filter(p => p === 'Auteur unique').length

  const doctorants = enc.filter(e => e.type === 'Doctorat')
  const masters     = enc.filter(e => e.type === 'Master')
  const pfe          = enc.filter(e => e.type === 'PFE')
  const doctorantsDiplomes = doctorants.filter(e => e.statut === 'Soutenu / Diplômé').length
  const mastersDiplomes    = masters.filter(e => e.statut === 'Soutenu / Diplômé').length

  const hEnseignement = ens.reduce((a,e) => a + (+e.heures || 0), 0)

  const conferences = ray.filter(r => r.categorie === 'Conférence').length
  const keynotes     = ray.filter(r => r.categorie === 'Conférence invitée (Keynote)').length
  const evenements   = ray.filter(r => r.categorie === "Organisation d'événement").length
  const brevets       = ray.filter(r => r.categorie === 'Brevet').length
  const licences       = ray.filter(r => r.categorie === 'Licence').length
  const valorisations = ray.filter(r => r.categorie === 'Valorisation').length
  const partenariats  = ray.filter(r => r.categorie === 'Partenariat').length

  const revenusPrestations = prest.reduce((a,p) => a + (+p.montant || 0), 0)
  const prestationsRealisees = prest.filter(p => p.statut === 'Réalisé').length
  const expertises = prest.filter(p => p.type === 'Assistance technique' || p.type === 'Étude').length

  // ── Projets (point 6) — calculés automatiquement depuis la table projets ──
  const projets = getProjetsByAnnee(email, annee)
  const projSoumis  = projets.filter(p => ['Soumis','Accepté','Rejeté','En cours','Terminé'].includes(p.statut)).length
  const projObtenus = projets.filter(p => ['Accepté','En cours','Terminé'].includes(p.statut)).length
  const tauxSuccesProjets = projSoumis > 0 ? Math.round((projObtenus / projSoumis) * 100) : null
  const budgetTotal = projets.filter(p => ['Accepté','En cours','Terminé'].includes(p.statut))
    .reduce((a,p) => a + (+p.budget_total || 0), 0)
  // Budget géré comme PI = somme des budgets où mon_role contient "PI"
  const budgetPI = projets.filter(p => (p.mon_role||'').toLowerCase().includes('pi') && ['Accepté','En cours','Terminé'].includes(p.statut))
    .reduce((a,p) => a + (+p.budget_total || 0), 0)
  const projInternationaux = projets.filter(p =>
    ['International','Bilatéral'].includes(p.nature) && ['Accepté','En cours','Terminé'].includes(p.statut)
  ).length

  return {
    publications: { soumises, acceptees, publiees, q1, q2, q3, q4, oa, fractionalTotal, total: pubs.length },
    impact: { citations, ifMoyen, ifMedian },
    leadership: { premierAuteur, deuxiemeAuteur, dernierAuteur, auteurCorrespondant, auteurUnique },
    formation: {
      doctorants: doctorants.length, pfe: pfe.length,
      doctorantsDiplomes, hEnseignement,
    },
    projets: { soumis: projSoumis, obtenus: projObtenus, tauxSucces: tauxSuccesProjets, budgetTotal, budgetPI, internationaux: projInternationaux },
    rayonnement: { conferences, keynotes, evenements, brevets, licences, valorisations, partenariats },
    prestations: { total: prest.length, realisees: prestationsRealisees, expertises, revenus: revenusPrestations },
  }
}

// ── Taux d'atteinte Prévision vs Réalisation (§14) ────────────────────────
export function tauxAtteinte(prevision, realisation) {
  if (!prevision || prevision === 0) return null
  return Math.round((realisation / prevision) * 100)
}

// ── Comparatif structuré Prévu / Révisé / Réalisé pour affichage (§14) ───
export function buildComparatif(prevision, derniereRevision, realisations) {
  const A = prevision || {}
  const B = derniereRevision || A // si pas de révision, B = A
  const R = realisations

  const rows = [
    { label: 'Publications soumises',  A: A.pub_soumises,  B: B.pub_soumises,  C: R.publications.soumises },
    { label: 'Publications acceptées', A: A.pub_acceptees, B: B.pub_acceptees, C: R.publications.acceptees },
    { label: 'Publications publiées',  A: A.pub_publiees,  B: B.pub_publiees,  C: R.publications.publiees },
    { label: 'Publications Q1',         A: A.pub_q1,         B: B.pub_q1,         C: R.publications.q1 },
    { label: 'Publications Q2',         A: A.pub_q2,         B: B.pub_q2,         C: R.publications.q2 },
    { label: 'Publications Q3',         A: A.pub_q3,         B: B.pub_q3,         C: R.publications.q3 },
    { label: 'Publications Q4',         A: A.pub_q4,         B: B.pub_q4,         C: R.publications.q4 },
    { label: "Modules d'enseignement", A: A.nb_modules,     B: B.nb_modules,     C: undefined },
    { label: "Heures d'enseignement",   A: A.h_enseignement, B: B.h_enseignement, C: R.formation.hEnseignement },
    { label: 'Doctorants à encadrer',   A: A.doctorants,     B: B.doctorants,     C: R.formation.doctorants },
    { label: 'PFE à encadrer',           A: A.pfe,             B: B.pfe,             C: R.formation.pfe },
    { label: 'Projets soumis',           A: A.projets_soumis,  B: B.projets_soumis,  C: R.projets.soumis },
    { label: 'Projets obtenus',          A: A.projets_obtenus, B: B.projets_obtenus, C: R.projets.obtenus },
    { label: 'Taux de succès projets (%)', A: null, B: null,   C: R.projets.tauxSucces },
    { label: 'Budget obtenu (MAD)',      A: A.budget_prev,     B: B.budget_prev,     C: R.projets.budgetTotal },
    { label: 'Budget géré comme PI (MAD)', A: null, B: null,   C: R.projets.budgetPI },
    { label: 'Projets internationaux',   A: A.projets_internat, B: B.projets_internat, C: R.projets.internationaux },
    { label: 'Prestations prévues',      A: A.prestations,     B: B.prestations,     C: R.prestations.total },
    { label: 'Expertises prévues',       A: A.expertises,     B: B.expertises,     C: R.prestations.expertises },
    { label: 'Conférences',               A: A.conferences,     B: B.conferences,     C: R.rayonnement.conferences },
    { label: 'Keynotes',                   A: A.keynotes,         B: B.keynotes,         C: R.rayonnement.keynotes },
    { label: "Organisation d'événements", A: A.evenements,     B: B.evenements,     C: R.rayonnement.evenements },
    { label: 'Comités scientifiques',     A: A.comites,         B: B.comites,         C: undefined },
    { label: 'Activités de valorisation', A: A.valorisations, B: B.valorisations, C: R.rayonnement.valorisations },
    { label: 'Partenariats scientifiques',A: A.partenariats,   B: B.partenariats,   C: R.rayonnement.partenariats },
  ]

  return rows.map(r => ({
    ...r,
    ecart1: (typeof r.A === 'number' && typeof r.C === 'number') ? r.C - r.A : null,
    ecart2: (typeof r.B === 'number' && typeof r.C === 'number') ? r.C - r.B : null,
    taux:   (typeof r.A === 'number' && typeof r.C === 'number') ? tauxAtteinte(r.A, r.C) : null,
  }))
}

// ── Score global chercheur sur 100 (§15) ──────────────────────────────────
// Pondération transparente et documentée (modifiable) :
// Production 30% · Impact 25% · Encadrement 20% · Prestations 10% · Rayonnement+Valorisation 15%
export function computeScoreChercheur(realisations) {
  const R = realisations
  const scoreProd = Math.min(30, (R.publications.acceptees * 4) + (R.publications.q1 * 3) + (R.publications.q2 * 2))
  const scoreImpact = Math.min(25, (R.impact.citations * 0.3) + ((R.impact.ifMoyen||0) * 2))
  const scoreEncadrement = Math.min(20, (R.formation.doctorants * 4) + (R.formation.masters * 1.5) + (R.formation.pfe * 0.5))
  const scorePrestations = Math.min(10, R.prestations.realisees * 2)
  const scoreRayonnement = Math.min(15, (R.rayonnement.keynotes * 2) + (R.rayonnement.conferences * 1) + (R.rayonnement.brevets * 3) + (R.rayonnement.valorisations * 1.5))
  const total = Math.round(scoreProd + scoreImpact + scoreEncadrement + scorePrestations + scoreRayonnement)
  return {
    total: Math.min(100, total),
    detail: {
      production: Math.round(scoreProd), impact: Math.round(scoreImpact),
      encadrement: Math.round(scoreEncadrement), prestations: Math.round(scorePrestations),
      rayonnement: Math.round(scoreRayonnement),
    },
  }
}

// ── Indicateur de complétude des données (§18) ────────────────────────────
export function computeCompletude(chercheur, prevision) {
  const checks = [
    !!chercheur?.nom, !!chercheur?.email, !!chercheur?.grade, !!chercheur?.axe_principal,
    !!chercheur?.orcid, !!chercheur?.scopus_id, !!prevision,
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}

// ── Alertes intelligentes (§17) ───────────────────────────────────────────
export function computeAlertes({ chercheurs, affilies, projets, publications }) {
  const alerts = []
  const now = new Date()
  const in3Months = new Date(); in3Months.setMonth(in3Months.getMonth() + 3)

  affilies.forEach(a => {
    if (a.date_fin) {
      const fin = new Date(a.date_fin)
      if (fin >= now && fin <= in3Months) alerts.push({ type: 'contrat', severity: 'warning', msg: `Contrat de ${a.nom} arrive à échéance le ${a.date_fin}` })
    }
  })
  projets.forEach(p => {
    if (p.date_fin) {
      const fin = new Date(p.date_fin)
      if (fin >= now && fin <= in3Months && p.statut === 'En cours') alerts.push({ type: 'projet', severity: 'warning', msg: `Projet "${p.intitule}" arrive à échéance le ${p.date_fin}` })
    }
    if (p.budget_total && p.budget_consomme && (+p.budget_consomme > +p.budget_total)) {
      alerts.push({ type: 'budget', severity: 'error', msg: `Projet "${p.intitule}" : budget dépassé (${p.budget_consomme} / ${p.budget_total} MAD)` })
    }
  })
  publications.forEach(p => {
    if (!p.doi) alerts.push({ type: 'doi', severity: 'info', msg: `Publication sans DOI : "${(p.title||'').slice(0,60)}"` })
    if (!p.quartile || p.quartile === 'Non classé') alerts.push({ type: 'quartile', severity: 'info', msg: `Publication sans quartile : "${(p.title||'').slice(0,60)}"` })
  })
  chercheurs.forEach(c => {
    if (computeCompletude(c, null) < 70) alerts.push({ type: 'profil', severity: 'info', msg: `Profil incomplet : ${c.nom}` })
  })
  return alerts
}
