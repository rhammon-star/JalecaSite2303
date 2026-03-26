export type ShippingOption = {
  id: string
  label: string
  cost: number
  delivery_time: string
}

const JALECA_CEP = '35160294'

// Regional fallback table (PAC and SEDEX by zone)
const SUL_SUDESTE = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS']

type ViaCEPResponse = {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

function getFallbackOptions(uf?: string): ShippingOption[] {
  const isSulSudeste = uf ? SUL_SUDESTE.includes(uf.toUpperCase()) : false

  if (isSulSudeste) {
    return [
      { id: 'pac',   label: 'PAC (Correios)',   cost: 18.90, delivery_time: '5-7 dias úteis'  },
      { id: 'sedex', label: 'SEDEX (Correios)', cost: 35.90, delivery_time: '2-3 dias úteis'  },
    ]
  }

  return [
    { id: 'pac',   label: 'PAC (Correios)',   cost: 18.90, delivery_time: '7-10 dias úteis' },
    { id: 'sedex', label: 'SEDEX (Correios)', cost: 35.90, delivery_time: '3-5 dias úteis'  },
  ]
}

type MelhorEnvioService = {
  id: number
  name: string
  price: string | null
  custom_price: string | null
  delivery_time: number | null
  error: string | null
}

const API_BASE = process.env.MELHOR_ENVIO_SANDBOX === 'true'
  ? 'https://sandbox.melhorenvio.com.br/api/v2'
  : 'https://melhorenvio.com.br/api/v2'

async function callMelhorEnvioAPI(
  cepDestino: string,
  weight: number
): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN

  if (!token || token === 'PLACEHOLDER') {
    return []
  }

  const res = await fetch(`${API_BASE}/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'JalecaApp/1.0 (contato@jaleca.com.br)',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      from: { postal_code: JALECA_CEP },
      to:   { postal_code: cepDestino },
      products: [{ id: 'jaleco', height: 20, width: 30, length: 40, weight, quantity: 1, insurance_value: 0 }],
      services: '1,2,7,8',
      options: { insurance_value: 0, receipt: false, own_hand: false, collect: false },
    }),
  })

  if (!res.ok) {
    throw new Error(`Melhor Envio API error: ${res.status}`)
  }

  const services = (await res.json()) as MelhorEnvioService[]

  const SERVICE_LABELS: Record<number, string> = {
    1: 'PAC (Correios)',
    2: 'SEDEX (Correios)',
    7: 'Jadlog Package',
    8: 'Jadlog .Com',
  }

  const options: ShippingOption[] = []

  for (const svc of services) {
    if (svc.error) continue
    const rawPrice = svc.custom_price ?? svc.price
    if (!rawPrice) continue
    const cost = parseFloat(rawPrice)
    if (isNaN(cost) || cost <= 0) continue
    const deliveryDays = svc.delivery_time ?? 7
    options.push({
      id:            String(svc.id),
      label:         SERVICE_LABELS[svc.id] ?? svc.name,
      cost,
      delivery_time: `${deliveryDays} dia${deliveryDays !== 1 ? 's' : ''} útil${deliveryDays !== 1 ? 'eis' : ''}`,
    })
  }

  return options
}

export async function calculateShipping(
  cepDestino: string,
  weight: number,
  items: number
): Promise<ShippingOption[]> {
  const cleanCep = cepDestino.replace(/\D/g, '')
  const totalWeight = Math.max(weight * items, 0.5)

  // Try real API first
  try {
    const token = process.env.MELHOR_ENVIO_TOKEN
    if (token && token !== 'PLACEHOLDER') {
      const options = await callMelhorEnvioAPI(cleanCep, totalWeight)
      if (options.length > 0) return options
    }
  } catch {
    // Fall through to regional fallback
  }

  // Fallback: determine UF from ViaCEP
  try {
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (viaCepRes.ok) {
      const cepData = (await viaCepRes.json()) as ViaCEPResponse
      if (!cepData.erro) {
        return getFallbackOptions(cepData.uf)
      }
    }
  } catch {
    // ignore
  }

  return getFallbackOptions()
}
