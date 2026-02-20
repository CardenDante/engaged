"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";
import { calculateAge, getInitials, formatDate } from "@/lib/utils";

interface Youth {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  branch: string;
  occupation?: string;
  bio?: string;
  photoUrl?: string;
  status: string;
  interests?: string;
  educationLevel?: string;
  minAgePref?: number;
  maxAgePref?: number;
  branchPref: string;
  fellowship?: string;
  createdAt: string;
}

interface ScoreBreakdown {
  age: number;
  agePref: number;
  branch: number;
  interests: number;
  education: number;
  fellowship: number;
  profile: number;
  total: number;
}

interface Match {
  id: string;
  score: number;
  breakdown?: string;
  status: string;
  male: Youth;
  female: Youth;
  createdAt: string;
}

const EDUCATION_LABELS: Record<string, string> = {
  high_school: "High School",
  diploma: "Diploma",
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: "Doctorate",
};

const FELLOWSHIP_LABELS: Record<string, string> = {
  "1": "~1 year",
  "2-3": "2-3 years",
  "4-5": "4-5 years",
  "6+": "6+ years",
};

const BREAKDOWN_CONFIG: { key: keyof Omit<ScoreBreakdown, "total">; label: string; max: number }[] = [
  { key: "age", label: "Age Compatibility", max: 25 },
  { key: "agePref", label: "Age Preference Fit", max: 20 },
  { key: "branch", label: "Branch Match", max: 15 },
  { key: "interests", label: "Shared Interests", max: 20 },
  { key: "education", label: "Education Level", max: 10 },
  { key: "fellowship", label: "Fellowship", max: 5 },
  { key: "profile", label: "Profile Quality", max: 5 },
];

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/matches/${id}`)
      .then((r) => r.json())
      .then((d) => { setMatch(d); setLoading(false); });
  }, [id]);

  const updateStatus = async (status: string) => {
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: id, status }),
    });
    const res = await fetch(`/api/matches/${id}`);
    setMatch(await res.json());
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{
          width: 32, height: 32,
          border: "3px solid rgba(0,0,0,0.06)", borderTopColor: "#007AFF",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ fontSize: 17, color: "rgba(60,60,67,0.6)" }}>Match not found</p>
        <button onClick={() => router.back()} style={{ fontSize: 17, color: "#007AFF", marginTop: 8, background: "none", border: "none", cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  const male = match.male;
  const female = match.female;
  const maleAge = calculateAge(new Date(male.dateOfBirth));
  const femaleAge = calculateAge(new Date(female.dateOfBirth));

  let breakdown: ScoreBreakdown | null = null;
  try {
    if (match.breakdown) breakdown = JSON.parse(match.breakdown);
  } catch { /* ignore */ }

  const scoreColor = match.score >= 75 ? "#34C759" : match.score >= 55 ? "#007AFF" : "#FF9500";

  const maleInterests = male.interests ? male.interests.split(",").map((s) => s.trim()) : [];
  const femaleInterests = female.interests ? female.interests.split(",").map((s) => s.trim()) : [];
  const sharedInterests = maleInterests.filter((i) =>
    femaleInterests.some((fi) => fi.toLowerCase() === i.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ paddingBottom: 90, background: "#f2f2f7" }}>
      {/* Nav bar */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "rgba(249, 249, 249, 0.94)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "0.5px solid rgba(60,60,67,0.12)",
        }}
      >
        <div style={{ height: 54 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", height: 44 }}>
          <button
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 17, color: "#007AFF", background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
              <path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Matches
          </button>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#000" }}>Comparison</span>
          <div style={{ width: 70 }} />
        </div>
      </div>

      {/* Hero section - photos side by side */}
      <div style={{
        background: "linear-gradient(180deg, #fff 0%, #f2f2f7 100%)",
        padding: "28px 16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 12 }}>
          {/* Male */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <button
              onClick={() => router.push(`/youth/${male.id}`)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <div style={{
                padding: 3, borderRadius: "50%",
                background: "linear-gradient(135deg, #007AFF, #5856D6)",
              }}>
                <div style={{ borderRadius: "50%", overflow: "hidden", border: "3px solid #fff" }}>
                  <Avatar src={male.photoUrl} initials={getInitials(male.firstName, male.lastName)} size={80} />
                </div>
              </div>
            </button>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#000", marginTop: 10 }}>
              {male.firstName}
            </p>
            <p style={{ fontSize: 15, color: "rgba(60,60,67,0.5)" }}>
              {male.lastName}
            </p>
            <p style={{ fontSize: 13, color: "rgba(60,60,67,0.35)", marginTop: 2 }}>
              {maleAge} years old
            </p>
          </div>

          {/* Score center */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10 }}>
            <ScoreRingLarge score={match.score} color={scoreColor} />
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
              color: scoreColor, marginTop: 6, textTransform: "uppercase",
            }}>
              {match.score >= 75 ? "Great" : match.score >= 55 ? "Good" : "Fair"}
            </span>
          </div>

          {/* Female */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <button
              onClick={() => router.push(`/youth/${female.id}`)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <div style={{
                padding: 3, borderRadius: "50%",
                background: "linear-gradient(135deg, #FF2D55, #AF52DE)",
              }}>
                <div style={{ borderRadius: "50%", overflow: "hidden", border: "3px solid #fff" }}>
                  <Avatar src={female.photoUrl} initials={getInitials(female.firstName, female.lastName)} size={80} />
                </div>
              </div>
            </button>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#000", marginTop: 10 }}>
              {female.firstName}
            </p>
            <p style={{ fontSize: 15, color: "rgba(60,60,67,0.5)" }}>
              {female.lastName}
            </p>
            <p style={{ fontSize: 13, color: "rgba(60,60,67,0.35)", marginTop: 2 }}>
              {femaleAge} years old
            </p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      {breakdown && (
        <Section title="Compatibility Breakdown">
          {BREAKDOWN_CONFIG.map(({ key, label, max }) => {
            const val = breakdown[key] || 0;
            const pct = (val / max) * 100;
            const barColor = pct >= 70 ? "#34C759" : pct >= 40 ? "#007AFF" : pct > 0 ? "#FF9500" : "rgba(118,118,128,0.06)";
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                borderBottom: key !== "profile" ? "0.5px solid rgba(60,60,67,0.08)" : "none",
              }}>
                <span style={{ fontSize: 14, color: "#000", width: 130, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(118,118,128,0.06)", overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 3,
                    background: barColor,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(60,60,67,0.4)", width: 32, textAlign: "right", fontWeight: 600 }}>{val}/{max}</span>
              </div>
            );
          })}
        </Section>
      )}

      {/* Side by side comparison */}
      <Section title="Details Comparison">
        <CompareRow label="Age" left={`${maleAge}`} right={`${femaleAge}`} />
        <CompareRow label="Birthday" left={formatDate(new Date(male.dateOfBirth))} right={formatDate(new Date(female.dateOfBirth))} />
        <CompareRow label="Branch" left={male.branch} right={female.branch} match={male.branch.toLowerCase() === female.branch.toLowerCase()} />
        <CompareRow
          label="Occupation"
          left={male.occupation || "-"}
          right={female.occupation || "-"}
        />
        <CompareRow
          label="Education"
          left={male.educationLevel ? (EDUCATION_LABELS[male.educationLevel] || male.educationLevel) : "-"}
          right={female.educationLevel ? (EDUCATION_LABELS[female.educationLevel] || female.educationLevel) : "-"}
          match={male.educationLevel === female.educationLevel && !!male.educationLevel}
        />
        <CompareRow
          label="Fellowship"
          left={male.fellowship ? (FELLOWSHIP_LABELS[male.fellowship] || male.fellowship) : "-"}
          right={female.fellowship ? (FELLOWSHIP_LABELS[female.fellowship] || female.fellowship) : "-"}
          last
        />
      </Section>

      {/* Shared interests */}
      {(maleInterests.length > 0 || femaleInterests.length > 0) && (
        <Section title="Interests">
          {sharedInterests.length > 0 && (
            <div style={{ padding: "10px 16px", borderBottom: "0.5px solid rgba(60,60,67,0.08)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#34C759", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 8 }}>
                Shared
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sharedInterests.map((i) => (
                  <span key={i} style={{
                    padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                    background: "rgba(52,199,89,0.1)", color: "#34C759",
                  }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", padding: "10px 16px", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#007AFF", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 6 }}>
                {male.firstName}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {maleInterests.length > 0 ? maleInterests.map((i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                    background: sharedInterests.some((s) => s.toLowerCase() === i.toLowerCase())
                      ? "rgba(52,199,89,0.08)" : "rgba(118,118,128,0.08)",
                    color: sharedInterests.some((s) => s.toLowerCase() === i.toLowerCase())
                      ? "#34C759" : "rgba(60,60,67,0.5)",
                  }}>
                    {i}
                  </span>
                )) : <span style={{ fontSize: 13, color: "rgba(60,60,67,0.3)" }}>None set</span>}
              </div>
            </div>
            <div style={{ width: 0.5, background: "rgba(60,60,67,0.08)" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#FF2D55", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 6 }}>
                {female.firstName}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {femaleInterests.length > 0 ? femaleInterests.map((i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                    background: sharedInterests.some((s) => s.toLowerCase() === i.toLowerCase())
                      ? "rgba(52,199,89,0.08)" : "rgba(118,118,128,0.08)",
                    color: sharedInterests.some((s) => s.toLowerCase() === i.toLowerCase())
                      ? "#34C759" : "rgba(60,60,67,0.5)",
                  }}>
                    {i}
                  </span>
                )) : <span style={{ fontSize: 13, color: "rgba(60,60,67,0.3)" }}>None set</span>}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Preferences comparison */}
      <Section title="Preferences">
        <CompareRow
          label="Age Pref"
          left={male.minAgePref || male.maxAgePref ? `${male.minAgePref || "Any"} - ${male.maxAgePref || "Any"}` : "Any"}
          right={female.minAgePref || female.maxAgePref ? `${female.minAgePref || "Any"} - ${female.maxAgePref || "Any"}` : "Any"}
        />
        <CompareRow
          label="Branch Pref"
          left={male.branchPref === "same" ? "Same Only" : "Any"}
          right={female.branchPref === "same" ? "Same Only" : "Any"}
          last
        />
      </Section>

      {/* Action buttons */}
      {match.status === "suggested" && (
        <div style={{ padding: "0 16px", marginTop: 8 }}>
          <button
            onClick={() => updateStatus("approved")}
            style={{
              width: "100%", padding: "14px", fontSize: 17, fontWeight: 600,
              color: "#fff", textAlign: "center",
              background: "linear-gradient(135deg, #34C759, #30D158)",
              border: "none", borderRadius: 12, cursor: "pointer",
              boxShadow: "0 2px 12px rgba(52,199,89,0.3)",
              marginBottom: 10,
            }}
          >
            Approve Match
          </button>
          <button
            onClick={() => updateStatus("rejected")}
            style={{
              width: "100%", padding: "14px", fontSize: 17, fontWeight: 500,
              color: "#FF3B30", textAlign: "center",
              background: "rgba(255,59,48,0.06)",
              border: "none", borderRadius: 12, cursor: "pointer",
            }}
          >
            Decline Match
          </button>
        </div>
      )}

      {match.status !== "suggested" && (
        <div style={{ padding: "0 16px", marginTop: 8 }}>
          <div style={{
            padding: "14px", borderRadius: 12, textAlign: "center",
            background: match.status === "approved" ? "rgba(52,199,89,0.06)" : "rgba(255,59,48,0.06)",
          }}>
            <span style={{
              fontSize: 15, fontWeight: 600,
              color: match.status === "approved" ? "#34C759" : "#FF3B30",
            }}>
              {match.status === "approved" ? "Match Approved" : "Match Declined"}
            </span>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
      <BottomNav />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ScoreRingLarge({ score, color }: { score: number; color: string }) {
  const size = 64;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(118,118,128,0.08)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.5px" }}>{score}</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        padding: "0 32px", marginBottom: 6,
        fontSize: 13, color: "rgba(60,60,67,0.6)",
        textTransform: "uppercase", letterSpacing: "0.02em",
      }}>
        {title}
      </div>
      <div style={{
        background: "#fff", borderRadius: 10,
        margin: "0 16px", overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  left,
  right,
  match: isMatch,
  last = false,
}: {
  label: string;
  left: string;
  right: string;
  match?: boolean;
  last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "10px 16px", minHeight: 44,
      borderBottom: last ? "none" : "0.5px solid rgba(60,60,67,0.08)",
    }}>
      <span style={{ fontSize: 13, color: "rgba(60,60,67,0.4)", width: 74, flexShrink: 0, fontWeight: 500 }}>
        {label}
      </span>
      <span style={{
        flex: 1, fontSize: 14, color: "#000", textAlign: "center", fontWeight: 500,
      }}>
        {left}
      </span>
      {isMatch !== undefined && (
        <span style={{ padding: "0 4px" }}>
          {isMatch ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#34C759" stroke="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(118,118,128,0.2)" stroke="none">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
        </span>
      )}
      <span style={{
        flex: 1, fontSize: 14, color: "#000", textAlign: "center", fontWeight: 500,
      }}>
        {right}
      </span>
    </div>
  );
}
