import React from 'react';

export interface BadalLogoProps {
  className?: string;
  showShadow?: boolean; // Controls general shadow
  withTag?: boolean;    // Controls hanging red tag at the bottom
  size?: number;
}

export const BadalLogo: React.FC<BadalLogoProps> = ({ 
  className = '', 
  showShadow = true,
  withTag = true,
  size = 120 
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Real metallic gold brushed/reflective linear gradient */}
          <linearGradient id="goldMetallicBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF0D7" />
            <stop offset="20%" stopColor="#DFBA82" />
            <stop offset="40%" stopColor="#FFF4DE" />
            <stop offset="60%" stopColor="#C49E65" />
            <stop offset="80%" stopColor="#EED9B3" />
            <stop offset="100%" stopColor="#AB844C" />
          </linearGradient>

          {/* Golden radial gradient for central glow effect */}
          <radialGradient id="goldPlateGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#FFF2DC" />
            <stop offset="50%" stopColor="#EED19C" />
            <stop offset="85%" stopColor="#C8A264" />
            <stop offset="100%" stopColor="#A07B43" />
          </radialGradient>

          {/* Slightly darker gold for grooves and inner borders */}
          <linearGradient id="goldBorderDark" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8C682E" />
            <stop offset="35%" stopColor="#B38D4F" />
            <stop offset="70%" stopColor="#D9B777" />
            <stop offset="100%" stopColor="#73531F" />
          </linearGradient>

          {/* Light gold for raised bevel lines */}
          <linearGradient id="goldBevelLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#FFF2DC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C8A264" stopOpacity="0" />
          </linearGradient>

          {/* Deep premium scarlet/maroon gradient for the letters */}
          <linearGradient id="brandRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B51A2B" />
            <stop offset="50%" stopColor="#93111E" />
            <stop offset="100%" stopColor="#69040D" />
          </linearGradient>

          {/* High-quality Inner Shadow filter to make text carved into the gold */}
          <filter id="carvedDepth" x="-20%" y="-20%" width="140%" height="140%">
            {/* Soft drop shadow */}
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
            
            {/* Inner shadow effect */}
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="1.5" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="#3A0207" floodOpacity="0.9" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>

          {/* Subtle drop shadow for the whole plate */}
          <filter id="plateShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. Base Plate with 3D Drop Shadow */}
        <rect
          x="10"
          y="10"
          width="180"
          height="180"
          rx="52"
          fill="url(#goldMetallicBase)"
          filter={showShadow ? "url(#plateShadow)" : undefined}
        />

        {/* 2. Outer Beveled Edge Rim (Concentric steps) */}
        <rect
          x="12"
          y="12"
          width="176"
          height="176"
          rx="50"
          fill="none"
          stroke="url(#goldBorderDark)"
          strokeWidth="3.5"
        />

        {/* 3. Deep Outer Groove */}
        <rect
          x="19"
          y="19"
          width="162"
          height="162"
          rx="43"
          fill="none"
          stroke="#5C4217"
          strokeWidth="2.5"
          opacity="0.4"
        />

        {/* 4. Raised Golden Middle Ring */}
        <rect
          x="23"
          y="23"
          width="154"
          height="154"
          rx="39"
          fill="none"
          stroke="url(#goldMetallicBase)"
          strokeWidth="3"
        />
        <rect
          x="23"
          y="23"
          width="154"
          height="154"
          rx="39"
          fill="none"
          stroke="url(#goldBevelLight)"
          strokeWidth="1.2"
        />

        {/* 5. Inner Groove before Flat Center Plate */}
        <rect
          x="28"
          y="28"
          width="144"
          height="144"
          rx="34"
          fill="none"
          stroke="#422F0F"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* 6. Flat Center Gold Plate with Radial Glow */}
        <rect
          x="30"
          y="30"
          width="140"
          height="140"
          rx="32"
          fill="url(#goldPlateGlow)"
        />

        {/* 7. Inner highlight outline */}
        <rect
          x="31"
          y="31"
          width="138"
          height="138"
          rx="31"
          fill="none"
          stroke="url(#goldBevelLight)"
          strokeWidth="1"
          opacity="0.7"
        />

        {/* 8. Engraved/Carved Calligraphy: "بدل" */}
        <g filter="url(#carvedDepth)">
          
          {/* "ل" (Lam) - Tall vertical stem on the left side with a gorgeous wide bowl */}
          <path
            d="M 91 60 
               L 91 106 
               C 91 118, 83 124, 71 124 
               C 59 124, 53 118, 53 106 
               L 53 91 
               C 53 84, 57 80, 64 80 
               C 71 80, 75 84, 75 91 
               L 75 103 
               C 75 108, 77 111, 80 111 
               C 83 111, 85 108, 85 103 
               L 85 60 
               Z"
            fill="url(#brandRed)"
          />

          {/* "د" (Dal) - Modern geometric central loop */}
          <path
            d="M 95 91 
               L 115 91 
               C 120 91, 122 93, 122 98 
               L 122 101 
               C 122 103, 120 104, 116 104 
               L 100 104 
               C 97 104, 95 106, 95 109 
               L 95 111 
               C 95 111, 118 111, 122 111 
               C 128 111, 131 108, 131 101 
               L 131 98 
               C 131 87, 122 81, 110 81 
               L 95 81 
               Z"
            fill="url(#brandRed)"
          />

          {/* "ب" (Beh) - Distinctive block hook on the far right */}
          <path
            d="M 134 81 
               L 151 81 
               C 155 81, 157 83, 157 87 
               L 157 111 
               L 141 111 
               L 141 101 
               C 141 97, 139 95, 134 95 
               Z"
            fill="url(#brandRed)"
          />

          {/* Square dot under Beh (ب) - perfectly aligned */}
          <rect
            x="142"
            y="117"
            width="11"
            height="11"
            rx="1.5"
            fill="url(#brandRed)"
          />

        </g>

        {/* 9. Hanging Red Tag at Bottom Center */}
        {withTag && (
          <g filter={showShadow ? "url(#plateShadow)" : undefined}>
            {/* Tag background body */}
            <path
              d="M 87 130 
                 L 113 130 
                 C 117 130, 119 133, 119 138 
                 L 119 191 
                 C 119 198, 114 200, 100 200 
                 C 86 200, 81 198, 81 191 
                 L 81 138 
                 C 81 133, 83 130, 87 130 
                 Z"
              fill="url(#brandRed)"
            />
            {/* Subtle inner highlight rim on the tag */}
            <path
              d="M 89 132 
                 L 111 132 
                 C 114 132, 116 134, 116 138 
                 L 116 189 
                 C 116 195, 112 197, 100 197 
                 C 88 197, 84 195, 84 189 
                 L 84 138 
                 C 84 134, 86 132, 89 132 
                 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              opacity="0.15"
            />
            {/* Metallic Gold circular hole at top of tag */}
            <circle
              cx="100"
              cy="147"
              r="7"
              fill="url(#goldMetallicBase)"
              stroke="#5C4217"
              strokeWidth="1"
            />
            <circle
              cx="100"
              cy="147"
              r="5"
              fill="#1F1506"
              opacity="0.85"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default BadalLogo;
