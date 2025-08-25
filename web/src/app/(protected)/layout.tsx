import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebaseAdmin";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/login");

  try {
    await adminAuth.verifySessionCookie(session, true); // revoke 체크
    return <>{children}</>;
  } catch {
    redirect("/login");
  }
}
