"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import { calculateAge, getInitials } from "@/lib/utils";

interface Youth {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  branch: string;
  phone?: string;
  photoUrl?: string;
  status: string;
}

export default function HomePage() {
  const [youth, setYouth] = useState<Youth[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "male" | "female">("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);

  const fetchYouth = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("gender", filter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    const res = await fetch(`/api/youth?${params}`);
    const data = await res.json();
    setYouth(data);
    setLoading(false);
  }, [search, filter, statusFilter]);

  useEffect(() => {
    fetchYouth();
  }, [fetchYouth]);

  // Group by first letter of last name
  const grouped = youth.reduce<Record<string, Youth[]>>((acc, y) => {
    const letter = y.lastName.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(y);
    return acc;
  }, {});

  const sortedLetters = Object.keys(grouped).sort();

  return (
    <div className="pb-20">
      {/* iOS-style header */}
      <div className="sticky top-0 z-40 bg-ios-bg/80 backdrop-blur-xl">
        <div className="px-4 pt-12 pb-1">
          <h1 className="text-[34px] font-bold text-ios-label tracking-tight">
            Youth
          </h1>
          <p className="text-[13px] text-ios-gray mt-0.5">
            {youth.length} enrolled member{youth.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-200/60 rounded-xl pl-9 pr-4 py-2 text-[15px] text-ios-label placeholder-ios-gray outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                filter === g
                  ? "bg-ios-blue text-white"
                  : "bg-gray-200/60 text-ios-secondary"
              }`}
            >
              {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
            </button>
          ))}
          <div className="w-px h-6 bg-ios-separator self-center mx-1" />
          {(["active", "all", "matched", "disabled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-ios-blue text-white"
                  : "bg-gray-200/60 text-ios-secondary"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Youth list - iOS contact list style */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : youth.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-ios-gray text-[15px]">No youth enrolled yet</p>
          <Link
            href="/add"
            className="mt-4 text-ios-blue text-[15px] font-medium"
          >
            Enroll First Youth
          </Link>
        </div>
      ) : (
        <div>
          {sortedLetters.map((letter) => (
            <div key={letter}>
              {/* Section header */}
              <div className="px-4 py-1 bg-ios-bg sticky top-[185px] z-30">
                <span className="text-[13px] font-semibold text-ios-secondary">
                  {letter}
                </span>
              </div>

              {/* Contact rows */}
              <div className="bg-white">
                {grouped[letter].map((person, idx) => (
                  <Link
                    key={person.id}
                    href={`/youth/${person.id}`}
                    className="flex items-center px-4 py-2.5 active:bg-gray-100 transition-colors"
                  >
                    <Avatar
                      src={person.photoUrl}
                      initials={getInitials(person.firstName, person.lastName)}
                      size={44}
                    />
                    <div
                      className={`flex-1 ml-3 py-1 ${
                        idx < grouped[letter].length - 1
                          ? "border-b border-ios-separator/40"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[16px] font-normal text-ios-label">
                            {person.firstName} {person.lastName}
                          </p>
                          <p className="text-[13px] text-ios-gray mt-0.5">
                            {calculateAge(new Date(person.dateOfBirth))} yrs &middot;{" "}
                            {person.branch}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {person.status !== "active" && (
                            <StatusBadge status={person.status} />
                          )}
                          <svg
                            width="8"
                            height="13"
                            viewBox="0 0 8 13"
                            fill="none"
                            className="text-ios-separator"
                          >
                            <path
                              d="M1.5 1.5L6.5 6.5L1.5 11.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
