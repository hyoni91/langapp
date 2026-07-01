
import LogoutButton from "@/components/logout/LogoutButton";
import { UserProvider } from "@/context/UserContext";
import {getDecodedSessionOrRedirect } from "@/lib/authServer";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }){
   const decoded = await getDecodedSessionOrRedirect();


    return (
        <UserProvider value={{ uid: decoded.uid, email: decoded.email, name: decoded.name }}>
        <div className="min-h-screen">
            <header className="bg-gray-800 text-white p-2 flex justify-end">
            <LogoutButton />
            </header>

            <main>
            {children}
            </main>
        </div>
        </UserProvider>
    
    )
}
