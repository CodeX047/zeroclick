import * as React from "react"

export function Chaicode(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(256, 440)">
        <text x="0" y="0" fontFamily="system-ui, -apple-system, sans-serif" fontSize="110" fontWeight="900" fill="#EBEBEB" textAnchor="middle" letterSpacing="-4">
          chaicode
        </text>
      </g>
      
      <g transform="translate(256, 190) rotate(18) translate(-256, -190)">
        {/* Glass Outer */}
        <path d="M 140 20 L 372 20 L 312 340 L 200 340 Z" fill="#FFFFFF" stroke="#EAEAEA" strokeWidth="16" strokeLinejoin="round" />
        
        <clipPath id="glass-inner">
          <path d="M 148 28 L 364 28 L 304 332 L 208 332 Z" />
        </clipPath>
        
        <g clipPath="url(#glass-inner)">
            <g transform="translate(256, 110) rotate(-18) translate(-256, -110)">
                <path d="M -100 110 L 612 110 L 612 600 L -100 600 Z" fill="#FF952B" />
                <ellipse cx="256" cy="110" rx="140" ry="25" fill="#E67A00" />
            </g>
        </g>
        
        {/* Code symbol */}
        <path d="M 215 180 L 155 220 L 215 260" stroke="#3D2000" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 297 180 L 357 220 L 297 260" stroke="#3D2000" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 276 160 L 236 280" stroke="#3D2000" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
