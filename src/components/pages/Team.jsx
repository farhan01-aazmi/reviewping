import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import { fmtDate } from "../../utils/formatters";

export default function Team({ plan, team, setTeam, toast }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Staff");
  const [inviting, setInviting] = useState(false);

  const invite = () => {
    if (!inviteEmail) {
      toast("Enter an email address", "error");
      return;
    }
    if (plan === "starter") {
      toast(
        "Upgrade to Growth or Agency to invite team members",
        "error"
      );
      return;
    }
    setInviting(true);
    setTimeout(() => {
      setTeam((p) => [
        ...p,
        {
          id: Date.now(),
          name: inviteEmail.split("@")[0],
          email: inviteEmail,
          role: inviteRole,
          status: "invited",
          joinedAt: Date.now(),
        },
      ]);
      setInviteEmail("");
      setInviting(false);
      toast(`Invitation sent to ${inviteEmail}`);
    }, 1200);
  };

  const remove = (id) => {
    setTeam((p) => p.filter((m) => m.id !== id));
    toast("Team member removed", "info");
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
          onChange={setInviteEmail}
          placeholder="colleague@business.com"
          type="email"
        />
        <Sel
          label="Role"
          value={inviteRole}
          onChange={setInviteRole}
          options={roles}
        />
        <Btn onClick={invite} disabled={plan === "starter"}>
          {inviting ? "Sending…" : "Send invitation →"}
        </Btn>
      </Card>
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
              {m.name[0].toUpperCase()}
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
    </div>
  );
}
