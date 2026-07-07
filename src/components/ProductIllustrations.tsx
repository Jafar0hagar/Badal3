import React from 'react';

// This file contains beautifully polished vector SVG illustrations of the products shown in the screenshots.
// These replicate the realistic, clean 3D look of sugar sacks, flour bags, oil bottles, and rice bags.

export function SugarIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sugarBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F2EEE2" />
            <stop offset="100%" stopColor="#DFD8C4" />
          </linearGradient>
          <linearGradient id="sugarSeal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#850F1D" />
            <stop offset="50%" stopColor="#B31E2F" />
            <stop offset="100%" stopColor="#6E0B16" />
          </linearGradient>
          <radialGradient id="bagShade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A89E84" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A89E84" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Soft Shadow Underneath */}
        <ellipse cx="50" cy="112" rx="35" ry="6" fill="url(#bagShade)" />

        {/* Main Bag Body */}
        <path
          d="M 22 40 
             C 22 25, 30 20, 50 20 
             C 70 20, 78 25, 78 40 
             L 82 95 
             C 82 105, 72 108, 50 108 
             C 28 108, 18 105, 18 95 
             Z"
          fill="url(#sugarBagGrad)"
          stroke="#C8BFA7"
          strokeWidth="1.5"
        />

        {/* Plastic bag textures / folds */}
        <path d="M 23 45 Q 35 48 48 42 T 77 46" fill="none" stroke="#EFEBE0" strokeWidth="2" opacity="0.8" />
        <path d="M 19 75 Q 35 80 50 72 T 81 78" fill="none" stroke="#EFEBE0" strokeWidth="2" opacity="0.8" />
        <path d="M 21 95 Q 40 98 50 92 T 79 96" fill="none" stroke="#EFEBE0" strokeWidth="2.5" opacity="0.8" />

        {/* Horizontal Sealing Ribbons (Top of the bag) */}
        <path d="M 28 28 L 72 28 C 74 28, 75 29, 75 31 L 75 35 C 75 37, 74 38, 72 38 L 28 38 C 26 38, 25 37, 25 35 L 25 31 C 25 29, 26 28, 28 28 Z" fill="url(#sugarSeal)" />
        <line x1="28" y1="33" x2="72" y2="33" stroke="#FFF" strokeWidth="1" strokeDasharray="2, 2" opacity="0.6" />

        {/* Label in the center of the bag */}
        <rect x="32" y="48" width="36" height="36" rx="4" fill="#FBF8F1" stroke="#DFD8C4" strokeWidth="1" />
        <rect x="35" y="51" width="30" height="30" rx="2" fill="none" stroke="#C09F65" strokeWidth="0.75" />
        
        {/* Arabic text on label "سكر نقي" (Pure Sugar) */}
        <text x="50" y="65" fontFamily="'Cairo', sans-serif" fontWeight="bold" fontSize="9" fill="#850F1D" textAnchor="middle">سكر</text>
        <text x="50" y="74" fontFamily="'Cairo', sans-serif" fontSize="5" fill="#C09F65" textAnchor="middle">١٠٠٪ طبيعي ونقي</text>
        <rect x="42" y="77" width="16" height="1.5" rx="0.5" fill="#850F1D" />

        {/* Glossy Highlights */}
        <path d="M 24 45 L 24 90" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 76 45 L 78 90" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" opacity="0.05" />
      </svg>
    </div>
  );
}

