"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/session", {
      method: "DELETE",
    });

    router.push("/login");
  };

  return (
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 transition"
      >
        로그아웃
      </button>
  );
}
