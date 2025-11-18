

//firebase
export interface RegisterForm  {
  email: string;
  password: string;
  name: string;
};


export interface User{
    firebaseUid: string; 
    email: string;
    name: string;
}


//UserContext
export type UserContextType = {
  uid: string;
  email?: string;
  name?: string;
};