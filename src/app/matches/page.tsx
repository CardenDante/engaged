"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";
import { calculateAge, getInitials } from "@/lib/utils";

interface Youth {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  branch: string;
  occupation?: string;
  interests?: string;
  educationLevel?: string;
  photoUrl?: string;
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
}

const BREAKDOWN_LABELS: { key: keyof Omit<ScoreBreakdown, "total">; label: string; max: number; icon: string }[] = [
  { key: "age", label: "Age", max: 25, icon: "M12 8v4l3 3" },
  { key: "agePref", label: "Preference", max: 20, icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { key: "branch", label: "Branch", max: 15, icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { key: "interests", label: "Interests", max: 20, icon: "M12 2L2 7l10 5 10-5-10-5z" },
  { key: "education", label: "Education", max: 10, icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" },
  { key: "fellowship", label: "Church", max: 5, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
  { key: "profile", label: "Profile", max: 5, icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
];

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "suggested" | "approved" | "rejected">("all");

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    setMatches(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchMatches(); }, []);

  const generate = async () => {
    setGenerating(true);
    const res = await fetch("/api/matches?action=generate", { method: "POST" });
    setMatches(await res.json());
    setGenerating(false);
  };

  const updateStatus = async (matchId: string, status: string) => {
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, status }),
    });
    fetchMatches();
  };

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter);
  const counts = {
    all: matches.length,
    suggested: matches.filter((m) => m.status === "suggested").length,
    approved: matches.filter((m) => m.status === "approved").length,
    rejected: matches.filter((m) => m.status === "rejected").length,
  };

  return (
    <div className="min-h-screen" style={{ paddingBottom: 90, background: "#f2f2f7" }}>
      {/* Nav */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "rgba(242, 242, 247, 0.94)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div style={{ height: 54 }} />
        <div style={{ padding: "0 16px 6px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <h1 className="ios-large-title">Matches</h1>
          <button
            onClick={generate}
            disabled={generating}
            style={{
              fontSize: 15, fontWeight: 600, color: "#fff",
              background: "linear-gradient(135deg, #007AFF, #5856D6)",
              border: "none", borderRadius: 100, padding: "8px 20px", cursor: "pointer",
              opacity: generating ? 0.6 : 1, marginBottom: 4,
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 2px 12px rgba(0,122,255,0.3)",
            }}
          >
            {generating ? (
              <span style={{
                width: 14, height: 14,
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                borderRadius: "50%", display: "inline-block",
                animation: "spin 0.6s linear infinite",
              }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            )}
            {generating ? "Finding..." : "Generate"}
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: "4px 16px 10px" }}>
          <div className="ios-segmented">
            {(["all", "suggested", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && (
                  <span style={{
                    marginLeft: 4, fontSize: 11, fontWeight: 600,
                    background: filter === f ? "rgba(0,122,255,0.12)" : "rgba(0,0,0,0.06)",
                    color: filter === f ? "#007AFF" : "rgba(60,60,67,0.4)",
                    padding: "1px 5px", borderRadius: 6,
                  }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 100 }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid rgba(0,0,0,0.06)", borderTopColor: "#007AFF",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: 15, color: "rgba(60,60,67,0.4)", marginTop: 16, fontWeight: 500 }}>
            Loading matches...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 80, padding: "80px 40px 0" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: "linear-gradient(135deg, rgba(255,45,85,0.1), rgba(175,82,222,0.1))",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#000", marginBottom: 6 }}>No Matches Yet</p>
          <p style={{ fontSize: 15, color: "rgba(60,60,67,0.4)", lineHeight: "20px" }}>
            Tap Generate to discover compatible pairs from enrolled youth
          </p>
        </div>
      ) : (
        <div style={{ padding: "12px 16px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14, padding: "0 2px",
          }}>
            <p style={{ fontSize: 13, color: "rgba(60,60,67,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {filtered.length} match{filtered.length !== 1 ? "es" : ""}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onUpdate={updateStatus}
                onViewDetails={() => router.push(`/matches/${match.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <BottomNav />
    </div>
  );
}

function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? "#34C759" : score >= 55 ? "#007AFF" : "#FF9500";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(118,118,128,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, color, letterSpacing: "-0.5px" }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  onUpdate,
  onViewDetails,
}: {
  match: Match;
  onUpdate: (id: string, status: string) => void;
  onViewDetails: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const maleAge = calculateAge(new Date(match.male.dateOfBirth));
  const femaleAge = calculateAge(new Date(match.female.dateOfBirth));

  const statusConfig = {
    suggested: { bg: "rgba(255,149,0,0.08)", color: "#FF9500", label: "Pending" },
    approved: { bg: "rgba(52,199,89,0.08)", color: "#34C759", label: "Approved" },
    rejected: { bg: "rgba(255,59,48,0.08)", color: "#FF3B30", label: "Declined" },
  }[match.status] || { bg: "rgba(142,142,147,0.08)", color: "#8E8E93", label: match.status };

  let breakdown: ScoreBreakdown | null = null;
  try {
    if (match.breakdown) breakdown = JSON.parse(match.breakdown);
  } catch { /* ignore */ }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
      animation: "fadeIn 0.3s ease",
    }}>
      {/* Header: status + score ring */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px 0",
      }}>
        <span style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.3px",
          padding: "3px 10px", borderRadius: 100,
          background: statusConfig.bg, color: statusConfig.color,
          textTransform: "uppercase",
        }}>
          {statusConfig.label}
        </span>
        <button
          onClick={() => breakdown && setExpanded(!expanded)}
          style={{
            background: "none", border: "none", cursor: breakdown ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: 4, padding: 0,
          }}
        >
          <ScoreRing score={match.score} size={44} />
        </button>
      </div>

      {/* Pair display */}
      <div style={{ display: "flex", alignItems: "flex-start", padding: "16px 12px 12px" }}>
        {/* Male */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{
            padding: 3, borderRadius: "50%",
            background: "linear-gradient(135deg, #007AFF, #5856D6)",
          }}>
            <div style={{ borderRadius: "50%", overflow: "hidden", border: "2px solid #fff" }}>
              <Avatar src={match.male.photoUrl} initials={getInitials(match.male.firstName, match.male.lastName)} size={60} />
            </div>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#000", marginTop: 10, lineHeight: "18px" }}>
            {match.male.firstName}
          </p>
          <p style={{ fontSize: 15, fontWeight: 400, color: "rgba(60,60,67,0.5)", lineHeight: "18px" }}>
            {match.male.lastName}
          </p>
          <p style={{
            fontSize: 12, color: "rgba(60,60,67,0.4)", marginTop: 4,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            {maleAge} yrs
          </p>
          <p style={{ fontSize: 11, color: "rgba(60,60,67,0.3)", marginTop: 2 }}>
            {match.male.branch}
          </p>
        </div>

        {/* Center connector */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", paddingTop: 12, gap: 4,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF2D55, #FF6482)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(255,45,85,0.3)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </div>

        {/* Female */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{
            padding: 3, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF2D55, #AF52DE)",
          }}>
            <div style={{ borderRadius: "50%", overflow: "hidden", border: "2px solid #fff" }}>
              <Avatar src={match.female.photoUrl} initials={getInitials(match.female.firstName, match.female.lastName)} size={60} />
            </div>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#000", marginTop: 10, lineHeight: "18px" }}>
            {match.female.firstName}
          </p>
          <p style={{ fontSize: 15, fontWeight: 400, color: "rgba(60,60,67,0.5)", lineHeight: "18px" }}>
            {match.female.lastName}
          </p>
          <p style={{
            fontSize: 12, color: "rgba(60,60,67,0.4)", marginTop: 4,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            {femaleAge} yrs
          </p>
          <p style={{ fontSize: 11, color: "rgba(60,60,67,0.3)", marginTop: 2 }}>
            {match.female.branch}
          </p>
        </div>
      </div>

      {/* Expandable score breakdown */}
      {expanded && breakdown && (
        <div style={{
          padding: "4px 16px 12px",
          borderTop: "0.5px solid rgba(60,60,67,0.08)",
          margin: "0 12px",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(60,60,67,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, marginTop: 8 }}>
            Score Breakdown
          </p>
          {BREAKDOWN_LABELS.map(({ key, label, max }) => {
            const val = breakdown[key] || 0;
            const pct = (val / max) * 100;
            const barColor = pct >= 70 ? "#34C759" : pct >= 40 ? "#007AFF" : pct > 0 ? "#FF9500" : "rgba(118,118,128,0.08)";
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(60,60,67,0.5)", width: 68, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(118,118,128,0.06)", overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 3,
                    background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <span style={{ fontSize: 11, color: "rgba(60,60,67,0.3)", width: 28, textAlign: "right", fontWeight: 600 }}>{val}/{max}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details button */}
      <button
        onClick={onViewDetails}
        style={{
          width: "100%", padding: "11px 16px",
          fontSize: 14, fontWeight: 500, color: "#007AFF",
          background: "rgba(0,122,255,0.04)",
          border: "none", borderTop: "0.5px solid rgba(60,60,67,0.08)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        View Comparison
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Action buttons */}
      {match.status === "suggested" && (
        <div style={{
          display: "flex",
          borderTop: "0.5px solid rgba(60,60,67,0.08)",
        }}>
          <button
            onClick={() => onUpdate(match.id, "rejected")}
            style={{
              flex: 1, padding: "13px 0", fontSize: 15, fontWeight: 500,
              color: "#FF3B30", textAlign: "center", background: "transparent",
              border: "none", cursor: "pointer",
              borderRight: "0.5px solid rgba(60,60,67,0.08)",
            }}
          >
            Decline
          </button>
          <button
            onClick={() => onUpdate(match.id, "approved")}
            style={{
              flex: 1, padding: "13px 0", fontSize: 15, fontWeight: 600,
              color: "#34C759", textAlign: "center", background: "rgba(52,199,89,0.04)",
              border: "none", cursor: "pointer",
            }}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}
