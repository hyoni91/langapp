import { auth, googleProvider } from "./firebaseClient";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    getIdToken  
} from "firebase/auth";


export const signUpWithEmail = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await getIdToken(userCredential.user);
    return { 
        email: userCredential.user.email, 
        uid: userCredential.user.uid, 
        token 
    };
}

export const signInWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdToken(userCredential.user);
    return { 
        email: userCredential.user.email, 
        uid: userCredential.user.uid, 
        token 
    };
}


export const signUpWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const token = await getIdToken(userCredential.user);
    return {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        token
    };
}


export const signOutUser = async () => {
    await signOut(auth);
}

export const getUserToken = async () => {
    const user = auth.currentUser;
    if (user) {
        const token = await getIdToken(user, true);
        return token;
    }
    return null;
}
