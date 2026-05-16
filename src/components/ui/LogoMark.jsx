import { G } from "../../data/theme";

export default function LogoMark({ size = 32, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={style}
      {...rest}
    >
      <rect width="32" height="32" rx="8" fill={G.accent} />
      <path
        d="M10 22V10h2.5l3.5 7.5L19.5 10H22v12h-3V15.5L16.5 21h-1L12 15.5V22h-2z"
        fill="#fff"
      />
    </svg>
  );
}
