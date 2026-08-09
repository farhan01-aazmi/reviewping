import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import { toast } from "sonner";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://reviewping.pro";

export default function QRCode({ biz, gbpConnected }) {
  const bizSlug = biz?.slug || "";
  const googleConnected = gbpConnected && !!biz?.googleLink;
  const bizGatewayUrl = bizSlug ? `${SITE_URL}/biz/${bizSlug}` : "";

  const [url, setUrl] = useState(bizGatewayUrl || "");
  const [label, setLabel] = useState(
    bizSlug ? `Scan to review ${biz.bizName || "us"}` : ""
  );
  const [size, setSize] = useState("200");
  const [generated, setGenerated] = useState(false);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    url
  )}&bgcolor=FFFFFF&color=1A1714&margin=16`;

  if (!googleConnected) {
    return (
      <div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          QR Code Generator
        </h2>
        <Card sx={{ marginTop: 14, padding: "24px", textAlign: "center", background: "#fefce8", border: "1.5px solid #fde68a" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
          <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400, margin: "0 0 8px" }}>
            Connect your Google Business Profile first
          </h3>
          <p style={{ color: G.muted, fontSize: 13.5, margin: "0 0 16px", lineHeight: 1.6 }}>
            You need to connect your GBP to generate QR codes. The QR code will automatically use your business slug and Google review link.
          </p>
        </Card>
      </div>
    );
  }

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
        QR Code Generator
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Print your QR code on receipts, menus, or signage — customers scan to review instantly.
      </p>

      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            background: G.infoBg,
            border: `1.5px solid ${G.infoBd}`,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            lineHeight: 1.6,
            color: G.ink,
          }}
        >
          <strong>⭐ Smart Review Gateway</strong>
          <br />
          Customer scans → selects 5★ → auto-generated review text appears
          → one-click copy &amp; open Google.
          <br />
          <span style={{ color: G.muted, fontSize: 12 }}>
            Best for: counters, receipts, tables, waiting rooms
          </span>
        </div>
        <Field
          label="QR Code URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://reviewping.pro/biz/..."
        />
        <Field
          label="Label text (printed below QR)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Scan to leave us a review!"
        />
        <Sel
          label="QR code size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          options={[
            { value: "150", label: "Small — 150×150px" },
            { value: "200", label: "Medium — 200×200px" },
            { value: "300", label: "Large — 300×300px" },
            { value: "400", label: "Extra large — 400×400px" },
          ]}
        />
        <Btn fullWidth onClick={() => setGenerated(true)}>
          Generate QR Code →
        </Btn>
      </Card>
      {generated && (
        <Card sx={{ textAlign: "center", padding: 28 }}>
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              background: "white",
              borderRadius: 12,
              border: `1.5px solid ${G.border}`,
              display: "inline-block",
            }}
          >
            <img
              src={qrSrc}
              alt="QR Code"
              style={{
                display: "block",
                width: parseInt(size) * 0.75,
                height: parseInt(size) * 0.75,
                maxWidth: 200,
              }}
            />
            <div
              style={{
                fontFamily: "'Manrope',sans-serif",
                fontSize: 12,
                color: G.inkSoft,
                marginTop: 10,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <Btn onClick={() => { const a = document.createElement("a"); a.href = qrSrc; a.download = "reviewping-qr.png"; a.click(); }}>
              ↓ Download PNG
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(qrSrc);
                toast("QR image URL copied!");
              }}
            >
              Copy link
            </Btn>
          </div>
          <p
            style={{
              color: G.muted,
              fontSize: 12,
              marginTop: 14,
            }}
          >
            Print on receipts · menus · signage · business cards · packaging
          </p>
        </Card>
      )}
      <Card
        sx={{
          marginTop: 14,
          background: G.infoBg,
          border: `1.5px solid ${G.infoBd}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          💡 Where to place your QR code
        </div>
        {[
          "Printed receipts & invoices",
          "Table tents in restaurants & cafes",
          "Waiting room signage in clinics & salons",
          "Business cards & flyers",
          "Email signature",
          "Product packaging",
          "Exit signage",
        ].map((i, x) => (
          <div
            key={x}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                color: G.info,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              →
            </span>
            <span style={{ fontSize: 13.5, color: G.inkSoft }}>{i}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
