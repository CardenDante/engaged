"use client";

import { useState, useEffect } from "react";
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
  photoUrl?: string;
}

interface Match {
  id: string;
  score: number;
  status: string;
  male: Youth;
  female: Youth;
}

export default function MatchesPage() {
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

  return (
    <div className="min-h-screen" style={{ paddingBottom: 90 }}>
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
              fontSize: 15, fontWeight: 500, color: "#fff", background: "#007AFF",
              border: "none", borderRadius: 100, padding: "7px 16px", cursor: "pointer",
              opacity: generating ? 0.6 : 1, marginBottom: 4,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {generating && (
              <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
            )}
            {generating ? "Finding..." : "Find Matches"}
          </button>
        </div>

        {/* Segmented control */}
        <div style={{ padding: "4px 16px 10px" }}>
          <div className="ios-segmented">
            {(["all", "suggested", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
          <div style={{ width: 20, height: 20, border: "2.5px solid rgba(0,0,0,0.08)", borderTopColor: "#007AFF", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(118,118,128,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.3)" strokeWidth="1.6">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p style={{ fontSize: 17, color: "rgba(60,60,67,0.6)" }}>No Matches Yet</p>
          <p style={{ fontSize: 13, color: "rgba(60,60,67,0.3)", marginTop: 4 }}>
            Tap Find Matches to discover compatible pairs
          </p>
        </div>
      ) : (
        <div style={{ padding: "8px 16px" }}>
          <p style={{ fontSize: 13, color: "rgba(60,60,67,0.6)", marginBottom: 12 }}>
            {filtered.length} match{filtered.length !== 1 ? "es" : ""}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((match) => (
              <MatchCard key={match.id} match={match} onUpdate={updateStatus} />
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <BottomNav />
    </div>
  );
}

function MatchCard({ match, onUpdate }: { match: Match; onUpdate: (id: string, status: string) => void }) {
  const maleAge = calculateAge(new Date(match.male.dateOfBirth));
  const femaleAge = calculateAge(new Date(match.female.dateOfBirth));

  const scoreColor = match.score >= 80
    ? { bg: "rgba(52,199,89,0.1)", color: "#34C759" }
    : match.score >= 65
    ? { bg: "rgba(0,122,255,0.1)", color: "#007AFF" }
    : { bg: "rgba(255,149,0,0.1)", color: "#FF9500" };

  const statusColor =
    match.status === "approved" ? "#34C759" :
    match.status === "rejected" ? "#FF3B30" : "rgba(60,60,67,0.3)";

  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
      {/* Score bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 0" }}>
        <span style={{
          fontSize: 13, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
          background: scoreColor.bg, color: scoreColor.color,
        }}>
          {match.score}% match
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {match.status}
        </span>
      </div>

      {/* Pair */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 14px 14px" }}>
        {/* Male */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Avatar src={match.male.photoUrl} initials={getInitials(match.male.firstName, match.male.lastName)} size={52} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#000", marginTop: 8 }}>{match.male.firstName}</p>
          <p style={{ fontSize: 12, color: "rgba(60,60,67,0.6)", marginTop: 1 }}>{maleAge} yrs</p>
          <p style={{ fontSize: 11, color: "rgba(60,60,67,0.3)", marginTop: 1 }}>{match.male.branch}</p>
        </div>

        {/* Heart */}
        <div style={{ padding: "0 8px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF2D55" stroke="none" opacity={0.8}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Female */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Avatar src={match.female.photoUrl} initials={getInitials(match.female.firstName, match.female.lastName)} size={52} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#000", marginTop: 8 }}>{match.female.firstName}</p>
          <p style={{ fontSize: 12, color: "rgba(60,60,67,0.6)", marginTop: 1 }}>{femaleAge} yrs</p>
          <p style={{ fontSize: 11, color: "rgba(60,60,67,0.3)", marginTop: 1 }}>{match.female.branch}</p>
        </div>
      </div>

      {/* Actions */}
      {match.status === "suggested" && (
        <div style={{ display: "flex", borderTop: "0.5px solid rgba(60,60,67,0.12)" }}>
          <button
            onClick={() => onUpdate(match.id, "rejected")}
            style={{
              flex: 1, padding: "12px 0", fontSize: 15, fontWeight: 400,
              color: "#FF3B30", textAlign: "center", background: "transparent",
              border: "none", cursor: "pointer", borderRight: "0.5px solid rgba(60,60,67,0.12)",
            }}
          >
            Decline
          </button>
          <button
            onClick={() => onUpdate(match.id, "approved")}
            style={{
              flex: 1, padding: "12px 0", fontSize: 15, fontWeight: 600,
              color: "#34C759", textAlign: "center", background: "transparent",
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
