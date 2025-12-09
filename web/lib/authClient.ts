"use client";

import { auth } from "./firebaseClient";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    getIdToken,  
    GoogleAuthProvider,
    signInWithPopup
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
  const provider = new GoogleAuthProvider();
  try{
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    return {
      email: user.email,
      uid: user.uid,
      token,
    };
  }catch (error) {
    console.error("Google popup login failed:", error);
    throw error;
  }
 
};

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
