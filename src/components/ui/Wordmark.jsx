import LogoMark from "./LogoMark";

export default function Wordmark({ size = 36, style, ...rest }) {
  return <LogoMark size={size} style={style} {...rest} />;
}