import {getDecodedSessionOrRedirect } from "@/lib/authServer";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
   await getDecodedSessionOrRedirect();

    return <>{children}</>;

}
