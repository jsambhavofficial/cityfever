import React from 'react';

interface CivicPulseLogoProps {
  size?: number;
  className?: string;
}

export const CivicPulseLogo: React.FC<CivicPulseLogoProps> = ({ size = 28, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer Hexagon Shield */}
      <path
        d="M16 2.5L27.5 9.1V22.9L16 29.5L4.5 22.9V9.1L16 2.5Z"
        fill="#0D1A27"
        stroke="#1597D4"
        strokeWidth="1.5"
      />
      {/* Inner Isometric Node */}
      <path
        d="M16 7.5L23 11.5V19.5L16 23.5L9 19.5V11.5L16 7.5Z"
        fill="#11273C"
        stroke="#38BDF8"
        strokeWidth="1.2"
      />
      {/* Center Y-Axis Orthogonal Facets */}
      <path
        d="M16 7.5V15.5M16 15.5L23 19.5M16 15.5L9 19.5"
        stroke="#38BDF8"
        strokeWidth="1.2"
      />
      {/* Center Node Dot */}
      <circle cx="16" cy="15.5" r="2" fill="#E8EDF3" />
    </svg>
  );
};
