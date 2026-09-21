// Inline SVG illustrations for the onboarding splash screens.
// Fully vector — crisp at any resolution, no network requests, no broken images.
// Each illustration is 400×280 and matches the AgroChain green palette.

export function ExploreIllustration() {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-full w-full"
    >
      {/* Sky gradient background */}
      <rect width="400" height="280" fill="#f0faf0" rx="16" />

      {/* Ground */}
      <ellipse cx="200" cy="260" rx="190" ry="28" fill="#c8e6c9" />

      {/* Market stall frame */}
      <rect x="60" y="100" width="280" height="130" rx="6" fill="#fff" />
      <rect x="55" y="90" width="290" height="22" rx="4" fill="#1a5c1a" />
      {/* Stall stripes */}
      {[0,1,2,3,4,5,6].map((i) => (
        <rect key={i} x={55 + i * 42} y="90" width="21" height="22" fill="#2e7d32" rx="2" />
      ))}
      {/* Stall legs */}
      <rect x="70" y="230" width="10" height="30" fill="#5d4037" />
      <rect x="320" y="230" width="10" height="30" fill="#5d4037" />

      {/* Display shelf */}
      <rect x="70" y="180" width="260" height="8" rx="4" fill="#e8f5e9" />

      {/* Fish on display — table size */}
      <g transform="translate(90, 148)">
        {/* Fish body */}
        <ellipse cx="30" cy="18" rx="30" ry="14" fill="#607d8b" />
        {/* Tail */}
        <polygon points="60,10 80,4 80,32 60,26" fill="#546e7a" />
        {/* Belly */}
        <ellipse cx="28" cy="22" rx="20" ry="7" fill="#90a4ae" />
        {/* Eye */}
        <circle cx="14" cy="14" r="4" fill="#fff" />
        <circle cx="14" cy="14" r="2" fill="#263238" />
        {/* Fin */}
        <ellipse cx="30" cy="6" rx="12" ry="5" fill="#546e7a" transform="rotate(-10 30 6)" />
        {/* Price tag */}
        <rect x="10" y="28" width="40" height="14" rx="7" fill="#1a5c1a" />
        <text x="30" y="38" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Arial" fontWeight="bold">₦/kg</text>
      </g>

      {/* Broodstock fish (larger) */}
      <g transform="translate(195, 140)">
        <ellipse cx="35" cy="22" rx="38" ry="18" fill="#455a64" />
        <polygon points="73,12 98,4 98,40 73,34" fill="#37474f" />
        <ellipse cx="32" cy="27" rx="26" ry="9" fill="#78909c" />
        <circle cx="16" cy="16" r="5" fill="#fff" />
        <circle cx="16" cy="16" r="2.5" fill="#1a237e" />
        <ellipse cx="36" cy="6" rx="14" ry="6" fill="#37474f" transform="rotate(-8 36 6)" />
        <rect x="12" y="32" width="44" height="14" rx="7" fill="#2e7d32" />
        <text x="34" y="42" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Arial" fontWeight="bold">₦/kg</text>
      </g>

      {/* Seedling/fingerlings bowl */}
      <g transform="translate(80, 190)">
        <ellipse cx="30" cy="12" rx="30" ry="12" fill="#e3f2fd" />
        <ellipse cx="30" cy="9" rx="30" ry="9" fill="#bbdefb" />
        {/* tiny fish shapes */}
        {[0,1,2,3,4].map((i) => (
          <ellipse key={i} cx={12 + i * 10} cy={6 + (i % 2) * 5} rx="5" ry="2.5" fill="#1565c0" />
        ))}
        <text x="30" y="26" textAnchor="middle" fill="#1a5c1a" fontSize="7" fontFamily="Arial" fontWeight="bold">Fingerlings</text>
      </g>

      {/* Dried fish bundle */}
      <g transform="translate(240, 192)">
        {[0,1,2].map((i) => (
          <ellipse key={i} cx={14 + i * 14} cy={10 - i * 2} rx="12" ry="5" fill="#795548" transform={`rotate(${-15 + i * 10} ${14 + i * 14} ${10 - i * 2})`} />
        ))}
        <rect x="4" y="18" width="50" height="10" rx="5" fill="#6d4c41" opacity="0.6" />
        <text x="29" y="26" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="Arial" fontWeight="bold">Dried</text>
      </g>

      {/* Farmer figure */}
      <g transform="translate(310, 100)">
        {/* body */}
        <rect x="10" y="30" width="28" height="40" rx="6" fill="#1a5c1a" />
        {/* head */}
        <circle cx="24" cy="22" r="14" fill="#ffb74d" />
        {/* hat */}
        <ellipse cx="24" cy="11" rx="18" ry="5" fill="#4e342e" />
        <rect x="10" y="8" width="28" height="10" rx="4" fill="#4e342e" />
        {/* arms */}
        <rect x="-4" y="32" width="14" height="8" rx="4" fill="#ffb74d" />
        <rect x="38" y="32" width="14" height="8" rx="4" fill="#ffb74d" />
        {/* legs */}
        <rect x="12" y="68" width="10" height="24" rx="5" fill="#1b5e20" />
        <rect x="26" y="68" width="10" height="24" rx="5" fill="#1b5e20" />
        {/* smile */}
        <path d="M18 26 Q24 32 30 26" stroke="#5d4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Leaf decorations */}
      <ellipse cx="42" cy="80" rx="18" ry="10" fill="#a5d6a7" transform="rotate(-30 42 80)" />
      <ellipse cx="358" cy="75" rx="15" ry="9" fill="#c8e6c9" transform="rotate(25 358 75)" />

      {/* Location pin */}
      <g transform="translate(170, 58)">
        <circle cx="12" cy="10" r="10" fill="#1a5c1a" />
        <circle cx="12" cy="10" r="5" fill="#fff" />
        <path d="M12 20 L12 30" stroke="#1a5c1a" strokeWidth="2" strokeLinecap="round" />
      </g>
      <text x="188" y="74" fill="#1a5c1a" fontSize="10" fontFamily="Arial" fontWeight="bold">Near You</text>
    </svg>
  );
}

