// ══════════════════════════════════════════════════════════════════════════
// CrossRef — Récupération automatique des métadonnées de publication via DOI
// API publique gratuite, pas de clé requise : https://api.crossref.org
// ══════════════════════════════════════════════════════════════════════════

const CROSSREF_BASE = 'https://api.crossref.org/works/'

// Normalise un DOI saisi sous diverses formes (URL complète, espaces, etc.)
export function cleanDoi(raw) {
  if (!raw) return ''
  return raw.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/\s+/g, '')
}

export function isValidDoiFormat(doi) {
  return /^10\.\d{4,9}\/\S+$/.test(doi)
}

// Mappe le "type" CrossRef vers nos PUB_DOC_TYPES
function mapCrossrefType(type) {
  const map = {
    'journal-article':   'Journal Article',
    'proceedings-article':'Conference Paper',
    'book-chapter':       'Book Chapter',
    'book':                'Book',
    'monograph':           'Book',
    'report':              'Report',
    'review':               'Review',
  }
  return map[type] || 'Other'
}

function formatAuthors(authorList) {
  if (!Array.isArray(authorList) || !authorList.length) return ''
  return authorList
    .map(a => {
      const family = a.family || ''
      const given = a.given ? `${a.given[0]}.` : ''
      return [family, given].filter(Boolean).join(' ')
    })
    .filter(Boolean)
    .join(', ')
}

/**
 * Interroge CrossRef pour un DOI et retourne les métadonnées normalisées,
 * prêtes à fusionner dans une ligne de tableau "pub_detail".
 *
 * Retour : { ok: true, data: {...} } ou { ok: false, error: 'message' }
 */
export async function fetchDoiMetadata(rawDoi) {
  const doi = cleanDoi(rawDoi)
  if (!doi) return { ok: false, error: 'DOI vide' }
  if (!isValidDoiFormat(doi)) return { ok: false, error: 'Format invalide — attendu : 10.XXXX/XXXXX' }

  try {
    const res = await fetch(CROSSREF_BASE + encodeURIComponent(doi))
    if (!res.ok) {
      return { ok: false, error: res.status === 404 ? 'DOI introuvable sur CrossRef' : `Erreur serveur (${res.status})` }
    }
    const json = await res.json()
    const m = json.message
    if (!m) return { ok: false, error: 'Réponse CrossRef vide' }

    const year = m['published-print']?.['date-parts']?.[0]?.[0]
      || m['published-online']?.['date-parts']?.[0]?.[0]
      || m.created?.['date-parts']?.[0]?.[0] || ''

    const volPages = [
      m.volume ? `Vol. ${m.volume}` : '',
      m.issue ? `No. ${m.issue}` : '',
      m.page ? `pp. ${m.page}` : '',
    ].filter(Boolean).join(', ')

    return {
      ok: true,
      data: {
        doi,
        title:     Array.isArray(m.title) ? (m.title[0] || '') : (m.title || ''),
        authors:   formatAuthors(m.author),
        nb_auteurs_total: Array.isArray(m.author) ? m.author.length : null,
        source:    Array.isArray(m['container-title']) ? (m['container-title'][0] || '') : '',
        year:      year ? String(year) : '',
        volume:    m.volume || '',
        numero:    m.issue || '',
        pages:     m.page || '',
        vol_pages: volPages,
        doc_type:  mapCrossrefType(m.type),
        citations: m['is-referenced-by-count'] ?? '',
      },
    }
  } catch (e) {
    return { ok: false, error: 'Hors-ligne ou réseau indisponible — format DOI valide, complétez manuellement' }
  }
}
