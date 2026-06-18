// ══════════════════════════════════════════════════════════════════════════
// GSMI RMIS — Définitions des champs de saisie par module
// ══════════════════════════════════════════════════════════════════════════
import {
  GRADES, GSMI_AXES, ACADEMIC_YEARS, QUARTILES, SCIENTIFIC_DOMAINS,
  PUB_STATUTS, AUTHOR_POSITIONS, OA_TYPES, TRL_LEVELS,
  ENCADREMENT_TYPES, ENCADREMENT_STATUTS, ENSEIGNEMENT_CATEGORIES,
  PRESTATION_TYPES, PRESTATION_STATUTS, RAYONNEMENT_CATEGORIES,
  PROJET_STATUTS, PROJET_ROLES, FINANCEMENT_TYPES, AFFILIE_STATUTS,
} from './constants.js'

const req = (v) => (!v || v === '') ? 'Champ obligatoire' : null

// ── §5 Identification du chercheur ─────────────────────────────────────────
// Point 2 : supprimer axe secondaire
// Point 1 : ajouter LinkedIn
export const IDENTIFICATION_FIELDS = [
  { id: 'nom',     label: 'Nom',       type: 'text',  required: true,  validate: req },
  { id: 'prenom',  label: 'Prénom',    type: 'text',  required: true,  validate: req },
  { id: 'email',   label: 'Email institutionnel', type: 'email', required: true,
    validate: v => !v ? 'Obligatoire' : !v.includes('@') ? 'Email invalide' : null },
  { id: 'telephone', label: 'Téléphone', type: 'text', required: false, placeholder: '+212 6XX XXX XXX' },
  { id: 'grade',   label: 'Grade académique', type: 'select', required: true, options: GRADES, validate: req },
  { id: 'fonction', label: 'Fonction', type: 'text', required: false, placeholder: 'ex: Responsable Axe Geology' },
  { id: 'axe_principal', label: 'Axe principal', type: 'select', required: true, options: GSMI_AXES, validate: req },
  // axe_secondaire supprimé (point 2)
  { id: 'linkedin', label: 'Profil LinkedIn (URL)', type: 'url', required: false,
    placeholder: 'https://www.linkedin.com/in/...' },
  { id: 'orcid',    label: 'ORCID iD', type: 'text', required: false, placeholder: '0000-0000-0000-0000',
    validate: v => v && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v) ? 'Format invalide (0000-0000-0000-0000)' : null },
  { id: 'scopus_id', label: 'Scopus Author ID', type: 'text', required: false },
  { id: 'researcher_id', label: 'Researcher ID', type: 'text', required: false, hint: 'Optionnel' },
  { id: 'h_index',  label: 'H-index', type: 'number', required: false, min: 0,
    hint: 'Renseigné manuellement par le chercheur — sera daté automatiquement' },
  { id: 'expertise_domaines', label: "Domaines d'expertise", type: 'textarea', required: false, placeholder: 'Un domaine par ligne' },
  { id: 'expertise_motscles', label: 'Mots-clés', type: 'textarea', required: false },
  { id: 'expertise_techniques', label: 'Techniques maîtrisées', type: 'textarea', required: false },
  { id: 'expertise_logiciels', label: 'Logiciels maîtrisés', type: 'textarea', required: false },
  { id: 'expertise_equipements', label: 'Équipements maîtrisés', type: 'textarea', required: false },
]

