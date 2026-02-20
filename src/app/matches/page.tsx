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
  occupation?: string;
  photoUrl?: string;
  status: string;
}

interface Match {
  id: string;
  maleId: string;
  femaleId: string;
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
    const data = await res.json();
    setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const generateMatches = async () => {
    setGenerating(true);
    const res = await fetch("/api/matches?action=generate", { method: "POST" });
    const data = await res.json();
    setMatches(data);
    setGenerating(false);
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, status }),
    });
    fetchMatches();
  };

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 65) return "text-blue-600 bg-blue-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-ios-bg/80 backdrop-blur-xl">
        <div className="px-4 pt-12 pb-1">
          <div className="flex items-center justify-between">
            <h1 className="text-[34px] font-bold text-ios-label tracking-tight">
              Matches
            </h1>
            <button
              onClick={generateMatches}
              disabled={generating}
              className="bg-ios-blue text-white px-4 py-2 rounded-full text-[13px] font-semibold disabled:opacity-50 active:opacity-80 transition-opacity"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finding...
                </span>
              ) : (
                "Find Matches"
              )}
            </button>
          </div>
          <p className="text-[13px] text-ios-gray mt-0.5">
            {matches.length} match{matches.length !== 1 ? "es" : ""} found
          </p>
        </div>

        {/* Filter */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {(["all", "suggested", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-ios-blue text-white"
                  : "bg-gray-200/60 text-ios-secondary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className="text-ios-gray text-[15px]">No matches yet</p>
          <p className="text-ios-gray/60 text-[13px] mt-1">
            Tap &quot;Find Matches&quot; to generate intelligent matches
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3 pt-1">
          {filtered.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Match Header with Score */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[13px] font-bold px-2.5 py-0.5 rounded-full ${getScoreColor(
                      match.score
                    )}`}
                  >
                    {match.score}%
                  </span>
                  <span className="text-[11px] text-ios-gray uppercase tracking-wide">
                    {match.status}
                  </span>
                </div>
              </div>

              {/* Match Pair */}
              <div className="flex items-center px-4 pb-3">
                {/* Male */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <Avatar
                    src={match.male.photoUrl}
                    initials={getInitials(match.male.firstName, match.male.lastName)}
                    size={56}
                  />
                  <p className="text-[14px] font-medium text-ios-label mt-2">
                    {match.male.firstName}
                  </p>
                  <p className="text-[12px] text-ios-gray">
                    {match.male.lastName}, {calculateAge(new Date(match.male.dateOfBirth))}
                  </p>
                  <p className="text-[11px] text-ios-gray/60 mt-0.5">
                    {match.male.branch}
                  </p>
                </div>

                {/* Heart connector */}
                <div className="px-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF3B30" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>

                {/* Female */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <Avatar
                    src={match.female.photoUrl}
                    initials={getInitials(match.female.firstName, match.female.lastName)}
                    size={56}
                  />
                  <p className="text-[14px] font-medium text-ios-label mt-2">
                    {match.female.firstName}
                  </p>
                  <p className="text-[12px] text-ios-gray">
                    {match.female.lastName}, {calculateAge(new Date(match.female.dateOfBirth))}
                  </p>
                  <p className="text-[11px] text-ios-gray/60 mt-0.5">
                    {match.female.branch}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {match.status === "suggested" && (
                <div className="flex border-t border-ios-separator/30">
                  <button
                    onClick={() => updateMatchStatus(match.id, "rejected")}
                    className="flex-1 py-3 text-[15px] text-ios-red font-medium text-center border-r border-ios-separator/30 active:bg-gray-100"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => updateMatchStatus(match.id, "approved")}
                    className="flex-1 py-3 text-[15px] text-ios-green font-semibold text-center active:bg-gray-100"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
