import { UserProvider } from "@/context/UserContext";
import {getDecodedSessionOrRedirect } from "@/lib/authServer";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
   const decoded = await getDecodedSessionOrRedirect();

    return (
    <UserProvider value={{ uid: decoded.uid, email: decoded.email, name: decoded.name }}>
    {children}
    </UserProvider>
    
    )
}
