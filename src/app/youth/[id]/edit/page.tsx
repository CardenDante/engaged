"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import CameraCapture from "@/components/CameraCapture";

const INTEREST_OPTIONS = [
  "Music", "Cooking", "Sports", "Reading", "Travel",
  "Photography", "Volunteering", "Art", "Technology", "Fitness",
  "Movies", "Gardening", "Writing", "Business",
];

const EDUCATION_OPTIONS = [
  { value: "high_school", label: "High School" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
];

const FELLOWSHIP_OPTIONS = [
  { value: "1", label: "~1 year" },
  { value: "2-3", label: "2-3 years" },
  { value: "4-5", label: "4-5 years" },
  { value: "6+", label: "6+ years" },
];

export default function EditYouthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    phone: "",
    email: "",
    branch: "",
    occupation: "",
    bio: "",
    registeredBy: "",
    educationLevel: "",
    minAgePref: "",
    maxAgePref: "",
    branchPref: "any",
    fellowship: "",
    status: "active",
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    fetch(`/api/youth/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const dob = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : "";
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "male",
          dateOfBirth: dob,
          phone: data.phone || "",
          email: data.email || "",
          branch: data.branch || "",
          occupation: data.occupation || "",
          bio: data.bio || "",
          registeredBy: data.registeredBy || "",
          educationLevel: data.educationLevel || "",
          minAgePref: data.minAgePref != null ? String(data.minAgePref) : "",
          maxAgePref: data.maxAgePref != null ? String(data.maxAgePref) : "",
          branchPref: data.branchPref || "any",
          fellowship: data.fellowship || "",
          status: data.status || "active",
        });
        if (data.interests) {
          setSelectedInterests(data.interests.split(",").map((s: string) => s.trim()));
        }
        if (data.photoUrl) {
          setPhotoUrl(data.photoUrl);
          setPhotoPreview(data.photoUrl);
        }
        setLoading(false);
      });
  }, [id]);

  const uploadFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setPhotoUrl(data.url);
      else setError("Photo upload failed");
    } catch {
      setError("Photo upload failed");
    }
    setUploading(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleCameraCapture = async (file: File) => {
    setShowCamera(false);
    await uploadFile(file);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.branch || !form.registeredBy) {
      setError("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/youth/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photoUrl,
          interests: selectedInterests.length > 0 ? selectedInterests.join(",") : null,
        }),
      });
      if (res.ok) router.back();
      else setError("Save failed");
    } catch {
      setError("Save failed");
    }
    setSaving(false);
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 20, height: 20, border: "2.5px solid rgba(0,0,0,0.08)", borderTopColor: "#007AFF", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* iOS Nav Bar */}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 44 }}>
          <button onClick={() => router.back()} style={{ fontSize: 17, color: "#007AFF", background: "none", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#000" }}>Edit Youth</span>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              fontSize: 17, fontWeight: 600, color: "#007AFF",
              background: "none", border: "none", cursor: "pointer",
              opacity: saving ? 0.4 : 1,
            }}
          >
            {saving ? "Saving" : "Done"}
          </button>
        </div>
      </div>

      {/* Photo Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 8px" }}>
        <div style={{ position: "relative" }}>
          {photoPreview ? (
            <Avatar src={photoPreview} initials="" size={100} />
          ) : (
            <div
              style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "rgba(118,118,128,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.3)" strokeWidth="1.4">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
          {uploading && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 24, height: 24, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            style={{
              fontSize: 13, color: "#007AFF", fontWeight: 500,
              background: "rgba(0,122,255,0.08)", border: "none",
              borderRadius: 100, padding: "6px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontSize: 13, color: "#007AFF", fontWeight: 500,
              background: "rgba(0,122,255,0.08)", border: "none",
              borderRadius: 100, padding: "6px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Gallery
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} hidden />
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {error && (
        <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: "rgba(255,59,48,0.08)", borderRadius: 10, fontSize: 14, color: "#FF3B30" }}>
          {error}
        </div>
      )}

      {/* Personal Info */}
      <SectionLabel>Personal Information</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24 }}>
        <FormRow label="First Name" required>
          <input className="ios-field" style={{ textAlign: "right" }} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Required" />
        </FormRow>
        <FormRow label="Last Name" required>
          <input className="ios-field" style={{ textAlign: "right" }} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Required" />
        </FormRow>
        <FormRow label="Gender">
          <div className="ios-segmented" style={{ width: 160 }}>
            <button className={form.gender === "male" ? "active" : ""} onClick={() => set("gender", "male")}>Male</button>
            <button className={form.gender === "female" ? "active" : ""} onClick={() => set("gender", "female")}>Female</button>
          </div>
        </FormRow>
        <FormRow label="Birthday" required>
          <input className="ios-field" type="date" style={{ textAlign: "right", color: "#007AFF", width: "auto" }} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
        </FormRow>
        <FormRow label="Occupation">
          <input className="ios-field" style={{ textAlign: "right" }} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="Optional" />
        </FormRow>
        <FormRow label="Education" last>
          <select
            className="ios-field"
            style={{ textAlign: "right", color: form.educationLevel ? "#000" : "rgba(60,60,67,0.3)", appearance: "none" }}
            value={form.educationLevel}
            onChange={(e) => set("educationLevel", e.target.value)}
          >
            <option value="">Select</option>
            {EDUCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormRow>
      </div>

      {/* Contact */}
      <SectionLabel>Contact</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24 }}>
        <FormRow label="Phone">
          <input className="ios-field" type="tel" style={{ textAlign: "right" }} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
        </FormRow>
        <FormRow label="Email" last>
          <input className="ios-field" type="email" style={{ textAlign: "right" }} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Optional" />
        </FormRow>
      </div>

      {/* Church */}
      <SectionLabel>Church Details</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24 }}>
        <FormRow label="Branch" required>
          <input className="ios-field" style={{ textAlign: "right" }} value={form.branch} onChange={(e) => set("branch", e.target.value)} placeholder="Required" />
        </FormRow>
        <FormRow label="Fellowship">
          <select
            className="ios-field"
            style={{ textAlign: "right", color: form.fellowship ? "#000" : "rgba(60,60,67,0.3)", appearance: "none" }}
            value={form.fellowship}
            onChange={(e) => set("fellowship", e.target.value)}
          >
            <option value="">Select</option>
            {FELLOWSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Registered By" required last>
          <input className="ios-field" style={{ textAlign: "right" }} value={form.registeredBy} onChange={(e) => set("registeredBy", e.target.value)} placeholder="Elder/Pastor" />
        </FormRow>
      </div>

      {/* Interests */}
      <SectionLabel>Interests</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24, padding: "12px 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INTEREST_OPTIONS.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: selected ? "#007AFF" : "rgba(118,118,128,0.12)",
                  color: selected ? "#fff" : "#000",
                }}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matching Preferences */}
      <SectionLabel>Matching Preferences</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24 }}>
        <FormRow label="Min Age">
          <input
            className="ios-field"
            type="number"
            min="18" max="99"
            style={{ textAlign: "right", width: 80 }}
            value={form.minAgePref}
            onChange={(e) => set("minAgePref", e.target.value)}
            placeholder="Any"
          />
        </FormRow>
        <FormRow label="Max Age">
          <input
            className="ios-field"
            type="number"
            min="18" max="99"
            style={{ textAlign: "right", width: 80 }}
            value={form.maxAgePref}
            onChange={(e) => set("maxAgePref", e.target.value)}
            placeholder="Any"
          />
        </FormRow>
        <FormRow label="Branch Pref" last>
          <div className="ios-segmented" style={{ width: 180 }}>
            <button className={form.branchPref === "any" ? "active" : ""} onClick={() => set("branchPref", "any")}>Any Branch</button>
            <button className={form.branchPref === "same" ? "active" : ""} onClick={() => set("branchPref", "same")}>Same Only</button>
          </div>
        </FormRow>
      </div>

      {/* Status */}
      <SectionLabel>Status</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24 }}>
        <div style={{ padding: "8px 16px" }}>
          <div className="ios-segmented" style={{ width: "100%" }}>
            {(["active", "matched", "married", "disabled"] as const).map((s) => (
              <button
                key={s}
                className={form.status === s ? "active" : ""}
                onClick={() => set("status", s)}
                style={{ textTransform: "capitalize" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <SectionLabel>About</SectionLabel>
      <div className="ios-list ios-list-inset" style={{ marginBottom: 24 }}>
        <div style={{ padding: 0 }}>
          <textarea
            className="ios-field"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Brief description (optional)"
            rows={3}
            style={{ resize: "none", padding: "12px 16px", display: "block" }}
          />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "0 32px", marginBottom: 6, fontSize: 13, color: "rgba(60,60,67,0.6)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
      {children}
    </div>
  );
}

function FormRow({
  label,
  children,
  last = false,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
  required?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "7px 16px",
        minHeight: 44,
        borderBottom: last ? "none" : "0.5px solid rgba(60,60,67,0.12)",
      }}
    >
      <span style={{ fontSize: 17, color: "#000", minWidth: 110, flexShrink: 0 }}>
        {label}{required && <span style={{ color: "#FF3B30", marginLeft: 2 }}>*</span>}
      </span>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {children}
      </div>
    </div>
  );
}
