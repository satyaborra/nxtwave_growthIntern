"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentDTO } from "@/lib/types";

/**
 * Client session store. The "current student" is the registration created in
 * this browser — it powers the success screen and the My Growth profile.
 */
interface GrowthStore {
  currentStudent: StudentDTO | null;
  followedCode: string | null; // growth profile currently being viewed
  setCurrentStudent: (s: StudentDTO | null) => void;
  setFollowedCode: (code: string | null) => void;
  clear: () => void;
}

export const useGrowthStore = create<GrowthStore>()(
  persist(
    (set) => ({
      currentStudent: null,
      followedCode: null,
      setCurrentStudent: (s) => set({ currentStudent: s }),
      setFollowedCode: (code) => set({ followedCode: code }),
      clear: () => set({ currentStudent: null, followedCode: null }),
    }),
    { name: "nxtwave-growth-engine-session" }
  )
);
