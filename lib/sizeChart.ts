export type GarmentSize = {
  busto: number
  cintura: number
  quadril?: number
}

export type ProductChart = {
  PP?: GarmentSize
  P?: GarmentSize
  M?: GarmentSize
  G?: GarmentSize
  GG?: GarmentSize
  G1?: GarmentSize
  G2?: GarmentSize
  G3?: GarmentSize
}

// Garment measurements (cm) per product model.
// Source: Tabela de Medidas Jaleca Padrão
// Only numeric values are included (strings like 'CALÇA 110' or '*' are skipped).
// When a model appears twice (different fabrics), the first entry (primary fabric) takes precedence.
const CHARTS: Record<string, ProductChart> = {
  'conjunto luxo': { PP: { busto: 80, cintura: 75, quadril: 95 }, P: { busto: 87, cintura: 82, quadril: 100 }, M: { busto: 94, cintura: 89, quadril: 105 }, G: { busto: 100, cintura: 90, quadril: 115 }, GG: { busto: 110, cintura: 100, quadril: 125 } },
  'conjunto executiva feminino': { PP: { busto: 90, cintura: 82 }, P: { busto: 94, cintura: 86 }, M: { busto: 98, cintura: 90 }, G: { busto: 104, cintura: 96 }, GG: { busto: 108, cintura: 101 } },
  'conjunto florata': { PP: { busto: 90, cintura: 86 }, P: { busto: 94, cintura: 90 }, M: { busto: 100, cintura: 94 }, G: { busto: 104, cintura: 98 }, GG: { busto: 110, cintura: 106 }, G1: { busto: 114, cintura: 108 }, G2: { busto: 118, cintura: 114 }, G3: { busto: 122, cintura: 123 } },
  'conjunto floratta': { PP: { busto: 90, cintura: 86 }, P: { busto: 94, cintura: 90 }, M: { busto: 100, cintura: 94 }, G: { busto: 104, cintura: 98 }, GG: { busto: 110, cintura: 106 }, G1: { busto: 114, cintura: 108 }, G2: { busto: 118, cintura: 114 }, G3: { busto: 122, cintura: 123 } },
  'conjunto jeane': { PP: { busto: 86, cintura: 80, quadril: 96 }, P: { busto: 90, cintura: 84, quadril: 100 }, M: { busto: 94, cintura: 88, quadril: 104 }, G: { busto: 98, cintura: 92, quadril: 108 }, GG: { busto: 102, cintura: 96, quadril: 112 } },
  'conjunto laco feminino': { PP: { busto: 86, cintura: 80 }, P: { busto: 90, cintura: 84 }, M: { busto: 94, cintura: 88 }, G: { busto: 98, cintura: 93 }, GG: { busto: 102, cintura: 97 } },
  'conjunto pop feminino': { PP: { busto: 92, cintura: 92 }, P: { busto: 98, cintura: 98 }, M: { busto: 102, cintura: 102 }, G: { busto: 108, cintura: 108 }, GG: { busto: 112, cintura: 112 } },
  'conjunto pop masculino': { PP: { busto: 100, cintura: 100 }, P: { busto: 104, cintura: 104 }, M: { busto: 110, cintura: 110 }, G: { busto: 114, cintura: 114 }, GG: { busto: 118, cintura: 118 } },
  'conjunto princesa nobre': { PP: { busto: 96, cintura: 84 }, P: { busto: 97, cintura: 86 }, M: { busto: 98, cintura: 88 }, G: { busto: 111, cintura: 97 }, GG: { busto: 114, cintura: 106 }, G1: { busto: 118, cintura: 111 }, G2: { busto: 122, cintura: 116 }, G3: { busto: 128, cintura: 121 } },
  'conjunto petalas': { G1: { busto: 122, cintura: 120 }, G2: { busto: 132, cintura: 128 }, G3: { busto: 140, cintura: 136 } },
  'conjunto puff feminino': { PP: { busto: 90, cintura: 82 }, P: { busto: 94, cintura: 84 }, M: { busto: 98, cintura: 88 }, G: { busto: 102, cintura: 100 }, GG: { busto: 106, cintura: 102 } },
  'dolma feminina': { PP: { busto: 88, cintura: 80 }, P: { busto: 90, cintura: 82 }, M: { busto: 94, cintura: 86 }, G: { busto: 100, cintura: 98 }, GG: { busto: 106, cintura: 104 } },
  'dolma masculina': { PP: { busto: 100, cintura: 96 }, P: { busto: 104, cintura: 100 }, M: { busto: 108, cintura: 104 }, G: { busto: 114, cintura: 112 }, GG: { busto: 120, cintura: 118 } },
  'dolma petit poa': { PP: { busto: 88, cintura: 84 }, P: { busto: 92, cintura: 88 }, M: { busto: 96, cintura: 92 }, G: { busto: 100, cintura: 96 }, GG: { busto: 104, cintura: 100 }, G1: { busto: 112, cintura: 108 }, G2: { busto: 116, cintura: 112 }, G3: { busto: 120, cintura: 116 } },
  'jaleco aluno feminino': { PP: { busto: 94, cintura: 90, quadril: 100 }, P: { busto: 98, cintura: 92, quadril: 108 }, M: { busto: 100, cintura: 94, quadril: 110 }, G: { busto: 106, cintura: 100, quadril: 112 }, GG: { busto: 112, cintura: 104, quadril: 114 }, G1: { busto: 115, cintura: 104, quadril: 124 }, G2: { busto: 122, cintura: 120, quadril: 130 } },
  'jaleco aluno masculino': { PP: { busto: 102, cintura: 96, quadril: 104 }, P: { busto: 108, cintura: 100, quadril: 110 }, M: { busto: 114, cintura: 106, quadril: 114 }, G: { busto: 118, cintura: 108, quadril: 118 }, GG: { busto: 122, cintura: 110, quadril: 122 }, G1: { busto: 130, cintura: 120, quadril: 130 }, G2: { busto: 138, cintura: 126, quadril: 138 } },
  'jaleco dama feminino': { PP: { busto: 88, cintura: 80, quadril: 100 }, P: { busto: 92, cintura: 85 }, M: { busto: 96, cintura: 90, quadril: 114 }, G: { busto: 101, cintura: 95, quadril: 116 }, GG: { busto: 106, cintura: 100, quadril: 118 } },
  'jaleco duquesa': { PP: { busto: 90, cintura: 76, quadril: 92 }, P: { busto: 92, cintura: 78, quadril: 94 }, M: { busto: 94, cintura: 80, quadril: 98 }, G: { busto: 96, cintura: 82, quadril: 102 }, GG: { busto: 98, cintura: 84, quadril: 108 } },
  'jaleco elastex feminino': { PP: { busto: 90, cintura: 82, quadril: 100 }, P: { busto: 94, cintura: 86, quadril: 106 }, M: { busto: 99, cintura: 91, quadril: 110 }, G: { busto: 104, cintura: 99, quadril: 114 }, GG: { busto: 109, cintura: 107, quadril: 118 } },
  'jaleco gold feminino': { PP: { busto: 82, cintura: 74, quadril: 100 }, P: { busto: 86, cintura: 79, quadril: 105 }, M: { busto: 90, cintura: 84, quadril: 110 }, G: { busto: 95, cintura: 90, quadril: 116 }, GG: { busto: 100, cintura: 96, quadril: 122 } },
  'jaleco laise': { PP: { busto: 84, cintura: 76, quadril: 94 }, P: { busto: 86, cintura: 78, quadril: 96 }, M: { busto: 88, cintura: 80, quadril: 98 }, G: { busto: 90, cintura: 82, quadril: 100 }, GG: { busto: 92, cintura: 84, quadril: 102 } },
  'jaleco lateral': { PP: { busto: 86, cintura: 76, quadril: 98 }, P: { busto: 92, cintura: 80, quadril: 104 }, M: { busto: 94, cintura: 88, quadril: 108 }, G: { busto: 102, cintura: 96, quadril: 118 }, GG: { busto: 110, cintura: 104, quadril: 128 } },
  'jaleco luxo feminino': { PP: { busto: 92, cintura: 76, quadril: 96 }, P: { busto: 96, cintura: 78, quadril: 100 }, M: { busto: 100, cintura: 80, quadril: 104 }, G: { busto: 102, cintura: 82, quadril: 108 }, GG: { busto: 104, cintura: 84, quadril: 112 }, G1: { busto: 114, cintura: 104, quadril: 128 }, G2: { busto: 118, cintura: 108, quadril: 132 }, G3: { busto: 122, cintura: 112, quadril: 136 } },
  'jaleco luxo masculino': { PP: { busto: 102, cintura: 100, quadril: 106 }, P: { busto: 106, cintura: 102, quadril: 110 }, M: { busto: 110, cintura: 104, quadril: 114 }, G: { busto: 114, cintura: 106, quadril: 118 }, GG: { busto: 118, cintura: 108, quadril: 122 }, G1: { busto: 126, cintura: 124, quadril: 130 } },
  'jaleco morraty feminino': { PP: { busto: 90, cintura: 84, quadril: 102 }, P: { busto: 92, cintura: 86, quadril: 106 }, M: { busto: 94, cintura: 88, quadril: 110 }, G: { busto: 96, cintura: 90, quadril: 114 }, GG: { busto: 98, cintura: 92, quadril: 118 } },
  'jaleco morraty masculino': { PP: { busto: 100, cintura: 96, quadril: 104 }, P: { busto: 102, cintura: 98, quadril: 104 }, M: { busto: 106, cintura: 104, quadril: 110 }, G: { busto: 114, cintura: 112, quadril: 118 }, GG: { busto: 116, cintura: 114, quadril: 116 } },
  'jaleco nuances': { G1: { busto: 114, cintura: 108, quadril: 126 }, G2: { busto: 116, cintura: 112, quadril: 130 }, G3: { busto: 120, cintura: 116, quadril: 136 } },
  'jaleco pala feminino': { PP: { busto: 80, cintura: 76, quadril: 100 }, P: { busto: 84, cintura: 80, quadril: 104 }, M: { busto: 88, cintura: 84, quadril: 108 }, G: { busto: 95, cintura: 96, quadril: 118 }, GG: { busto: 102, cintura: 100, quadril: 128 } },
  'jaleco pala masculino': { PP: { busto: 96, cintura: 92, quadril: 102 }, P: { busto: 102, cintura: 98, quadril: 108 }, M: { busto: 106, cintura: 100, quadril: 112 }, G: { busto: 110, cintura: 108, quadril: 117 }, GG: { busto: 128, cintura: 118, quadril: 122 } },
  'jaleco princesa': { PP: { busto: 92, cintura: 78, quadril: 102 }, P: { busto: 94, cintura: 80, quadril: 104 }, M: { busto: 96, cintura: 82, quadril: 106 }, G: { busto: 98, cintura: 84, quadril: 108 }, GG: { busto: 100, cintura: 86, quadril: 110 } },
  'jaleco princesa manga longa': { PP: { busto: 86, cintura: 80, quadril: 100 }, P: { busto: 91, cintura: 85, quadril: 106 }, M: { busto: 96, cintura: 90, quadril: 112 }, G: { busto: 102, cintura: 97, quadril: 119 }, GG: { busto: 108, cintura: 104, quadril: 126 }, G1: { busto: 120, cintura: 106, quadril: 126 }, G2: { busto: 122, cintura: 110, quadril: 132 }, G3: { busto: 124, cintura: 114, quadril: 138 } },
  'jaleco professora': { PP: { busto: 88, cintura: 82 }, P: { busto: 92, cintura: 88 }, M: { busto: 96, cintura: 94 }, G: { busto: 102, cintura: 100 }, GG: { busto: 108, cintura: 106 } },
  'jaleco recortes masculino': { PP: { busto: 102, cintura: 96, quadril: 102 }, P: { busto: 106, cintura: 100, quadril: 108 }, M: { busto: 110, cintura: 104, quadril: 114 }, G: { busto: 114, cintura: 108, quadril: 120 }, GG: { busto: 118, cintura: 124, quadril: 126 } },
  'jaleco slim feminino': { G1: { busto: 122, cintura: 106, quadril: 126 }, G2: { busto: 128, cintura: 110, quadril: 130 }, G3: { busto: 134, cintura: 118, quadril: 136 } },
  'jaleco slim masculino': { G1: { busto: 132, cintura: 120, quadril: 128 }, G2: { busto: 138, cintura: 126, quadril: 132 }, G3: { busto: 144, cintura: 132, quadril: 140 } },
  'jaleco slim tradicional feminino': { PP: { busto: 90, cintura: 80, quadril: 102 }, P: { busto: 92, cintura: 82, quadril: 106 }, M: { busto: 94, cintura: 84, quadril: 108 }, G: { busto: 102, cintura: 92, quadril: 114 }, GG: { busto: 106, cintura: 96, quadril: 120 } },
  'jaleco slim tradicional masculino': { PP: { busto: 106, cintura: 96, quadril: 100 }, P: { busto: 110, cintura: 98, quadril: 102 }, M: { busto: 114, cintura: 100, quadril: 104 }, G: { busto: 120, cintura: 102, quadril: 106 }, GG: { busto: 126, cintura: 112, quadril: 116 } },
  'jaleco tule': { PP: { busto: 74, cintura: 62, quadril: 78 }, P: { busto: 76, cintura: 64, quadril: 80 }, M: { busto: 78, cintura: 66, quadril: 82 }, G: { busto: 80, cintura: 68, quadril: 84 }, GG: { busto: 82, cintura: 70, quadril: 86 } },
  'jaleco universitario unissex': { PP: { busto: 104, cintura: 98, quadril: 104 }, P: { busto: 107, cintura: 102, quadril: 107 }, M: { busto: 110, cintura: 106, quadril: 110 }, G: { busto: 115, cintura: 110, quadril: 115 }, GG: { busto: 120, cintura: 114, quadril: 120 } },
  'macacao paris': { PP: { busto: 88, cintura: 76, quadril: 102 }, P: { busto: 92, cintura: 77, quadril: 106 }, M: { busto: 96, cintura: 78, quadril: 110 }, G: { busto: 102, cintura: 85, quadril: 116 }, GG: { busto: 108, cintura: 92, quadril: 122 } },
  'mini jaleco princesa': { PP: { busto: 88, cintura: 76 }, P: { busto: 90, cintura: 80 }, M: { busto: 92, cintura: 82 }, G: { busto: 96, cintura: 92 }, GG: { busto: 112, cintura: 100 } },
  'mini jaleco tradicional feminino': { PP: { busto: 90, cintura: 74 }, P: { busto: 92, cintura: 82 }, M: { busto: 100, cintura: 90 }, G: { busto: 108, cintura: 98 }, GG: { busto: 116, cintura: 106 } },
  'mini jaleco tradicional masculino': { PP: { busto: 104, cintura: 98 }, P: { busto: 106, cintura: 100 }, M: { busto: 108, cintura: 102 }, G: { busto: 110, cintura: 104 }, GG: { busto: 103, cintura: 107 } },
  'scrub feminino': { PP: { busto: 98, cintura: 90, quadril: 104 }, P: { busto: 102, cintura: 94, quadril: 108 }, M: { busto: 106, cintura: 98, quadril: 112 }, G: { busto: 112, cintura: 104, quadril: 118 }, GG: { busto: 118, cintura: 110, quadril: 124 }, G1: { busto: 124, cintura: 116, quadril: 130 }, G2: { busto: 130, cintura: 122, quadril: 136 }, G3: { busto: 136, cintura: 128, quadril: 142 } },
  'scrub masculino': { PP: { busto: 102, cintura: 106, quadril: 112 }, P: { busto: 106, cintura: 110, quadril: 116 }, M: { busto: 110, cintura: 114, quadril: 120 }, G: { busto: 116, cintura: 120, quadril: 126 }, GG: { busto: 122, cintura: 126, quadril: 132 }, G1: { busto: 128, cintura: 132, quadril: 138 }, G2: { busto: 134, cintura: 138, quadril: 144 }, G3: { busto: 140, cintura: 144, quadril: 150 } },
  'scrub ziper masculino': { PP: { busto: 100, cintura: 96, quadril: 108 }, P: { busto: 102, cintura: 98, quadril: 110 }, M: { busto: 104, cintura: 100, quadril: 112 }, G: { busto: 108, cintura: 104, quadril: 116 }, GG: { busto: 112, cintura: 108, quadril: 120 } },
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

export function findProductChart(productName: string): ProductChart | null {
  const n = normalize(productName)

  // Exact match
  if (CHARTS[n]) return CHARTS[n]

  // Longest key that is contained in the product name (more specific match wins)
  const keys = Object.keys(CHARTS)
  const matches = keys.filter(k => n.includes(k) || k.includes(n))
  if (matches.length === 0) return null

  // Return the entry whose key is longest (most specific)
  matches.sort((a, b) => b.length - a.length)
  return CHARTS[matches[0]]
}

export const ALL_SIZES: (keyof ProductChart)[] = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'G3']
