// ══════════════════════════════════════════════════════════════════════════
// GSMI RMIS — Geology and Sustainable Mining Institute / UM6P
// Research Management Information System
// constants.js — Source unique de vérité pour toutes les listes de référence
// ══════════════════════════════════════════════════════════════════════════

export const GSMI_FULL_NAME = 'Geology and Sustainable Mining Institute'
export const GSMI_PARENT = 'UM6P'

// Années académiques 2018-2019 → 2048-2049 (30 ans, comme demandé au §6)
export const ACADEMIC_YEARS = Array.from({ length: 31 }, (_, i) => `${2018 + i}/${2019 + i}`)
export const CURRENT_ACADEMIC_YEAR = '2025/2026'

export const GRADES = ['Assistant Professor', 'Associate Professor', 'Full Professor', 'Professeur Invité']

export const GSMI_AXES = [
  'Geology and Exploration',
  'Mining and Mineral Processing (MMP)',
  'Sustainability and Mining Environment (SME)',
]

export const AFFILIE_STATUTS = ['Expert', 'Affilié']

export const QUARTILES = ['Q1', 'Q2', 'Q3', 'Q4', 'Non classé']

export const SCIENTIFIC_DOMAINS = [
  'Geosciences', 'Mining Engineering', 'Mineral Processing', 'Environmental Science',
  'Materials Science', 'Geochemistry', 'Hydrogeology', 'Geotechnics',
  'Sustainability', 'Data Science & AI', 'Chemical Engineering', 'Other',
]

export const PUB_STATUTS = ['Soumise', 'Acceptée', 'Publiée']

export const AUTHOR_POSITIONS = [
  'Premier auteur', 'Deuxième auteur', 'Troisième auteur', 'Dernier auteur',
  'Auteur correspondant', 'Auteur unique', 'Co-auteur',
]

export const OA_TYPES = ['Non', 'Gold OA', 'Green OA', 'Hybrid Gold', 'Diamond OA']

export const TRL_LEVELS = ['N/A', 'TRL 1','TRL 2','TRL 3','TRL 4','TRL 5','TRL 6','TRL 7','TRL 8','TRL 9']

export const ENCADREMENT_TYPES = ['Doctorat', 'PFE']
export const ENCADREMENT_STATUTS = ['En cours', 'Soutenu / Diplômé', 'Abandonné']

export const ENSEIGNEMENT_CATEGORIES = [
  'Formation initiale',
  'Formation continue',
  'Formation doctorale',
  'Animation de cours',
  'Conception de cours',
  'Montage de programmes',
  'Autres activités pédagogiques',
]

export const PRESTATION_TYPES = [
  'Assistance technique', 'Étude', 'Développement de nouvelle expertise', 'Innovation',
]
export const PRESTATION_STATUTS = ['Planifié', 'Réalisé']

export const RAYONNEMENT_CATEGORIES = [
  'Conférence', 'Conférence invitée (Keynote)', "Organisation d'événement",
  'Comité scientifique', 'Partenariat', 'Brevet', 'Licence', 'Valorisation', 'Transfert technologique',
]

export const PROJET_STATUTS = ['Soumis', 'Accepté', 'Rejeté', 'En cours', 'Terminé']
export const PROJET_ROLES = ['Responsable', 'Co-responsable', 'Participant']
export const FINANCEMENT_TYPES = [
  'National (CNRST, OCP…)', 'International (EU, World Bank…)', 'Industriel', 'Institutionnel UM6P', 'Bilatéral',
]

export const WORKFLOW_STATUTS = ['Brouillon', 'Soumis', 'Vérifié', 'Validé', 'Archivé']

export const ROLES = {
  CHERCHEUR: 'chercheur',
  RESPONSABLE_AXE: 'responsable_axe',
  DIRECTION: 'direction',
  PRESIDENCE: 'presidence',
}

export const ROLE_LABELS = {
  chercheur: 'Chercheur',
  responsable_axe: "Responsable d'Axe",
  direction: 'Direction GSMI',
  presidence: 'Présidence UM6P',
}

// ── Palette visuelle ────────────────────────────────────────────────────
export const C = {
  navy: '#0D1B2A', blue: '#1A56DB', teal: '#047481', green: '#057A55',
  violet: '#5521B5', orange: '#B45309', red: '#BE123C', gold: '#FBBF24',
  amber: '#D97706', g1: '#F9FAFB', g2: '#F3F4F6', g3: '#E5E7EB',
  gt: '#6B7280', gd: '#111928', white: '#FFFFFF',
}

// Code couleur taux d'atteinte (§14 Affichage Top Management)
export function tauxColor(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return C.gt
  if (pct >= 100) return C.green
  if (pct >= 70) return C.orange
  return C.red
}
export function tauxLabel(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return '—'
  if (pct >= 100) return '✅ Atteint'
  if (pct >= 70) return '🟡 Partiel'
  return '🔴 Insuffisant'
}
