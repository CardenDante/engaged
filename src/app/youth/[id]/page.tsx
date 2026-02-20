"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
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
}

export default function YouthProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [youth, setYouth] = useState<Youth | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    fetch(`/api/youth/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setYouth(data);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!youth) return;
    const res = await fetch(`/api/youth/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setYouth(updated);
    }
    setShowActions(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!youth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-ios-gray">Youth not found</p>
        <button onClick={() => router.back()} className="text-ios-blue mt-2">
          Go Back
        </button>
      </div>
    );
  }

  const age = calculateAge(new Date(youth.dateOfBirth));

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-ios-bg/80 backdrop-blur-xl">
        <div className="px-4 pt-12 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-ios-blue text-[17px]"
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" className="mr-1">
              <path d="M9 1L1 9L9 17" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-ios-blue text-[17px]"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <Avatar
          src={youth.photoUrl}
          initials={getInitials(youth.firstName, youth.lastName)}
          size={100}
        />
        <h2 className="text-[24px] font-semibold text-ios-label mt-4">
          {youth.firstName} {youth.lastName}
        </h2>
        <p className="text-[15px] text-ios-gray mt-0.5">
          {age} years old
        </p>
        <div className="mt-2">
          <StatusBadge status={youth.status} />
        </div>
      </div>

      {/* Quick Actions */}
      {youth.phone && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl overflow-hidden flex">
            <a
              href={`tel:${youth.phone}`}
              className="flex-1 flex flex-col items-center py-3 border-r border-ios-separator/30"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.8">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-ios-blue text-[11px] font-medium mt-1">Call</span>
            </a>
            {youth.email && (
              <a
                href={`mailto:${youth.email}`}
                className="flex-1 flex flex-col items-center py-3"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-ios-blue text-[11px] font-medium mt-1">Email</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Info Sections */}
      <div className="px-4 mb-4">
        <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
          Information
        </p>
        <div className="bg-white rounded-xl overflow-hidden">
          <InfoRow label="Gender" value={youth.gender === "male" ? "Male" : "Female"} />
          <InfoRow label="Birthday" value={formatDate(new Date(youth.dateOfBirth))} />
          {youth.phone && <InfoRow label="Phone" value={youth.phone} />}
          {youth.email && <InfoRow label="Email" value={youth.email} />}
          {youth.occupation && <InfoRow label="Occupation" value={youth.occupation} />}
          <InfoRow label="Branch" value={youth.branch} last={!youth.bio} />
          {youth.bio && <InfoRow label="About" value={youth.bio} last />}
        </div>
      </div>

      <div className="px-4 mb-4">
        <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
          Registration
        </p>
        <div className="bg-white rounded-xl overflow-hidden">
          <InfoRow label="Registered By" value={youth.registeredBy} />
          <InfoRow label="Date" value={formatDate(new Date(youth.createdAt))} last />
        </div>
      </div>

      {/* Status Actions */}
      <div className="px-4 mb-6">
        <p className="text-[13px] font-medium text-ios-gray uppercase tracking-wide px-4 mb-1.5">
          Actions
        </p>
        <div className="bg-white rounded-xl overflow-hidden">
          {youth.status === "active" && (
            <>
              <button
                onClick={() => updateStatus("married")}
                className="w-full px-4 py-3 text-[15px] text-ios-blue text-left border-b border-ios-separator/30 active:bg-gray-100"
              >
                Mark as Married (Outside System)
              </button>
              <button
                onClick={() => updateStatus("disabled")}
                className="w-full px-4 py-3 text-[15px] text-ios-red text-left active:bg-gray-100"
              >
                Disable Youth
              </button>
            </>
          )}
          {youth.status === "matched" && (
            <>
              <button
                onClick={() => updateStatus("married")}
                className="w-full px-4 py-3 text-[15px] text-ios-blue text-left border-b border-ios-separator/30 active:bg-gray-100"
              >
                Mark as Married
              </button>
              <button
                onClick={() => updateStatus("active")}
                className="w-full px-4 py-3 text-[15px] text-ios-green text-left active:bg-gray-100"
              >
                Reactivate
              </button>
            </>
          )}
          {(youth.status === "married" || youth.status === "disabled") && (
            <button
              onClick={() => updateStatus("active")}
              className="w-full px-4 py-3 text-[15px] text-ios-green text-left active:bg-gray-100"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Action Sheet Overlay */}
      {showActions && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center"
          onClick={() => setShowActions(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl p-4 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <p className="text-[13px] text-ios-gray text-center mb-3">
              Update Status
            </p>
            {["active", "matched", "married", "disabled"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`w-full py-3 text-[17px] text-center border-b border-ios-separator/30 ${
                  youth.status === s
                    ? "text-ios-blue font-semibold"
                    : "text-ios-label"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {youth.status === s && " (Current)"}
              </button>
            ))}
            <button
              onClick={() => setShowActions(false)}
              className="w-full py-3 mt-2 text-[17px] text-ios-red font-semibold text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start px-4 py-3 ${
        !last ? "border-b border-ios-separator/30" : ""
      }`}
    >
      <span className="text-[15px] text-ios-gray w-28 flex-shrink-0">{label}</span>
      <span className="text-[15px] text-ios-label flex-1 text-right">{value}</span>
    </div>
  );
}
