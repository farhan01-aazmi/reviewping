import { useEffect, useState } from "react";

export default function LogoMark({ size = 96, style, ...rest }) {
  const [src, setSrc] = useState("/logo.png");

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setSrc(el.getAttribute("data-theme") === "dark" ? "/logo.png" : "/logo-light.png");
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <img
      src={src}
      height={size}
      alt="ReviewPing"
      aria-hidden="true"
      style={{
        width: "auto",
        objectFit: "contain",
        borderRadius: 6,
        ...style,
      }}
      {...rest}
    />
  );
}
