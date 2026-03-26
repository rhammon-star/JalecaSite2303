const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

async function callGemini(model: string, prompt: string, maxTokens = 4096, jsonMode = false): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    const message =
      (err as { error?: { message?: string } }).error?.message ??
      `Gemini API error: ${res.status}`
    throw new Error(message)
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
  }

  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini response truncated (MAX_TOKENS). Tente um tema mais curto ou reduza o tamanho do artigo.')
  }

  const text = candidate?.content?.parts?.[0]?.text
  if (typeof text !== 'string') throw new Error('Unexpected Gemini response')
  return text
}

export type GeneratedContent = {
  title: string
  content: string
  excerpt: string
  metaDescription: string
  suggestedSlug: string
  suggestedKeywords: string[]
}

export async function generateContent(
  topic: string,
  keywords?: string[]
): Promise<GeneratedContent> {
  const keywordsStr = keywords?.length ? `Palavras-chave a incluir: ${keywords.join(', ')}.` : ''

  const prompt = `Você é um redator especializado em conteúdo para profissionais da saúde no Brasil, com foco em uniformes e jalecos profissionais. Crie um artigo de blog completo e otimizado para SEO sobre o seguinte tema: "${topic}".

${keywordsStr}

Requisitos:
- Artigo entre 500 e 700 palavras (IMPORTANTE: seja conciso)
- Máximo 4 seções com H2, sem H3
- Linguagem profissional mas acessível
- Foco em profissionais de saúde (médicos, enfermeiros, dentistas, etc.)
- No máximo 1 link interno para /produto/[slug]
- Integre as palavras-chave naturalmente no texto
- Conteúdo em português brasileiro

Retorne APENAS um JSON válido (sem markdown, sem texto antes ou depois) no seguinte formato:
{
  "title": "Título do artigo (máx 60 chars)",
  "content": "Conteúdo HTML completo com tags h2, h3, p, ul, li, strong",
  "excerpt": "Resumo de 1-2 frases (máx 160 chars)",
  "metaDescription": "Meta description SEO otimizada (máx 160 chars)",
  "suggestedSlug": "slug-do-artigo-sem-acento",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`

  const raw = await callGemini('gemini-2.0-flash', prompt, 8192, true)
  return JSON.parse(raw) as GeneratedContent
}

export async function humanizeContent(content: string): Promise<string> {
  const prompt = `Você é um editor de conteúdo brasileiro. Reescreva o seguinte conteúdo HTML de forma mais natural e humanizada:

${content}

Instruções:
- Mantenha toda a estrutura HTML (tags h2, h3, p, ul, li, strong)
- Use variações de frases para evitar repetição
- Adicione expressões coloquiais brasileiras onde apropriado
- Remova estrutura muito mecânica e previsível
- Torne o tom mais conversacional e autêntico
- NÃO altere links ou informações factuais

Retorne APENAS o HTML reescrito, sem explicações, sem markdown.`

  return callGemini('gemini-2.0-flash', prompt, 8192, false)
}

export type SEOAnalysis = {
  score: number
  keywordDensity: Array<{ keyword: string; count: number; density: string }>
  readability: { score: number; level: string }
  headingsAnalysis: { h1: number; h2: number; h3: number; issues: string[] }
  metaDescriptionAnalysis: { length: number; hasKeyword: boolean; issues: string[] }
  titleAnalysis: { length: number; hasKeyword: boolean; issues: string[] }
  internalLinksCount: number
  scannability: { bulletPoints: boolean; shortParagraphs: boolean; boldText: boolean }
  suggestions: string[]
}

export async function analyzeSEO(data: {
  title: string
  content: string
  metaDescription: string
  slug: string
}): Promise<SEOAnalysis> {
  const prompt = `Analise o SEO do seguinte conteúdo e retorne APENAS um JSON válido com a análise completa.

Título: ${data.title}
Meta Description: ${data.metaDescription}
Slug: ${data.slug}
Conteúdo HTML:
${data.content.slice(0, 3000)}

Retorne APENAS JSON válido (sem markdown) no formato:
{
  "score": 75,
  "keywordDensity": [{"keyword": "jaleco", "count": 8, "density": "1.2%"}],
  "readability": {"score": 65, "level": "Intermediário"},
  "headingsAnalysis": {"h1": 0, "h2": 3, "h3": 2, "issues": []},
  "metaDescriptionAnalysis": {"length": 155, "hasKeyword": true, "issues": []},
  "titleAnalysis": {"length": 58, "hasKeyword": true, "issues": []},
  "internalLinksCount": 2,
  "scannability": {"bulletPoints": true, "shortParagraphs": true, "boldText": true},
  "suggestions": ["Adicione mais palavras-chave no primeiro parágrafo"]
}`

  try {
    const raw = await callGemini('gemini-2.0-flash', prompt, 4096, true)
    return JSON.parse(raw) as SEOAnalysis
  } catch {
    return {
      score: 50,
      keywordDensity: [],
      readability: { score: 60, level: 'Intermediário' },
      headingsAnalysis: { h1: 0, h2: 2, h3: 1, issues: [] },
      metaDescriptionAnalysis: { length: data.metaDescription.length, hasKeyword: true, issues: [] },
      titleAnalysis: { length: data.title.length, hasKeyword: true, issues: [] },
      internalLinksCount: 0,
      scannability: { bulletPoints: false, shortParagraphs: true, boldText: false },
      suggestions: ['Análise SEO indisponível no momento'],
    }
  }
}

export async function improveSEOContent(
  content: string,
  suggestions: string[],
  keywords: string[]
): Promise<string> {
  if (!suggestions.length) return content
  const prompt = `Você é um especialista em SEO. Reescreva o conteúdo HTML abaixo aplicando TODAS as melhorias listadas, mantendo a estrutura HTML intacta.

MELHORIAS A APLICAR:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

PALAVRAS-CHAVE ALVO: ${keywords.join(', ')}

CONTEÚDO ATUAL:
${content}

REGRAS:
- Mantenha todas as tags HTML (h2, h3, p, ul, li, strong, a)
- Não adicione texto antes ou depois do HTML
- Integre as palavras-chave de forma natural
- Melhore a legibilidade conforme sugerido
- Retorne APENAS o HTML melhorado`

  return callGemini('gemini-2.0-flash', prompt, 8192, false)
}

export async function generateLookDescription(
  title: string,
  products: string[]
): Promise<string> {
  const prompt = `Crie uma descrição curta e elegante (máx 120 caracteres) para um look editorial de moda profissional chamado "${title}".
Produtos incluídos: ${products.filter(Boolean).join(', ') || 'jalecos e uniformes profissionais'}.
A descrição deve ser inspiradora, profissional e focada em estilo de uniformes médicos/saúde.
Retorne APENAS a descrição, sem aspas, sem explicações.`

  const result = await callGemini('gemini-2.0-flash', prompt, 200)
  return result.trim()
}

export async function generateImageQuery(topic: string): Promise<string> {
  const prompt = `Crie uma query de busca em inglês para a API do Unsplash para encontrar uma imagem relevante para um artigo de blog sobre: "${topic}".

A imagem deve ser profissional, relacionada à área da saúde ou uniformes médicos.

Retorne APENAS a query de busca, sem aspas, sem explicações. Máximo 5 palavras.`

  const result = await callGemini('gemini-2.0-flash', prompt, 100)
  return result.trim()
}
