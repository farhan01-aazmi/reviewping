import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { getLimit } from "../../data/constants";
import Btn from "./Btn";
import Card from "./Card";
import Field from "./Field";
import { toast } from "sonner";

export default function LocationManager({ userId, plan, onSelect }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const limit = getLimit(plan, "locations");

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("locations")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .then(({ data, error }) => {
        if (error) { toast.error("Failed to load locations"); return; }
        setLocations(data || []);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const addLocation = async () => {
    if (!name.trim()) { toast.error("Location name is required"); return; }
    if (locations.length >= limit) { toast.error(`Plan limit: ${limit} locations`); return; }

    const { data, error } = await supabase
      .from("locations")
      .insert({
        user_id: userId,
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        is_primary: locations.length === 0,
      })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }
    setLocations((prev) => [...prev, data]);
    setName("");
    setAddress("");
    setPhone("");
    setAdding(false);
    toast.success("Location added");
  };

  const deleteLocation = async (id) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    toast.success("Location removed");
  };

  const setPrimary = async (id) => {
    await supabase.from("locations").update({ is_primary: false }).eq("user_id", userId);
    const { error } = await supabase.from("locations").update({ is_primary: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLocations((prev) => prev.map((l) => ({ ...l, is_primary: l.id === id })));
    toast.success("Primary location updated");
  };

  if (loading) {
    return <div style={{ padding: "12px 0", textAlign: "center", color: G.muted, fontSize: 13 }}>Loading locations...</div>;
  }

  return (
    <div>
      {locations.map((loc) => (
        <div
          key={loc.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: G.bg,
            borderRadius: 8,
            border: `1.5px solid ${loc.is_primary ? G.accent : G.border}`,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: G.inkSoft }}>
              {loc.name}
              {loc.is_primary && (
                <span style={{ fontSize: 10, color: G.accent, marginLeft: 6, fontWeight: 600 }}>Primary</span>
              )}
            </div>
            {loc.address && <div style={{ fontSize: 12, color: G.muted }}>{loc.address}</div>}
          </div>
          {!loc.is_primary && (
            <button
              onClick={() => setPrimary(loc.id)}
              style={{
                background: "none", border: `1px solid ${G.border}`, borderRadius: 6,
                padding: "4px 10px", fontSize: 11, color: G.muted, cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              Set primary
            </button>
          )}
          <button
            onClick={() => deleteLocation(loc.id)}
            style={{
              background: "none", border: "none", color: G.accent, cursor: "pointer",
              fontSize: 16, padding: "0 4px", opacity: 0.6,
            }}
            title="Remove location"
          >
            {"\u2715"}
          </button>
        </div>
      ))}

      {adding ? (
        <div style={{ marginTop: 8 }}>
          <Field label="Location name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Downtown Clinic" />
          <Field label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
          <Field label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0000" />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Btn size="sm" onClick={addLocation}>Save</Btn>
            <Btn size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </div>
      ) : (
        locations.length < limit && (
          <Btn size="sm" variant="secondary" fullWidth onClick={() => setAdding(true)} style={{ marginTop: 8 }}>
            + Add location
          </Btn>
        )
      )}

      {locations.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: G.muted }}>
          No locations yet. Add your first location above.
        </div>
      )}
    </div>
  );
}