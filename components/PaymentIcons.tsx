// Inline SVG payment method icons — no external dependencies

export function IconMastercard() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="white" />
      <circle cx="18" cy="15" r="9" fill="#EB001B" />
      <circle cx="30" cy="15" r="9" fill="#F79E1B" />
      <path d="M24 7.8a9 9 0 0 1 0 14.4A9 9 0 0 1 24 7.8z" fill="#FF5F00" />
    </svg>
  )
}

export function IconVisa() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="white" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="13" fill="#1A1F71" letterSpacing="0.5">VISA</text>
    </svg>
  )
}

export function IconAmex() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="#2E77BC" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="white" letterSpacing="0.3">AMEX</text>
    </svg>
  )
}

export function IconDiners() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="white" />
      <circle cx="18" cy="15" r="8" fill="none" stroke="#004B87" strokeWidth="1.5" />
      <circle cx="24" cy="15" r="8" fill="none" stroke="#004B87" strokeWidth="1.5" />
      <text x="50%" y="23" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial" fontSize="5.5" fill="#004B87">DINERS</text>
    </svg>
  )
}

export function IconHipercard() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="#CC1217" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="7" fill="white" letterSpacing="0.2">HIPERCARD</text>
    </svg>
  )
}

export function IconElo() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="white" />
      <text x="24" y="13" textAnchor="middle" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#FFD700">elo</text>
      <rect x="10" y="19" width="28" height="2" rx="1" fill="#00A4E0" />
    </svg>
  )
}

export function IconPix() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="white" />
      {/* Pix diamond symbol */}
      <g transform="translate(8, 6)">
        <path d="M7.2 0L14.4 7.2L7.2 14.4L0 7.2Z" fill="#32BCAD" transform="rotate(45 7.2 7.2)" />
        <path d="M5.5 5.5L8.9 5.5L8.9 8.9L5.5 8.9Z" fill="white" transform="rotate(45 7.2 7.2)" />
      </g>
      <text x="34" y="17" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="#32BCAD">PIX</text>
    </svg>
  )
}

export function IconBoleto() {
  return (
    <svg viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="48" height="30" rx="4" fill="white" />
      {/* Barcode lines */}
      {[8,11,13,16,19,22,25,28,31,34,37,40].map((x, i) => (
        <rect key={i} x={x} y="7" width={i % 3 === 0 ? 2 : 1} height="16" fill="#222" />
      ))}
    </svg>
  )
}