// ── §7 Publications — table détaillée ─────────────────────────────────────
export const PUBLICATION_TABLE = {
  id: 'publications', title: 'Publications', icon: '🔬', color: '#047481',
  hint: 'Saisir le DOI puis cliquer "Vérifier" pour un remplissage automatique. Une publication n\'existe qu\'une fois dans la base.',
  cols: [
    { id: 'doi',        label: 'DOI',                        type: 'doi',    w: 190, required: false },
    { id: 'title',      label: 'Titre',                       type: 'text',   w: 230, required: true },
    { id: 'authors',    label: 'Auteurs (liste complète)',    type: 'text',   w: 180, required: false },
    { id: 'source',     label: 'Journal',                     type: 'text',   w: 160, required: false },
    { id: 'domain',     label: 'Domaine scientifique',        type: 'select', w: 150, required: false, options: SCIENTIFIC_DOMAINS },
    { id: 'annee_academique', label: 'Année académique',      type: 'select', w: 110, required: true,  options: ACADEMIC_YEARS },
    { id: 'year',       label: 'Année (pub.)',                type: 'text',   w: 90,  required: false },
    { id: 'volume',     label: 'Volume',                      type: 'text',   w: 80,  required: false },
    { id: 'numero',     label: 'Numéro',                      type: 'text',   w: 80,  required: false },
    { id: 'pages',      label: 'Pages',                       type: 'text',   w: 90,  required: false },
    { id: 'statut',     label: 'Statut',                      type: 'select', w: 110, required: true,  options: PUB_STATUTS },
    { id: 'quartile',   label: 'Quartile',                    type: 'select', w: 90,  required: false, options: QUARTILES,
      hint: 'Saisie manuelle — non fourni par CrossRef' },
    { id: 'impact_factor', label: 'Impact Factor',            type: 'number', w: 100, required: false, min: 0 },
    { id: 'citescore',  label: 'CiteScore',                   type: 'number', w: 90,  required: false, min: 0 },
    { id: 'snip',       label: 'SNIP',                        type: 'number', w: 80,  required: false, min: 0 },
    { id: 'sjr',        label: 'SJR',                         type: 'number', w: 80,  required: false, min: 0 },
    { id: 'open_access', label: 'Open Access',                type: 'select', w: 110, required: false, options: OA_TYPES },
    { id: 'affiliation_um6p', label: 'Affiliation UM6P',      type: 'select', w: 110, required: false, options: ['Oui','Non'] },
    { id: 'affiliation_gsmi', label: 'Affiliation GSMI',      type: 'select', w: 110, required: false, options: ['Oui','Non'] },
    { id: 'position_auteur', label: 'Votre position',         type: 'select', w: 150, required: true,  options: AUTHOR_POSITIONS },
    { id: 'citations',  label: 'Citations',                   type: 'number', w: 90,  required: false, min: 0 },
  ],
  aggregates: [
    { k: 'Total',       fn: r => r.length },
    { k: 'Acceptées',   fn: r => r.filter(x=>['Acceptée','Publiée'].includes(x.statut)).length },
    { k: 'Q1',          fn: r => r.filter(x=>x.quartile==='Q1').length },
    { k: 'Q2',          fn: r => r.filter(x=>x.quartile==='Q2').length },
    { k: 'Sans DOI',    fn: r => r.filter(x=>!x.doi).length },
  ],
}

// ── §8 Formation — Enseignement ───────────────────────────────────────────
// Point 3 : ajouter catégorisation des activités d'enseignement
export const ENSEIGNEMENT_TABLE = {
  id: 'enseignements', title: 'Enseignement', icon: '📚', color: '#5521B5',
  cols: [
    { id: 'categorie', label: 'Catégorie d\'activité', type: 'select', w: 210, required: true, options: ENSEIGNEMENT_CATEGORIES },
    { id: 'module',    label: 'Module / Intitulé',    type: 'text',   w: 200, required: true },
    { id: 'filiere',   label: 'Filière',               type: 'text',   w: 150, required: false },
    { id: 'semestre',  label: 'Semestre',              type: 'select', w: 80,  required: true, options: ['S1','S2'] },
    { id: 'annee_academique', label: 'Année académique', type: 'select', w: 110, required: true, options: ACADEMIC_YEARS },
    { id: 'heures',    label: "Nb. d'heures",          type: 'number', w: 90,  required: true, min: 0 },
  ],
  aggregates: [
    { k: 'Modules',     fn: r => r.length },
    { k: 'Total heures', fn: r => r.reduce((a,x)=>a+(+x.heures||0),0) },
    { k: 'Formation init.', fn: r => r.filter(x=>x.categorie==='Formation initiale').reduce((a,x)=>a+(+x.heures||0),0)+'h' },
    { k: 'Formation cont.', fn: r => r.filter(x=>x.categorie==='Formation continue').reduce((a,x)=>a+(+x.heures||0),0)+'h' },
    { k: 'Doctorale',   fn: r => r.filter(x=>x.categorie==='Formation doctorale').reduce((a,x)=>a+(+x.heures||0),0)+'h' },
  ],
}

