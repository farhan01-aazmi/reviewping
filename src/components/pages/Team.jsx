import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import { fmtDate } from "../../utils/formatters";
import { toast } from "sonner";

export default function Team({ plan, userId }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Staff");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("team_members")
      .select("*")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch team members:", error);
          return;
        }
        setTeam(data || []);
      })
      .catch((err) => console.error("Failed to fetch team members:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const invite = async () => {
    if (!inviteEmail) {
      toast.error("Enter an email address");
      return;
    }
    if (plan === "starter") {
      toast.error("Upgrade to Growth or Agency to invite team members");
      return;
    }
    setInviting(true);
    try {
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          user_id: userId,
          name: inviteEmail.split("@")[0],
          email: inviteEmail,
          role: inviteRole,
          status: "invited",
        })
        .select();
      if (error) {
        console.error("Failed to invite team member:", error);
        toast.error("Failed to send invitation");
        return;
      }
      if (data) setTeam((p) => [...p, data[0]]);
      setInviteEmail("");
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (err) {
      console.error("Failed to invite team member:", err);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const remove = async (id) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Failed to remove team member:", error);
        toast.error("Failed to remove team member");
        return;
      }
      setTeam((p) => p.filter((m) => m.id !== id));
      toast.success("Team member removed");
    } catch (err) {
      console.error("Failed to remove team member:", err);
      toast.error("Failed to remove team member");
    }
  };

  const roles = ["Owner", "Manager", "Staff"];

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
        Team members
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        {team.length} member{team.length !== 1 ? "s" : ""} ·{" "}
        {plan === "agency" ? "5 locations" : "1 location"}
      </p>
      {plan === "starter" && (
        <Card
          sx={{
            background: G.goldBg,
            border: `1.5px solid ${G.goldBd}`,
            marginBottom: 16,
          }}
        >
          <div
            style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}
          >
            ⚡ Upgrade to invite team
          </div>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13.5,
              color: G.inkSoft,
              lineHeight: 1.7,
            }}
          >
            Growth and Agency plans allow you to add team members who can
            send requests on your behalf.
          </p>
          <Btn size="sm">Upgrade to Growth →</Btn>
        </Card>
      )}
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 14,
            color: G.inkSoft,
          }}
        >
          Invite a team member
        </div>
        <Field
          label="Email address"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="colleague@business.com"
          type="email"
        />
        <Sel
          label="Role"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
          options={roles}
        />
        <Btn onClick={invite} disabled={plan === "starter" || inviting}>
          {inviting ? "Sending…" : "Send invitation →"}
        </Btn>
      </Card>
      {loading ? (
        <p style={{ color: G.muted, fontSize: 13.5 }}>Loading team...</p>
      ) : (
        <>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: G.muted,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Current team
          </div>
          {team.map((m) => (
            <Card
              key={m.id}
              sx={{ marginBottom: 10, padding: "14px 16px" }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "center" }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: G.accentBg,
                    border: `1.5px solid ${G.accentBd}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    color: G.accent,
                    flexShrink: 0,
                  }}
                >
                  {(m.name?.[0] || "?").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {m.name}
                    </span>
                    <Pill
                      color={
                        m.role === "Owner"
                          ? G.accent
                          : m.role === "Manager"
                          ? G.purple
                          : G.muted
                      }
                    >
                      {m.role}
                    </Pill>
                    {m.status === "invited" && (
                      <Pill color={G.gold}>Invited</Pill>
                    )}
                  </div>
                  <div
                    style={{ fontSize: 12, color: G.muted, marginTop: 2 }}
                  >
                    {m.email} ·{" "}
                    {m.status === "active"
                      ? `Joined ${fmtDate(m.joinedAt)}`
                      : "Invite pending"}
                  </div>
                </div>
                {m.role !== "Owner" && (
                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() => remove(m.id)}
                  >
                    Remove
                  </Btn>
                )}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
