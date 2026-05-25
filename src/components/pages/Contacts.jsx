import { useState, useEffect, useRef } from "react";
import { G } from "../../data/theme";
import { Btn, Card, Field, Pill, EmptyState, Spinner } from "../ui";
import { ConfirmModal } from "../ui";
import { supabase } from "../../config/supabase";
import { toast } from "sonner";
import { fmtDate } from "../../utils/formatters";

export default function Contacts({ userId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [nName, setNName] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nPhone, setNPhone] = useState("");
  const [contactErrors, setContactErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    contact: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetchContacts();
  }, [userId]);

  async function fetchContacts() {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });
    if (error) {
      setFetchError(error.message);
      toast.error("Failed to load contacts");
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  }

  const list = search
    ? contacts.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  async function addContact() {
    const e = {};
    if (!nName.trim()) e.name = "Name is required";
    if (!nPhone.trim() && !nEmail.trim()) {
      e.phone = "Phone or email required";
      e.email = "Phone or email required";
    }
    if (Object.keys(e).length) {
      setContactErrors(e);
      return;
    }
    setContactErrors({});
    setAdding(true);
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: userId,
        name: nName.trim(),
        email: nEmail.trim() || null,
        phone: nPhone.trim() || null,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
    } else {
      setContacts((p) => [data, ...p]);
      setShowAdd(false);
      setNName("");
      setNEmail("");
      setNPhone("");
      toast.success(`${data.name} added to contacts`);
    }
    setAdding(false);
  }

  function openDeleteConfirm(contact) {
    setDeleteConfirm({ open: true, contact });
  }

  async function deleteContact() {
    const contact = deleteConfirm.contact;
    if (!contact) return;
    setDeleting(true);
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contact.id);
    if (error) {
      toast.error(error.message);
    } else {
      setContacts((p) => p.filter((c) => c.id !== contact.id));
      toast.success(`${contact.name} removed from contacts`);
    }
    setDeleting(false);
    setDeleteConfirm({ open: false, contact: null });
  }

  async function toggleOpt(contact) {
    setTogglingId(contact.id);
    const newVal = !contact.optedOut;
    const { error } = await supabase
      .from("contacts")
      .update({ optedOut: newVal })
      .eq("id", contact.id);
    if (error) {
      toast.error(error.message);
    } else {
      setContacts((p) =>
        p.map((c) =>
          c.id === contact.id ? { ...c, optedOut: newVal } : c
        )
      );
      toast.success(
        newVal
          ? `${contact.name} opted out`
          : `${contact.name} restored`
      );
    }
    setTogglingId(null);
  }

  async function handleCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }
      const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h === "name");
      const emailIdx = headers.findIndex((h) => h === "email");
      const phoneIdx = headers.findIndex((h) => h === "phone");
      if (nameIdx === -1) {
        toast.error('CSV must have a "Name" column');
        return;
      }
      if (emailIdx === -1 && phoneIdx === -1) {
        toast.error('CSV must have an "Email" or "Phone" column');
        return;
      }
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const name = cols[nameIdx]?.trim();
        const email = emailIdx !== -1 ? cols[emailIdx]?.trim() : "";
        const phone = phoneIdx !== -1 ? cols[phoneIdx]?.trim() : "";
        if (!name) continue;
        if (!email && !phone) continue;
        rows.push({
          user_id: userId,
          name,
          email: email || null,
          phone: phone || null,
        });
      }
      if (!rows.length) {
        toast.error("No valid contacts found in CSV");
        return;
      }
      const { data, error } = await supabase
        .from("contacts")
        .insert(rows)
        .select();
      if (error) {
        toast.error(error.message);
      } else {
        setContacts((p) => [...(data || []), ...p]);
        toast.success(
          `${data?.length || rows.length} contact${(data?.length || rows.length) !== 1 ? "s" : ""} imported`
        );
      }
    } catch {
      toast.error("Failed to parse CSV");
    }
    setUploading(false);
    e.target.value = "";
  }

  function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter" && nName.trim() && (nPhone.trim() || nEmail.trim())) {
      addContact();
    }
  };

  if (loading) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
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
              Contact book
            </h2>
            <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
              Loading contacts…
            </p>
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} sx={{ marginBottom: 10, padding: "13px 15px" }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: G.border,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 14,
                    width: "40%",
                    background: G.border,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 12,
                    width: "60%",
                    background: G.border,
                    borderRadius: 6,
                    marginBottom: 4,
                  }}
                />
                <div
                  style={{
                    height: 11,
                    width: "30%",
                    background: G.border,
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
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
              Contact book
            </h2>
          </div>
        </div>
        <Card sx={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: G.muted, margin: "0 0 16px", fontSize: 14 }}>
            {fetchError}
          </p>
          <Btn onClick={fetchContacts}>Retry</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <ConfirmModal
        open={deleteConfirm.open}
        title="Remove contact"
        message={`Are you sure you want to remove ${deleteConfirm.contact?.name || "this contact"}? This cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={deleteContact}
        onCancel={() => setDeleteConfirm({ open: false, contact: null })}
        loading={deleting}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleCSV}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
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
            Contact book
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            {contacts.some((c) => c.optedOut)
              ? ` · ${contacts.filter((c) => c.optedOut).length} opted out`
              : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            disabled={uploading}
          >
            ↑ Import CSV
          </Btn>
          <Btn
            size="sm"
            onClick={() => {
              setShowAdd(true);
              setContactErrors({});
            }}
          >
            + Add
          </Btn>
        </div>
      </div>

      {showAdd && (
        <Card
          sx={{
            marginBottom: 14,
            border: `1.5px solid ${G.accentBd}`,
            background: G.accentBg,
          }}
          onKeyDown={handleAddKeyDown}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Add new contact
          </div>
          <Field
            label="Full name"
            value={nName}
            onChange={(e) => setNName(e.target.value)}
            placeholder="James Patterson"
            error={contactErrors.name}
          />
          <Field
            label="Phone number"
            value={nPhone}
            onChange={(e) => setNPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            error={contactErrors.phone}
          />
          <Field
            label="Email address"
            value={nEmail}
            onChange={(e) => setNEmail(e.target.value)}
            placeholder="james@gmail.com"
            type="email"
            error={contactErrors.email}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              variant="secondary"
              onClick={() => {
                setShowAdd(false);
                setContactErrors({});
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={addContact} loading={adding}>
              Save contact
            </Btn>
          </div>
        </Card>
      )}

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: G.muted,
          }}
        >
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email…"
          aria-label="Search contacts"
          style={{
            width: "100%",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            padding: "10px 14px 10px 36px",
            fontSize: 13.5,
            color: G.ink,
            outline: "2px solid transparent",
            outlineOffset: "2px",
            boxSizing: "border-box",
            fontFamily: "'Manrope',sans-serif",
          }}
        />
      </div>

      {list.length === 0 && !search && (
        <EmptyState
          icon="📇"
          title="No contacts yet"
          description="Add contacts manually or import from a CSV file to get started."
          action={
            <Btn
              size="sm"
              onClick={() => {
                setShowAdd(true);
                setContactErrors({});
              }}
            >
              + Add your first contact
            </Btn>
          }
        />
      )}

      {list.length === 0 && search && (
        <EmptyState
          icon="🔍"
          title="No matches"
          description={`No contacts match "${search}". Try a different search term.`}
        />
      )}

      {list.map((c) => (
        <Card
          key={c.id}
          sx={{
            marginBottom: 10,
            padding: "13px 15px",
            opacity: c.optedOut ? 0.6 : 1,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: c.optedOut ? G.border : G.accentBg,
                border: `1.5px solid ${
                  c.optedOut ? G.borderHi : G.accentBd
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: c.optedOut ? G.muted : G.accent,
                flexShrink: 0,
              }}
            >
              {c.name?.[0] || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {c.name}
                </span>
                {c.optedOut && <Pill color={G.muted}>Opted out</Pill>}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                {[c.phone, c.email].filter(Boolean).join(" · ") || "No contact info"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <Btn
                size="sm"
                variant={c.optedOut ? "success" : "ghost"}
                onClick={() => toggleOpt(c)}
                loading={togglingId === c.id}
                sx={{ fontSize: 10.5 }}
              >
                {c.optedOut ? "Restore" : "Opt out"}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => openDeleteConfirm(c)}
                sx={{ fontSize: 10.5, color: G.muted }}
              >
                Delete
              </Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