// ── §8 Formation — Encadrement ─────────────────────────────────────────────
// Point 4 : supprimer Master, garder uniquement Doctorat et PFE
export const ENCADREMENT_TABLE = {
  id: 'encadrements', title: 'Encadrement', icon: '🎓', color: '#5521B5',
  cols: [
    { id: 'type',     label: 'Type',               type: 'select', w: 100, required: true,  options: ENCADREMENT_TYPES },
    { id: 'etudiant', label: 'Étudiant',           type: 'text',   w: 170, required: true  },
    { id: 'sujet',    label: 'Sujet',              type: 'text',   w: 230, required: true  },
    { id: 'annee_academique', label: 'Année académique', type: 'select', w: 110, required: true, options: ACADEMIC_YEARS },
    { id: 'statut',   label: 'Statut',             type: 'select', w: 130, required: true,  options: ENCADREMENT_STATUTS },
  ],
  aggregates: [
    { k: 'Doctorants', fn: r => r.filter(x=>x.type==='Doctorat').length },
    { k: 'PFE',        fn: r => r.filter(x=>x.type==='PFE').length },
    { k: 'Diplômés',   fn: r => r.filter(x=>x.statut==='Soutenu / Diplômé').length },
  ],
}

// ── §9 Prestations de service ──────────────────────────────────────────────
export const PRESTATION_TABLE = {
  id: 'prestations', title: 'Prestations de service', icon: '💼', color: '#B45309',
  cols: [
    { id: 'intitule', label: 'Intitulé',            type: 'text',   w: 200, required: true },
    { id: 'type',     label: 'Type',                 type: 'select', w: 180, required: true,  options: PRESTATION_TYPES },
    { id: 'client',   label: 'Client / Partenaire',  type: 'text',   w: 150, required: false },
    { id: 'annee_academique', label: 'Année académique', type: 'select', w: 110, required: true, options: ACADEMIC_YEARS },
    { id: 'statut',   label: 'Statut',               type: 'select', w: 100, required: true,  options: PRESTATION_STATUTS },
    { id: 'montant',  label: 'Montant (MAD)',         type: 'number', w: 110, required: false, min: 0 },
  ],
  aggregates: [
    { k: 'Total',      fn: r => r.length },
    { k: 'Réalisées',  fn: r => r.filter(x=>x.statut==='Réalisé').length },
    { k: 'Revenus (MAD)', fn: r => r.reduce((a,x)=>a+(+x.montant||0),0).toLocaleString('fr-MA') },
  ],
}

// ── §10 Rayonnement et valorisation ────────────────────────────────────────
export const RAYONNEMENT_TABLE = {
  id: 'rayonnements', title: 'Rayonnement & Valorisation', icon: '🌍', color: '#5521B5',
  cols: [
    { id: 'categorie', label: 'Catégorie',             type: 'select', w: 200, required: true,  options: RAYONNEMENT_CATEGORIES },
    { id: 'titre',     label: 'Titre / Intitulé',      type: 'text',   w: 220, required: true  },
    { id: 'partenaire', label: 'Partenaire / Organisme', type: 'text', w: 150, required: false },
    { id: 'annee_academique', label: 'Année académique', type: 'select', w: 110, required: true, options: ACADEMIC_YEARS },
    { id: 'trl',       label: 'TRL',                   type: 'select', w: 80,  required: false, options: TRL_LEVELS },
    { id: 'statut',    label: 'Statut',                 type: 'select', w: 100, required: false, options: ['Prévu','Réalisé'] },
  ],
  aggregates: [
    { k: 'Conférences', fn: r => r.filter(x=>x.categorie==='Conférence').length },
    { k: 'Keynotes',    fn: r => r.filter(x=>x.categorie==='Conférence invitée (Keynote)').length },
    { k: 'Brevets',     fn: r => r.filter(x=>x.categorie==='Brevet').length },
    { k: 'Total',       fn: r => r.length },
  ],
}