export function OrderIllustration() {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-full w-full"
    >
      {/* Background */}
      <rect width="400" height="280" fill="#f1f8e9" rx="16" />

      {/* Subtle grid */}
      {[0,1,2,3,4,5].map((i) => (
        <line key={`v${i}`} x1={40 + i * 70} y1="20" x2={40 + i * 70} y2="260" stroke="#dcedc8" strokeWidth="1" />
      ))}
      {[0,1,2,3].map((i) => (
        <line key={`h${i}`} x1="20" y1={50 + i * 70} x2="380" y2={50 + i * 70} stroke="#dcedc8" strokeWidth="1" />
      ))}

      {/* Phone body */}
      <rect x="130" y="30" width="140" height="230" rx="20" fill="#263238" />
      <rect x="136" y="40" width="128" height="210" rx="14" fill="#eceff1" />
      {/* Home bar */}
      <rect x="175" y="248" width="50" height="5" rx="3" fill="#546e7a" />
      {/* Camera */}
      <circle cx="200" cy="38" r="4" fill="#37474f" />

      {/* App screen */}
      <rect x="140" y="48" width="120" height="196" rx="10" fill="#fff" />

      {/* App header */}
      <rect x="140" y="48" width="120" height="32" rx="10" fill="#1a5c1a" />
      {/* Only top corners rounded for header */}
      <rect x="140" y="68" width="120" height="12" fill="#1a5c1a" />
      <text x="200" y="68" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Arial" fontWeight="bold">AgroChain</text>

      {/* Cart icon in header */}
      <g transform="translate(244, 56)">
        <rect x="0" y="4" width="12" height="10" rx="2" fill="#fff" opacity="0.8" />
        <path d="M-2 4 L0 4" stroke="#fff" strokeWidth="1.5" opacity="0.8" />
        <circle cx="3" cy="16" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="9" cy="16" r="1.5" fill="#fff" opacity="0.8" />
      </g>

      {/* Order summary card */}
      <rect x="148" y="88" width="104" height="68" rx="8" fill="#f9fbe7" />
      <rect x="148" y="88" width="104" height="16" rx="8" fill="#e8f5e9" />
      <rect x="148" y="96" width="104" height="8" fill="#e8f5e9" />
      <text x="200" y="100" textAnchor="middle" fill="#1a5c1a" fontSize="7" fontFamily="Arial" fontWeight="bold">Your Order</text>

      {/* Fish item row */}
      <g transform="translate(152, 108)">
        <ellipse cx="12" cy="8" rx="12" ry="6" fill="#607d8b" />
        <polygon points="24,4 32,1 32,15 24,12" fill="#546e7a" />
        <circle cx="5" cy="6" r="2" fill="#fff" />
        <circle cx="5" cy="6" r="1" fill="#263238" />
      </g>
      <text x="178" y="116" fill="#37474f" fontSize="7" fontFamily="Arial">Table Size × 2</text>
      <text x="230" y="116" fill="#1a5c1a" fontSize="7" fontFamily="Arial" fontWeight="bold">₦4,200</text>

      {/* Divider */}
      <line x1="152" y1="122" x2="248" y2="122" stroke="#e0e0e0" strokeWidth="1" />

      {/* Total */}
      <text x="156" y="132" fill="#37474f" fontSize="7" fontFamily="Arial">Delivery</text>
      <text x="230" y="132" fill="#37474f" fontSize="7" fontFamily="Arial">₦2,500</text>
      <text x="156" y="148" fill="#263238" fontSize="8" fontFamily="Arial" fontWeight="bold">Total</text>
      <text x="222" y="148" fill="#1a5c1a" fontSize="9" fontFamily="Arial" fontWeight="bold">₦6,700</text>

      {/* Wallet balance card */}
      <rect x="148" y="164" width="104" height="44" rx="8" fill="#1a5c1a" />
      <g transform="translate(155, 171)">
        {/* Wallet shape */}
        <rect x="0" y="0" width="20" height="14" rx="3" fill="#fff" opacity="0.3" />
        <rect x="12" y="4" width="8" height="6" rx="2" fill="#fff" opacity="0.5" />
        <circle cx="16" cy="7" r="1.5" fill="#fff" />
      </g>
      <text x="184" y="180" fill="#fff" fontSize="7" fontFamily="Arial">Wallet Balance</text>
      <text x="184" y="193" fill="#a5d6a7" fontSize="9" fontFamily="Arial" fontWeight="bold">₦12,500.00</text>
      {/* Sufficient indicator */}
      <circle cx="244" cy="183" r="6" fill="#69f0ae" />
      <path d="M241 183 L243 186 L247 180" stroke="#1a5c1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Pay button */}
      <rect x="148" y="216" width="104" height="22" rx="11" fill="#2e7d32" />
      <text x="200" y="231" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Arial" fontWeight="bold">Pay Now</text>

      {/* Floating coins */}
      <g transform="translate(40, 80)">
        <circle cx="0" cy="0" r="20" fill="#ffd54f" />
        <circle cx="0" cy="0" r="16" fill="#ffca28" />
        <text x="0" y="5" textAnchor="middle" fill="#f57f17" fontSize="14" fontFamily="Arial" fontWeight="bold">₦</text>
      </g>

      <g transform="translate(345, 110)">
        <circle cx="0" cy="0" r="16" fill="#ffd54f" />
        <circle cx="0" cy="0" r="12" fill="#ffca28" />
        <text x="0" y="4" textAnchor="middle" fill="#f57f17" fontSize="11" fontFamily="Arial" fontWeight="bold">₦</text>
      </g>

      <g transform="translate(55, 180)">
        <circle cx="0" cy="0" r="12" fill="#ffd54f" opacity="0.7" />
        <circle cx="0" cy="0" r="9" fill="#ffca28" opacity="0.7" />
        <text x="0" y="4" textAnchor="middle" fill="#f57f17" fontSize="9" fontFamily="Arial" fontWeight="bold">₦</text>
      </g>

      {/* Price tag label */}
      <rect x="42" y="130" width="70" height="28" rx="8" fill="#fff" />
      <rect x="38" y="126" width="70" height="28" rx="8" fill="#e8f5e9" stroke="#a5d6a7" strokeWidth="1.5" />
      <text x="73" y="136" textAnchor="middle" fill="#1a5c1a" fontSize="7" fontFamily="Arial">Fair price,</text>
      <text x="73" y="147" textAnchor="middle" fill="#1a5c1a" fontSize="7" fontFamily="Arial" fontWeight="bold">set by us</text>

      {/* Stars */}
      {[0,1,2,3,4].map((i) => (
        <text key={i} x={304 + i * 14} y="60" fill="#ffd54f" fontSize="14" fontFamily="Arial">★</text>
      ))}
    </svg>
  );
}

