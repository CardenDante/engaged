"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { calculateAge, formatDate, getInitials } from "@/lib/utils";

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
  registeredBy: string;
  createdAt: string;
  interests?: string;
  educationLevel?: string;
  minAgePref?: number;
  maxAgePref?: number;
  branchPref: string;
  fellowship?: string;
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

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(52,199,89,0.12)", color: "#34C759", label: "Active" },
  matched: { bg: "rgba(0,122,255,0.12)", color: "#007AFF", label: "Matched" },
  married: { bg: "rgba(175,82,222,0.12)", color: "#AF52DE", label: "Married" },
  disabled: { bg: "rgba(142,142,147,0.12)", color: "#8E8E93", label: "Disabled" },
};

export default function YouthProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [youth, setYouth] = useState<Youth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYouth = () => {
      fetch(`/api/youth/${id}`)
        .then((r) => r.json())
        .then((d) => { setYouth(d); setLoading(false); });
    };
    fetchYouth();
    const onFocus = () => fetchYouth();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id]);

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/youth/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setYouth(await res.json());
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 20, height: 20, border: "2.5px solid rgba(0,0,0,0.08)", borderTopColor: "#007AFF", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!youth) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ fontSize: 17, color: "rgba(60,60,67,0.6)" }}>Not found</p>
        <button onClick={() => router.back()} style={{ fontSize: 17, color: "#007AFF", marginTop: 8, background: "none", border: "none", cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  const age = calculateAge(new Date(youth.dateOfBirth));
  const st = statusStyles[youth.status] || statusStyles.active;

  return (
    <div className="min-h-screen">
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
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", height: 44 }}>
          <button
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 17, color: "#007AFF", background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
              <path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Youth
          </button>
          <button
            onClick={() => router.push(`/youth/${id}/edit`)}
            style={{ fontSize: 17, color: "#007AFF", background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Profile Header - iOS Contact style */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 20px" }}>
        <Avatar
          src={youth.photoUrl}
          initials={getInitials(youth.firstName, youth.lastName)}
          size={96}
        />
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "#000", marginTop: 14, letterSpacing: "0.35px", lineHeight: "32px", textAlign: "center" }}>
          {youth.firstName} {youth.lastName}
        </h1>
        <p style={{ fontSize: 15, color: "rgba(60,60,67,0.6)", marginTop: 2 }}>
          {youth.branch}
        </p>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Quick action buttons - iOS Contact style */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 20 }}>
        {youth.phone && (
          <a
            href={`tel:${youth.phone}`}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 0", background: "#fff", borderRadius: 12,
              textDecoration: "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#007AFF" stroke="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span style={{ fontSize: 11, color: "#007AFF", fontWeight: 500, marginTop: 4 }}>Call</span>
          </a>
        )}
        {youth.email && (
          <a
            href={`mailto:${youth.email}`}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 0", background: "#fff", borderRadius: 12,
              textDecoration: "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#007AFF" stroke="none">
              <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 1l9 6 9-6" />
            </svg>
            <span style={{ fontSize: 11, color: "#007AFF", fontWeight: 500, marginTop: 4 }}>Email</span>
          </a>
        )}
      </div>

      {/* Info sections */}
      <InfoSection title="Details">
        <InfoRow label="Age" value={`${age} years`} />
        <InfoRow label="Gender" value={youth.gender === "male" ? "Male" : "Female"} />
        <InfoRow label="Birthday" value={formatDate(new Date(youth.dateOfBirth))} />
        {youth.phone && <InfoRow label="Phone" value={youth.phone} />}
        {youth.email && <InfoRow label="Email" value={youth.email} />}
        {youth.occupation && <InfoRow label="Occupation" value={youth.occupation} />}
        {youth.educationLevel && <InfoRow label="Education" value={EDUCATION_LABELS[youth.educationLevel] || youth.educationLevel} />}
        <InfoRow label="Branch" value={youth.branch} />
        {youth.fellowship && <InfoRow label="Fellowship" value={FELLOWSHIP_LABELS[youth.fellowship] || youth.fellowship} />}
        {youth.bio && <InfoRow label="About" value={youth.bio} last />}
        {!youth.bio && !youth.fellowship && <InfoRow label="" value="" last />}
      </InfoSection>

      {/* Interests */}
      {youth.interests && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ padding: "0 32px", marginBottom: 6, fontSize: 13, color: "rgba(60,60,67,0.6)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
            Interests
          </div>
          <div className="ios-list ios-list-inset" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {youth.interests.split(",").map((interest) => (
                <span
                  key={interest}
                  style={{
                    padding: "4px 12px", borderRadius: 100, fontSize: 14,
                    background: "rgba(0,122,255,0.1)", color: "#007AFF", fontWeight: 500,
                  }}
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      {(youth.minAgePref || youth.maxAgePref || youth.branchPref === "same") && (
        <InfoSection title="Preferences">
          {(youth.minAgePref || youth.maxAgePref) && (
            <InfoRow
              label="Age Range"
              value={`${youth.minAgePref || "Any"} - ${youth.maxAgePref || "Any"}`}
            />
          )}
          <InfoRow label="Branch Pref" value={youth.branchPref === "same" ? "Same Only" : "Any Branch"} last />
        </InfoSection>
      )}

      <InfoSection title="Registration">
        <InfoRow label="By" value={youth.registeredBy} />
        <InfoRow label="Date" value={formatDate(new Date(youth.createdAt))} last />
      </InfoSection>

      {/* Status actions */}
      <div style={{ padding: "0 16px", marginTop: 24 }}>
        {youth.status === "active" && (
          <div className="ios-list" style={{ borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => updateStatus("married")}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 17, color: "#007AFF",
                textAlign: "center", background: "#fff", border: "none", cursor: "pointer",
                borderBottom: "0.5px solid rgba(60,60,67,0.12)",
              }}
            >
              Mark as Married
            </button>
            <button
              onClick={() => updateStatus("disabled")}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 17, color: "#FF3B30",
                textAlign: "center", background: "#fff", border: "none", cursor: "pointer",
              }}
            >
              Disable
            </button>
          </div>
        )}
        {youth.status === "matched" && (
          <div className="ios-list" style={{ borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => updateStatus("married")}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 17, color: "#007AFF",
                textAlign: "center", background: "#fff", border: "none", cursor: "pointer",
                borderBottom: "0.5px solid rgba(60,60,67,0.12)",
              }}
            >
              Mark as Married
            </button>
            <button
              onClick={() => updateStatus("active")}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 17, color: "#34C759",
                textAlign: "center", background: "#fff", border: "none", cursor: "pointer",
              }}
            >
              Reactivate
            </button>
          </div>
        )}
        {(youth.status === "married" || youth.status === "disabled") && (
          <div className="ios-list" style={{ borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => updateStatus("active")}
              style={{
                width: "100%", padding: "12px 16px", fontSize: 17, color: "#34C759",
                textAlign: "center", background: "#fff", border: "none", cursor: "pointer",
              }}
            >
              Reactivate
            </button>
          </div>
        )}
      </div>


    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ padding: "0 32px", marginBottom: 6, fontSize: 13, color: "rgba(60,60,67,0.6)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
        {title}
      </div>
      <div className="ios-list ios-list-inset">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", padding: "11px 16px", minHeight: 44,
        borderBottom: last ? "none" : "0.5px solid rgba(60,60,67,0.12)",
      }}
    >
      <span style={{ fontSize: 17, color: "#000", minWidth: 100, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 17, color: "rgba(60,60,67,0.6)", flex: 1, textAlign: "right", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}