// ── §11 Module Projets — inclut role PI pour calcul budget PI ─────────────
export const PROJET_FIELDS = [
  { id: 'num_as',    label: 'N° AS', type: 'text', required: true, validate: req,
    hint: 'Identifiant unique du projet' },
  { id: 'intitule',  label: 'Intitulé', type: 'text', required: true, validate: req },
  { id: 'responsable', label: 'Responsable (email)', type: 'email', required: true, validate: req },
  { id: 'mon_role',  label: 'Mon rôle dans ce projet', type: 'select', required: true,
    options: ['PI (Principal Investigator)', 'Co-PI', 'Participant', 'Coordinateur', 'Consultant'], validate: req },
  { id: 'axe',       label: 'Axe', type: 'select', required: true, options: GSMI_AXES, validate: req },
  { id: 'nature',    label: 'Nature du projet', type: 'select', required: true,
    options: ['National', 'International', 'Industriel', 'Institutionnel UM6P', 'Bilatéral'], validate: req,
    hint: 'Utilisé pour le calcul automatique du nombre de projets internationaux' },
  { id: 'financeur', label: 'Financeur', type: 'text', required: false },
  { id: 'type_financement', label: 'Type de financement', type: 'select', required: false, options: FINANCEMENT_TYPES },
  { id: 'date_debut', label: 'Date début', type: 'date', required: true, validate: req },
  { id: 'date_fin',   label: 'Date fin',   type: 'date', required: true, validate: req },
  { id: 'statut',    label: 'Statut', type: 'select', required: true, options: PROJET_STATUTS, validate: req },
  { id: 'budget_total', label: 'Budget total (MAD)', type: 'number', required: false, min: 0 },
  { id: 'budget_consomme', label: 'Budget consommé (MAD)', type: 'number', required: false, min: 0 },
  { id: 'annee_academique', label: 'Année académique', type: 'select', required: true, options: ACADEMIC_YEARS, validate: req },
]

export const PROJET_LIVRABLE_TABLE = {
  id: 'livrables', title: 'Livrables du projet', icon: '📦', color: '#057A55',
  cols: [
    { id: 'type',     label: 'Type',      type: 'select', w: 140, required: true,
      options: ['Publication','Thèse','PFE','Rapport','Brevet','Prestation'] },
    { id: 'intitule', label: 'Intitulé',  type: 'text',   w: 260, required: true },
    { id: 'statut',   label: 'Statut',    type: 'select', w: 110, required: false, options: ['Prévu','Réalisé'] },
  ],
  aggregates: [
    { k: 'Publications', fn: r => r.filter(x=>x.type==='Publication').length },
    { k: 'Thèses',       fn: r => r.filter(x=>x.type==='Thèse').length },
    { k: 'Total',        fn: r => r.length },
  ],
}

// ── §12 Affiliés GSMI — Identification ────────────────────────────────────
// Point 5 : supprimer taches_contrat de l'identification (repositionné au niveau des activités)
export function computeContractDuration(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return ''
  const d1 = new Date(dateDebut), d2 = new Date(dateFin)
  if (isNaN(d1) || isNaN(d2) || d2 < d1) return ''
  const months = (d2.getFullYear()-d1.getFullYear())*12 + (d2.getMonth()-d1.getMonth())
  const years = Math.floor(months/12), rem = months%12
  if (years > 0 && rem > 0) return `${years} an(s) ${rem} mois`
  if (years > 0) return `${years} an(s)`
  return `${months} mois`
}
export function isContractExpiringSoon(dateFin, monthsAhead=3) {
  if (!dateFin) return false
  const fin = new Date(dateFin); if (isNaN(fin)) return false
  const now = new Date(), limite = new Date(); limite.setMonth(limite.getMonth()+monthsAhead)
  return fin >= now && fin <= limite
}

export const AFFILIE_IDENTIFICATION_FIELDS = [
  { id: 'nom',     label: 'Nom',     type: 'text',   required: true, validate: req },
  { id: 'prenom',  label: 'Prénom',  type: 'text',   required: true, validate: req },
  { id: 'email',   label: 'Email institutionnel', type: 'email', required: true,
    validate: v => !v ? 'Obligatoire' : !v.includes('@') ? 'Email invalide' : null },
  { id: 'grade',   label: 'Grade académique', type: 'select', required: true, options: GRADES, validate: req },
  { id: 'statut_affilie', label: "Statut d'affiliation GSMI", type: 'select', required: true, options: AFFILIE_STATUTS, validate: req },
  { id: 'axe',     label: "Axe d'affectation",  type: 'select', required: true, options: GSMI_AXES, validate: req },
  { id: 'linkedin', label: 'Profil LinkedIn (URL)', type: 'url', required: false, placeholder: 'https://www.linkedin.com/in/...' },
  { id: 'annee_academique', label: 'Année académique', type: 'select', required: true, options: ACADEMIC_YEARS, validate: req },
  { id: 'date_debut', label: 'Date de début du contrat', type: 'date', required: true, validate: req },
  { id: 'date_fin',   label: 'Date de fin du contrat',   type: 'date', required: true, validate: req },
  // taches_contrat supprimé (point 5) — repositionné au niveau de chaque activité
]

