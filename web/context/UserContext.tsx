"use client";

import { UserContextType } from "@/types/auth";
import { createContext, ReactNode, useContext } from "react";


const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ value, children }: { value: UserContextType; children: ReactNode }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
export function useUser(){
    const ctx = useContext(UserContext);
    if(!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
}