export function FlourIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flourBagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EAD8BE" />
            <stop offset="30%" stopColor="#DFCEB2" />
            <stop offset="100%" stopColor="#C6B598" />
          </linearGradient>
          <linearGradient id="flourBrand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#850F1D" />
            <stop offset="100%" stopColor="#62050E" />
          </linearGradient>
          <radialGradient id="flourShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7E725F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7E725F" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="111" rx="32" ry="5.5" fill="url(#flourShadow)" />

        {/* Paper bag body (Folded classic flour pack) */}
        {/* Top folds */}
        <path d="M 25 32 L 32 18 L 68 18 L 75 32 Z" fill="#D3C0A4" stroke="#B1A085" strokeWidth="1" />
        <path d="M 32 18 L 50 25 L 68 18 Z" fill="#BAAA8F" />

        {/* Main body */}
        <path
          d="M 25 32 
             L 75 32 
             L 77 100 
             C 77 106, 70 108, 50 108 
             C 30 108, 23 106, 23 100 
             Z"
          fill="url(#flourBagGrad)"
          stroke="#B5A489"
          strokeWidth="1.5"
        />

        {/* Fold lines of paper bag */}
        <line x1="25" y1="32" x2="23" y2="100" stroke="#9A896E" strokeWidth="0.5" opacity="0.5" />
        <line x1="75" y1="32" x2="77" y2="100" stroke="#9A896E" strokeWidth="0.5" opacity="0.5" />

        {/* Logo/Stripe Header on the pack */}
        <path d="M 24.5 40 L 75.5 40 L 76 56 L 24 56 Z" fill="url(#flourBrand)" />
        <text x="50" y="51" fontFamily="'Cairo', sans-serif" fontWeight="900" fontSize="8.5" fill="#E4C06A" textAnchor="middle">الخيرات</text>

        {/* Ears of wheat illustration on bag */}
        <g stroke="#850F1D" strokeWidth="1" fill="none" opacity="0.8">
          {/* Stem */}
          <path d="M 50 92 Q 48 76 50 64" />
          {/* Leaves/Grains */}
          <path d="M 46 80 Q 42 74 46 72 Q 49 76 49 80 Z" fill="#EAD8BE" />
          <path d="M 54 80 Q 58 74 54 72 Q 51 76 51 80 Z" fill="#EAD8BE" />
          <path d="M 45 70 Q 41 64 45 62 Q 48 66 48 70 Z" fill="#EAD8BE" />
          <path d="M 55 70 Q 59 64 55 62 Q 52 66 52 70 Z" fill="#EAD8BE" />
          {/* Wheat crown */}
          <path d="M 50 64 L 50 58" />
        </g>

        {/* Wheat/Ear decorations on the sides */}
        <circle cx="50" cy="66" r="1.5" fill="#850F1D" />

        {/* Text bottom "دقيق فاخر" */}
        <text x="50" y="101" fontFamily="'Cairo', sans-serif" fontWeight="bold" fontSize="8" fill="#3D332A" textAnchor="middle">دقيق فاخر</text>
        <text x="50" y="106" fontFamily="'Cairo', sans-serif" fontSize="4" fill="#7E725F" textAnchor="middle">وزن صافي ١ كجم</text>
      </svg>
    </div>
  );
}