export const AFFECTATION_TABLE = {
  id: 'affectations', title: 'Affectation aux projets', icon: '📌', color: '#057A55',
  hint: 'La somme des % d\'affectation ne doit jamais dépasser 100%.',
  cols: [
    { id: 'num_as',      label: 'N° AS du projet',   type: 'text',   w: 140, required: true },
    { id: 'intitule',    label: 'Intitulé du projet', type: 'text',   w: 220, required: true },
    { id: 'responsable', label: 'Responsable',        type: 'text',   w: 150, required: false },
    { id: 'pourcentage', label: 'Affectation (%)',    type: 'number', w: 110, required: true, min: 0, max: 100 },
    { id: 'taches',      label: 'Tâches dans ce projet', type: 'text', w: 200, required: false,
      hint: 'Repositionné ici depuis l\'identification (point 5)' },
  ],
  aggregates: [
    { k: 'Nb. projets', fn: r => r.length },
    { k: 'Total %',     fn: r => `${r.reduce((a,x)=>a+(+x.pourcentage||0),0)}%` },
  ],
}

// ── §14 Prévisions annuelles ────────────────────────────────────────────────
// Point 4 : supprimer "Masters à encadrer"
// Point 6 : ajouter projets soumis, obtenus, budget prévu
export const PREVISION_FIELDS = [
  { section: 'Publications', fields: [
    { id: 'pub_soumises',  label: 'Publications soumises',  type: 'number', required: true,  min: 0 },
    { id: 'pub_acceptees', label: 'Publications acceptées', type: 'number', required: true,  min: 0 },
    { id: 'pub_publiees',  label: 'Publications publiées',  type: 'number', required: false, min: 0 },
    { id: 'pub_q1',        label: 'Publications Q1',        type: 'number', required: true,  min: 0 },
    { id: 'pub_q2',        label: 'Publications Q2',        type: 'number', required: false, min: 0 },
    { id: 'pub_q3',        label: 'Publications Q3',        type: 'number', required: false, min: 0 },
    { id: 'pub_q4',        label: 'Publications Q4',        type: 'number', required: false, min: 0 },
  ]},
  { section: 'Formation', fields: [
    { id: 'nb_modules',     label: 'Modules enseignés',           type: 'number', required: false, min: 0 },
    { id: 'h_enseignement', label: "Heures d'enseignement",       type: 'number', required: true,  min: 0 },
    { id: 'doctorants',     label: 'Doctorants à encadrer',       type: 'number', required: true,  min: 0 },
    // masters supprimé (point 4)
    { id: 'pfe',            label: 'PFE à encadrer',              type: 'number', required: false, min: 0 },
  ]},
  { section: 'Projets de recherche', fields: [
    { id: 'projets_soumis',  label: 'Projets à soumettre',        type: 'number', required: false, min: 0 },
    { id: 'projets_obtenus', label: 'Projets à obtenir',          type: 'number', required: false, min: 0 },
    { id: 'budget_prev',     label: 'Budget à mobiliser (MAD)',   type: 'number', required: false, min: 0 },
    { id: 'projets_internat','label': 'Projets internationaux',   type: 'number', required: false, min: 0 },
  ]},
  { section: 'Prestations de service', fields: [
    { id: 'prestations', label: 'Prestations prévues',                   type: 'number', required: false, min: 0 },
    { id: 'expertises',  label: 'Expertises prévues',                    type: 'number', required: false, min: 0 },
    { id: 'nouvelles_expertises', label: 'Nouvelles expertises prévues', type: 'number', required: false, min: 0 },
  ]},
  { section: 'Rayonnement et valorisation', fields: [
    { id: 'conferences',   label: 'Conférences',                           type: 'number', required: false, min: 0 },
    { id: 'keynotes',      label: 'Conférences invitées (Keynotes)',       type: 'number', required: false, min: 0 },
    { id: 'evenements',    label: "Organisations d'événements",            type: 'number', required: false, min: 0 },
    { id: 'comites',       label: 'Participations comités scientifiques',  type: 'number', required: false, min: 0 },
    { id: 'valorisations', label: 'Activités de valorisation',             type: 'number', required: false, min: 0 },
    { id: 'partenariats',  label: 'Partenariats scientifiques',            type: 'number', required: false, min: 0 },
  ]},
]
