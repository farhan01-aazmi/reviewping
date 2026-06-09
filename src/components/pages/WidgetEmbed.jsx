import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Sel from "../ui/Sel";

export default function WidgetEmbed({ biz }) {
  const [style2, setStyle2] = useState("carousel");
  const [theme, setTheme] = useState("light");
  const [count, setCount] = useState("5");
  const [copied, setCopied] = useState(false);

  const slug = biz?.slug || "your-business";
  const code = `<!-- ReviewPing Widget -->\n<script src="https://reviewping.pro/widget.js"\n  data-business="${slug}"\n  data-style="${style2}"\n  data-theme="${theme}"\n  data-count="${count}"\n  async>\n</script>`;

  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "0 0 4px",
          letterSpacing: "-0.5px",
        }}
      >
        Review Widget
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Embed your Google reviews on your website with one line of code.
      </p>
      <Card sx={{ marginBottom: 14 }}>
        <Sel
          label="Widget style"
          value={style2}
          onChange={(e) => setStyle2(e.target.value)}
          options={[
            { value: "carousel", label: "Carousel slider" },
            { value: "grid", label: "Grid layout" },
            { value: "list", label: "Simple list" },
            { value: "badge", label: "Trust badge" },
          ]}
        />
        <Sel
          label="Colour theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "auto", label: "Auto (match system)" },
          ]}
        />
        <Sel
          label="Number of reviews"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          options={["3", "5", "10", "All"]}
        />
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>
            Embed code
          </div>
          <Btn variant="secondary" size="sm" onClick={copy}>
            {copied ? "✓ Copied!" : "Copy code"}
          </Btn>
        </div>
        <pre
          style={{
            background: G.bg,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            padding: "14px 16px",
            fontSize: 12,
            color: G.inkSoft,
            overflowX: "auto",
            margin: 0,
            fontFamily: "monospace",
            lineHeight: 1.7,
          }}
        >
          {code}
        </pre>
      </Card>
      <Card
        sx={{
          background: G.successBg,
          border: `1.5px solid ${G.successBd}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
          ✓ SEO benefit
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          Embedding real Google reviews on your site adds fresh,
          keyword-rich content that search engines love. Businesses with
          review widgets see up to <strong>18% higher</strong> conversion
          rates.
        </p>
      </Card>
    </div>
  );
}
