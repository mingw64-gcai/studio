import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <defs>
        <linearGradient id="eye-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#34A853'}} />
          <stop offset="100%" style={{stopColor: '#FBBC05'}} />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path 
            d="M24.5,128C24.5,128,60,65,128,65s103.5,63,103.5,63-35.5,63-103.5,63S24.5,128,24.5,128Z" 
            fill="url(#eye-gradient)"
        />
        <path 
            d="M128,65c29.3,0,56.3,13,76.5,33.5c-20,18-47,30.5-76.5,30.5s-56.5-12.5-76.5-30.5C71.7,78,98.7,65,128,65Z"
            fill="#4285F4"
        />
        <path
            d="M204.5,98.5c-20,18-47,30.5-76.5,30.5c-1.8,0-3.5,0-5.3-0.1c28.3,4.1,53.8,16.1,72.3,34.6,9.5-12.5,12.5-27.5,9.5-35Z"
            fill="#EA4335"
        />
        <circle cx="128" cy="128" r="32" fill="white"/>
        <circle cx="128" cy="128" r="16" fill="#4285F4"/>
      </g>
    </svg>
  ),
};
