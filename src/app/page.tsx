"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  status: string;
}

export default function HomePage() {
  const [youth, setYouth] = useState<Youth[]>([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [loading, setLoading] = useState(true);

  const fetchYouth = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genderFilter !== "all") params.set("gender", genderFilter);
    params.set("status", "active");
    const res = await fetch(`/api/youth?${params}`);
    const data = await res.json();
    setYouth(data);
    setLoading(false);
  }, [search, genderFilter]);

  useEffect(() => {
    fetchYouth();
  }, [fetchYouth]);

  // Group alphabetically by last name
  const grouped = youth.reduce<Record<string, Youth[]>>((acc, y) => {
    const letter = y.lastName.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(y);
    return acc;
  }, {});
  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen">
      {/* --- iOS Large Title Nav --- */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "rgba(242, 242, 247, 0.94)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        {/* Status bar spacer */}
        <div style={{ height: 10 }} />

        {/* Large title + Add button */}
        <div style={{ padding: "0 16px 6px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <h1 className="ios-large-title">Youth</h1>
          <Link
            href="/add"
            style={{
              fontSize: 15, fontWeight: 600, color: "#fff",
              background: "#007AFF",
              border: "none", borderRadius: 100, padding: "8px 18px",
              display: "flex", alignItems: "center", gap: 5,
              textDecoration: "none", marginBottom: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </Link>
        </div>

        {/* Search bar */}
        <div style={{ padding: "0 16px 10px" }}>
          <div className="relative">
            <svg
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="rgba(60,60,67,0.3)" strokeWidth="2.5" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16" y2="16" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ios-search"
            />
          </div>
        </div>

        {/* Segmented control for gender filter */}
        <div style={{ padding: "0 16px 10px" }}>
          <div className="ios-segmented">
            {(["all", "male", "female"] as const).map((g) => (
              <button
                key={g}
                className={genderFilter === g ? "active" : ""}
                onClick={() => setGenderFilter(g)}
              >
                {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Content --- */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
          <div
            style={{
              width: 20, height: 20,
              border: "2.5px solid rgba(0,0,0,0.08)",
              borderTopColor: "#007AFF",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : youth.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(118,118,128,0.12)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.3)" strokeWidth="1.6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p style={{ fontSize: 17, color: "rgba(60,60,67,0.6)" }}>No Youth Enrolled</p>
          <Link href="/add" style={{ fontSize: 17, color: "#007AFF", display: "inline-block", marginTop: 8 }}>
            Add First Youth
          </Link>
        </div>
      ) : (
        <>
          {/* Contacts count */}
          <div style={{ padding: "4px 16px 0", fontSize: 13, color: "rgba(60,60,67,0.6)" }}>
            {youth.length} contact{youth.length !== 1 ? "s" : ""}
          </div>

          {letters.map((letter) => (
            <div key={letter}>
              {/* Section letter */}
              <div
                style={{
                  padding: "4px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(60,60,67,0.6)",
                  background: "#f2f2f7",
                  position: "sticky",
                  top: 154,
                  zIndex: 30,
                }}
              >
                {letter}
              </div>

              {/* Rows */}
              <div style={{ background: "#fff" }}>
                {grouped[letter].map((person, idx) => {
                  const isLast = idx === grouped[letter].length - 1;
                  return (
                    <Link
                      key={person.id}
                      href={`/youth/${person.id}`}
                      style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
                    >
                      <div style={{ paddingLeft: 16, paddingRight: 0 }}>
                        <Avatar
                          src={person.photoUrl}
                          initials={getInitials(person.firstName, person.lastName)}
                          size={40}
                        />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px 12px 12px",
                          borderBottom: isLast ? "none" : "0.5px solid rgba(60,60,67,0.12)",
                          marginLeft: 0,
                          minHeight: 44,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 17, color: "#000", lineHeight: "22px" }}>
                            {person.firstName} {person.lastName}
                          </div>
                          <div style={{ fontSize: 13, color: "rgba(60,60,67,0.6)", marginTop: 1, lineHeight: "18px" }}>
                            {calculateAge(new Date(person.dateOfBirth))} yrs · {person.branch}
                          </div>
                        </div>
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                          <path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

    </div>
  );
}