export function RiceIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="riceBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2D4BC" />
            <stop offset="40%" stopColor="#CBBFA5" />
            <stop offset="100%" stopColor="#A49981" />
          </linearGradient>
          <radialGradient id="riceShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6C624E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6C624E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="112" rx="36" ry="6" fill="url(#riceShadow)" />

        {/* Burlap Bag Body */}
        {/* Tied neck folds */}
        <path d="M 38 32 C 34 22, 38 14, 50 14 C 62 14, 66 22, 62 32 Z" fill="#BCAE94" stroke="#93876F" strokeWidth="1" />
        {/* Rope tie */}
        <rect x="36" y="30" width="28" height="4" rx="2" fill="#724B20" />
        <circle cx="42" cy="35" r="2" fill="#583916" />
        <circle cx="45" cy="37" r="1.5" fill="#583916" />

        {/* Main Sack */}
        <path
          d="M 38 32 
             C 24 45, 18 60, 18 90
             C 18 106, 32 108, 50 108
             C 68 108, 82 106, 82 90
             C 82 60, 76 45, 62 32
             Z"
          fill="url(#riceBagGrad)"
          stroke="#9E9178"
          strokeWidth="1.5"
        />

        {/* Sack stitching / fabric texture */}
        <path d="M 24 55 Q 50 50 76 55" fill="none" stroke="#B3A78E" strokeWidth="1.5" strokeDasharray="3, 3" opacity="0.7" />
        <path d="M 20 75 Q 50 70 80 75" fill="none" stroke="#B3A78E" strokeWidth="1.5" strokeDasharray="3, 3" opacity="0.7" />
        <path d="M 22 93 Q 50 88 78 93" fill="none" stroke="#B3A78E" strokeWidth="1.5" strokeDasharray="3, 3" opacity="0.7" />

        {/* Center label */}
        <ellipse cx="50" cy="72" rx="20" ry="16" fill="#FDFBFA" stroke="#CBBFA5" strokeWidth="1" />
        <ellipse cx="50" cy="72" rx="17" ry="13.5" fill="none" stroke="#850F1D" strokeWidth="0.75" />
        
        <text x="50" y="74" fontFamily="'Cairo', sans-serif" fontWeight="bold" fontSize="9.5" fill="#850F1D" textAnchor="middle">أرز</text>
        <text x="50" y="81" fontFamily="'Cairo', sans-serif" fontSize="4" fill="#C09F65" textAnchor="middle">درجة أولى باسمتي</text>

        {/* Small rice grain icons floating */}
        <g fill="#FFF" opacity="0.9" transform="translate(48, 45)">
          <path d="M 0 -3 C 2 -3, 3 -1, 0 3 C -2 -1, -1 -3, 0 -3 Z" transform="rotate(15)" />
          <path d="M 5 -2 C 7 -2, 8 0, 5 4 C 3 0, 4 -2, 5 -2 Z" transform="rotate(-30)" />
        </g>
      </svg>
    </div>
  );
}

export function OilIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gold oil gradient */}
          <linearGradient id="oilLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFAA00" />
            <stop offset="35%" stopColor="#FFCC00" />
            <stop offset="70%" stopColor="#FFE680" />
            <stop offset="100%" stopColor="#CC8800" />
          </linearGradient>
          <linearGradient id="oilPlasticHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="oilCap" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <radialGradient id="oilShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8A6E3B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8A6E3B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="113" rx="26" ry="5" fill="url(#oilShadow)" />

        {/* Bottle Cap */}
        <rect x="42" y="10" width="16" height="8" rx="2" fill="url(#oilCap)" stroke="#1B5E20" strokeWidth="0.5" />
        <rect x="41" y="16" width="18" height="3" rx="1" fill="#4CAF50" />

        {/* Bottle Neck */}
        <path d="M 43 19 L 43 28 C 43 32, 33 38, 30 45 L 30 50 L 70 50 L 70 45 C 67 38, 57 32, 57 28 L 57 19 Z" fill="url(#oilLiquid)" opacity="0.9" stroke="#E6B800" strokeWidth="1" />

        {/* Bottle Body with Plastic Ridges */}
        <path
          d="M 30 50 
             L 28 55 C 28 58, 32 60, 32 63
             L 28 66 C 28 69, 32 71, 32 74
             L 28 77 C 28 80, 32 82, 32 85
             L 28 88 L 30 104
             C 30 108, 38 110, 50 110
             C 62 110, 70 108, 70 104
             L 72 88 L 68 85
             C 68 82, 72 80, 72 77
             L 68 74 C 68 71, 72 69, 72 66
             L 68 63 C 68 60, 72 58, 72 55
             L 70 50 
             Z"
          fill="url(#oilLiquid)"
          stroke="#D4A017"
          strokeWidth="1.25"
        />

        {/* Internal horizontal ridges highlights */}
        <path d="M 32 58 L 68 58" stroke="#FFAA00" strokeWidth="1.5" opacity="0.6" />
        <path d="M 32 69 L 68 69" stroke="#FFAA00" strokeWidth="1.5" opacity="0.6" />
        <path d="M 32 80 L 68 80" stroke="#FFAA00" strokeWidth="1.5" opacity="0.6" />
        <path d="M 32 91 L 68 91" stroke="#FFAA00" strokeWidth="1.5" opacity="0.6" />

        {/* Yellow/Green Oil Brand Label */}
        <rect x="31" y="60" width="38" height="24" rx="2" fill="#FFFFFF" stroke="#D4A017" strokeWidth="0.75" />
        <rect x="33" y="62" width="34" height="20" rx="1" fill="#4CAF50" opacity="0.08" />
        
        {/* Sunflower icon */}
        <circle cx="50" cy="69" r="3" fill="#E6B800" />
        <circle cx="50" cy="69" r="1.5" fill="#3E2723" />
        
        <text x="50" y="80" fontFamily="'Cairo', sans-serif" fontWeight="black" fontSize="7.5" fill="#1B5E20" textAnchor="middle">زيت نقي</text>

        {/* Plastic Bottle Highlights (Specular shine) */}
        <path d="M 32 50 L 30 104" fill="none" stroke="url(#oilPlasticHighlight)" strokeWidth="2.5" opacity="0.6" />
        <path d="M 46 20 L 46 45" fill="none" stroke="url(#oilPlasticHighlight)" strokeWidth="1.5" opacity="0.4" />
      </svg>
    </div>
  );
}

