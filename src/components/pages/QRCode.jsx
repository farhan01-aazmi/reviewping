import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";

export default function QRCode({ biz, toast }) {
  const [url, setUrl] = useState(
    biz.googleLink || "https://g.page/r/mybiz"
  );
  const [label, setLabel] = useState(
    `Review ${biz.bizName || "us"} on Google`
  );
  const [size, setSize] = useState("200");
  const [generated, setGenerated] = useState(false);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    url
  )}&bgcolor=FFFFFF&color=1A1714&margin=16`;

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
        Print your QR code on receipts, menus, or signage — customers scan to
        review instantly.
      </p>
      <Card sx={{ marginBottom: 14 }}>
        <Field
          label="Google review link"
          value={url}
          onChange={setUrl}
          placeholder="https://g.page/r/..."
        />
        <Field
          label="Label text (printed below QR)"
          value={label}
          onChange={setLabel}
          placeholder="Scan to leave us a review!"
        />
        <Sel
          label="QR code size"
          value={size}
          onChange={setSize}
          options={[
            { value: "150", label: "Small — 150×150px" },
            { value: "200", label: "Medium — 200×200px" },
            { value: "300", label: "Large — 300×300px" },
            { value: "400", label: "Extra large — 400×400px" },
          ]}
        />
        <Btn full onClick={() => setGenerated(true)}>
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
            <a href={qrSrc} download="reviewping-qr.png">
              <Btn>↓ Download PNG</Btn>
            </a>
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
            Print on receipts · menus · signage · business cards ·
            packaging
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
