import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <g>
        <path
          d="M128 4a124 124 0 0 0-99.5 199.1A124 124 0 0 0 128 252a124 124 0 0 0 99.5-199.1A124 124 0 0 0 128 4Z"
          fill="#4285f4"
        />
        <path
          d="M128 4a124 124 0 0 0-99.5 49.9 124 124 0 0 1 0 149.2A124 124 0 0 0 128 252a124 124 0 0 0 99.5-49.9 124 124 0 0 1 0-149.2A124 124 0 0 0 128 4Z"
          fill="#34a853"
        />
        <path
          d="M74.4 74.4a124 124 0 0 1 107.2 0L128 128Z"
          fill="#fbbc05"
        />
        <path
          d="M28.5 203.1a124 124 0 0 1 45.9-128.7L128 128Z"
          fill="#ea4335"
        />
        <path
          d="M128 128 74.4 74.4a124 124 0 0 0-45.9 128.7Z"
          fill="#fbbc05"
        />
        <path
          d="M128 128l53.6 53.6a124 124 0 0 0 45.9-128.7Z"
          fill="#ea4335"
        />
        <path
          d="M181.6 181.6A124 124 0 0 1 74.4 74.4L128 128Z"
          fill="#34a853"
        />
        <path
          d="M128 172a44 44 0 1 0 0-88 44 44 0 0 0 0 88Z"
          fill="#fff"
        />
        <path
          d="M128 156a28 28 0 1 0 0-56 28 28 0 0 0 0 56Z"
          fill="#4285f4"
        />
      </g>
    </svg>
  ),
};