// Custom extra item for tea
export function TeaIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="teaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B5E20" />
            <stop offset="100%" stopColor="#0D3C12" />
          </linearGradient>
          <radialGradient id="teaShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2E4A31" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2E4A31" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="111" rx="30" ry="5" fill="url(#teaShadow)" />
        {/* Tea box metal/cardboard */}
        <rect x="25" y="22" width="50" height="85" rx="4" fill="url(#teaGrad)" stroke="#114D16" strokeWidth="1.5" />
        <rect x="29" y="26" width="42" height="77" rx="2" fill="none" stroke="#E4C06A" strokeWidth="1" opacity="0.8" />
        
        {/* Golden badge in middle */}
        <circle cx="50" cy="55" r="14" fill="#E4C06A" stroke="#C59B3F" strokeWidth="1" />
        <text x="50" y="59" fontFamily="'Cairo', sans-serif" fontWeight="bold" fontSize="11" fill="#850F1D" textAnchor="middle">شاي</text>
        <text x="50" y="85" fontFamily="'Cairo', sans-serif" fontWeight="medium" fontSize="8" fill="#FFF" textAnchor="middle">الجزيرة الأخضر</text>
        <text x="50" y="93" fontFamily="'Cairo', sans-serif" fontSize="4.5" fill="#E4C06A" textAnchor="middle">أوراق كاملة فاخرة</text>
        
        {/* Tea leaf */}
        <path d="M 50 34 C 47 38, 48 42, 50 44 C 52 42, 53 38, 50 34 Z" fill="#FFF" opacity="0.9" />
      </svg>
    </div>
  );
}

// Custom extra item for pasta
export function PastaIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pastaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>
          <radialGradient id="pastaShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7E4A15" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7E4A15" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="111" rx="30" ry="5.5" fill="url(#pastaShadow)" />
        <rect x="24" y="24" width="52" height="82" rx="6" fill="url(#pastaGrad)" stroke="#D84315" strokeWidth="1.5" />
        
        {/* Transparent window displaying macaroni */}
        <rect x="32" y="60" width="36" height="32" rx="4" fill="#FFE082" stroke="#FFB300" strokeWidth="1" />
        <g stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <path d="M 38 68 Q 43 65 48 68" fill="none" />
          <path d="M 52 72 Q 57 75 62 72" fill="none" />
          <path d="M 40 82 Q 45 79 50 82" fill="none" />
          <path d="M 44 74 Q 49 71 54 74" fill="none" />
          <path d="M 52 84 Q 57 81 62 84" fill="none" />
        </g>
        
        <text x="50" y="42" fontFamily="'Cairo', sans-serif" fontWeight="900" fontSize="9" fill="#FFF" textAnchor="middle">مكرونة</text>
        <text x="50" y="51" fontFamily="'Cairo', sans-serif" fontSize="5" fill="#FFE082" textAnchor="middle">صنع من سميد القمح الصلب</text>
        <text x="50" y="100" fontFamily="'Cairo', sans-serif" fontWeight="bold" fontSize="6" fill="#FFF" textAnchor="middle">الوزن: ٥٠٠ غرام</text>
      </svg>
    </div>
  );
}
