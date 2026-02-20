"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";

export default function AddYouthPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotoUrl(data.url);
      } else {
        setError("Photo upload failed. You can still save without a photo.");
      }
    } catch {
      setError("Photo upload failed. You can still save without a photo.");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.branch || !form.registeredBy) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/youth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch {
      setError("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-ios-bg/80 backdrop-blur-xl">
        <div className="px-4 pt-12 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-ios-blue text-[17px]"
          >
            Cancel
          </button>
          <h1 className="text-[17px] font-semibold text-ios-label">
            New Youth
          </h1>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-ios-blue text-[17px] font-semibold disabled:opacity-40"
          >
            {saving ? "Saving..." : "Done"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4">
        {/* Photo upload */}
        <div className="flex flex-col items-center py-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative"
          >
            {photoPreview ? (
              <Avatar src={photoPreview} initials="" size={100} />
            ) : (
              <div className="w-[100px] h-[100px] rounded-full bg-gray-200 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-ios-blue text-[13px] font-medium mt-2"
          >
            {photoPreview ? "Change Photo" : "Add Photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-ios-red">
            {error}
          </div>
        )}

        {/* Personal Info Section */}
        <div className="mb-6">
          <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
            Personal Information
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-ios-separator/30">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Required"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
            <div className="flex items-center px-4 py-3 border-b border-ios-separator/30">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Required"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
            <div className="flex items-center px-4 py-3 border-b border-ios-separator/30">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Gender</label>
              <div className="flex-1 flex justify-end">
                <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => update("gender", "male")}
                    className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      form.gender === "male"
                        ? "bg-white text-ios-blue shadow-sm"
                        : "text-ios-gray"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => update("gender", "female")}
                    className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      form.gender === "female"
                        ? "bg-white text-ios-blue shadow-sm"
                        : "text-ios-gray"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center px-4 py-3 border-b border-ios-separator/30">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Birthday</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="flex-1 text-[15px] text-ios-blue outline-none text-right"
              />
            </div>
            <div className="flex items-center px-4 py-3">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                placeholder="Optional"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-6">
          <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
            Contact
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-ios-separator/30">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Optional"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
            <div className="flex items-center px-4 py-3">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Optional"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
          </div>
        </div>

        {/* Church Section */}
        <div className="mb-6">
          <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
            Church
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-ios-separator/30">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Branch</label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
                placeholder="Required"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
            <div className="flex items-center px-4 py-3">
              <label className="text-[15px] text-ios-label w-28 flex-shrink-0">Registered By</label>
              <input
                type="text"
                value={form.registeredBy}
                onChange={(e) => update("registeredBy", e.target.value)}
                placeholder="Elder/Pastor name"
                className="flex-1 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none text-right"
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
            About
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Brief description (optional)"
              rows={3}
              className="w-full px-4 py-3 text-[15px] text-ios-label placeholder-ios-gray/60 outline-none resize-none"
            />
          </div>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