export function DeliveredIllustration() {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-full w-full"
    >
      {/* Background */}
      <rect width="400" height="280" fill="#e8f5e9" rx="16" />

      {/* Road */}
      <rect x="0" y="200" width="400" height="60" fill="#e0e0e0" />
      <rect x="0" y="200" width="400" height="8" fill="#bdbdbd" />
      {/* Road dashes */}
      {[0,1,2,3,4].map((i) => (
        <rect key={i} x={20 + i * 80} y="225" width="40" height="6" rx="3" fill="#fff" />
      ))}

      {/* Background buildings */}
      <rect x="20" y="150" width="40" height="55" rx="4" fill="#c8e6c9" />
      <rect x="30" y="160" width="10" height="12" rx="2" fill="#a5d6a7" />
      <rect x="44" y="160" width="10" height="12" rx="2" fill="#a5d6a7" />
      <rect x="30" y="178" width="10" height="12" rx="2" fill="#a5d6a7" />

      <rect x="330" y="140" width="50" height="65" rx="4" fill="#c8e6c9" />
      <rect x="338" y="150" width="12" height="14" rx="2" fill="#a5d6a7" />
      <rect x="356" y="150" width="12" height="14" rx="2" fill="#a5d6a7" />
      <rect x="338" y="170" width="12" height="14" rx="2" fill="#a5d6a7" />
      <rect x="356" y="170" width="12" height="14" rx="2" fill="#a5d6a7" />

      {/* Trees */}
      <g transform="translate(80, 160)">
        <rect x="6" y="24" width="8" height="20" fill="#795548" />
        <circle cx="10" cy="20" r="20" fill="#388e3c" />
        <circle cx="10" cy="14" r="14" fill="#43a047" />
      </g>
      <g transform="translate(290, 155)">
        <rect x="6" y="28" width="8" height="18" fill="#795548" />
        <circle cx="10" cy="22" r="18" fill="#388e3c" />
        <circle cx="10" cy="16" r="13" fill="#43a047" />
      </g>

      {/* Delivery box / package */}
      <g transform="translate(148, 105)">
        {/* Box body */}
        <rect x="0" y="20" width="100" height="80" rx="6" fill="#fff9c4" />
        {/* Box top */}
        <rect x="0" y="10" width="100" height="16" rx="4" fill="#fff176" />
        {/* Tape */}
        <rect x="44" y="10" width="12" height="90" rx="4" fill="#a5d6a7" opacity="0.8" />
        <rect x="0" y="50" width="100" height="10" rx="4" fill="#a5d6a7" opacity="0.8" />
        {/* AgroChain logo mark on box */}
        <text x="50" y="42" textAnchor="middle" fill="#1a5c1a" fontSize="11" fontFamily="Arial" fontWeight="900">A</text>
        <text x="50" y="76" textAnchor="middle" fill="#2e7d32" fontSize="7" fontFamily="Arial" fontWeight="bold">AGROCHAIN</text>
        {/* Handle */}
        <rect x="30" y="6" width="40" height="10" rx="5" fill="#ffee58" />
      </g>

      {/* Rider figure */}
      <g transform="translate(240, 80)">
        {/* Helmet */}
        <ellipse cx="26" cy="16" rx="20" ry="16" fill="#1a5c1a" />
        <ellipse cx="26" cy="22" rx="22" ry="8" fill="#2e7d32" />
        {/* Visor */}
        <ellipse cx="26" cy="18" rx="14" ry="7" fill="#b2dfdb" opacity="0.7" />
        {/* Face */}
        <ellipse cx="26" cy="26" rx="14" ry="12" fill="#ffb74d" />
        {/* Smile */}
        <path d="M20 30 Q26 36 32 30" stroke="#e65100" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Jacket */}
        <rect x="10" y="36" width="32" height="36" rx="8" fill="#1a5c1a" />
        {/* RIDER text on jacket */}
        <text x="26" y="56" textAnchor="middle" fill="#a5d6a7" fontSize="6" fontFamily="Arial" fontWeight="bold">RIDER</text>
        {/* Arms */}
        <rect x="-8" y="38" width="18" height="8" rx="4" fill="#ffb74d" />
        <rect x="42" y="38" width="18" height="8" rx="4" fill="#ffb74d" />
        {/* Legs */}
        <rect x="12" y="70" width="12" height="28" rx="6" fill="#263238" />
        <rect x="28" y="70" width="12" height="28" rx="6" fill="#263238" />
      </g>

      {/* Buyer figure */}
      <g transform="translate(88, 90)">
        {/* Head */}
        <circle cx="24" cy="22" r="18" fill="#ffe0b2" />
        {/* Hair */}
        <ellipse cx="24" cy="10" rx="18" ry="8" fill="#5d4037" />
        {/* Smile */}
        <path d="M17 26 Q24 33 31 26" stroke="#bf360c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Body */}
        <rect x="6" y="38" width="36" height="38" rx="8" fill="#e91e63" />
        {/* Arms reaching forward */}
        <rect x="-6" y="40" width="18" height="8" rx="4" fill="#ffe0b2" />
        <rect x="36" y="40" width="18" height="8" rx="4" fill="#ffe0b2" />
        {/* Legs */}
        <rect x="8" y="74" width="12" height="26" rx="6" fill="#880e4f" />
        <rect x="24" y="74" width="12" height="26" rx="6" fill="#880e4f" />
      </g>

      {/* Big green checkmark circle — top right */}
      <circle cx="330" cy="60" r="36" fill="#1a5c1a" />
      <circle cx="330" cy="60" r="30" fill="#2e7d32" />
      <path
        d="M315 60 L325 72 L348 46"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Photo icon (chain-of-custody) */}
      <g transform="translate(30, 45)">
        <rect x="0" y="0" width="52" height="40" rx="8" fill="#fff" />
        <rect x="4" y="4" width="44" height="32" rx="5" fill="#e3f2fd" />
        {/* Camera aperture */}
        <circle cx="26" cy="20" r="10" fill="#90a4ae" />
        <circle cx="26" cy="20" r="7" fill="#607d8b" />
        <circle cx="26" cy="20" r="3" fill="#263238" />
        {/* Flash */}
        <rect x="38" y="6" width="6" height="6" rx="2" fill="#ffd54f" />
        {/* Photo tick */}
        <circle cx="44" cy="34" r="7" fill="#1a5c1a" />
        <path d="M40 34 L43 38 L48 29" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>

      {/* "Confirmed!" bubble */}
      <g transform="translate(60, 135)">
        <rect x="0" y="0" width="80" height="28" rx="14" fill="#1a5c1a" />
        <polygon points="20,28 10,44 34,28" fill="#1a5c1a" />
        <text x="40" y="19" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Arial" fontWeight="bold">Confirmed!</text>
      </g>

      {/* Sparkles */}
      {[
        { x: 170, y: 42, s: 10 },
        { x: 310, y: 108, s: 8 },
        { x: 100, y: 70, s: 7 },
      ].map(({ x, y, s }, i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <line x1="0" y1={-s} x2="0" y2={s} stroke="#ffd54f" strokeWidth="2" strokeLinecap="round" />
          <line x1={-s} y1="0" x2={s} y2="0" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round" />
          <line x1={-s * 0.7} y1={-s * 0.7} x2={s * 0.7} y2={s * 0.7} stroke="#ffd54f" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={s * 0.7} y1={-s * 0.7} x2={-s * 0.7} y2={s * 0.7} stroke="#ffd54f" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
