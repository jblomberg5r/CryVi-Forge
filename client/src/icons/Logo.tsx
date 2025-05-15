import { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="20"
        height="20"
        x="2"
        y="2"
        rx="4"
        fill="#6C63FF"
      />
      <path
        d="M7 14.5L7 9.5M12 16.5L12 7.5M17 14.5L17 9.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9.5L10 12.5L7 14.5M17 9.5L14 12.5L17 14.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
