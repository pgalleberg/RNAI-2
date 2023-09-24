import { useEffect, useState, createContext } from "react";
import auth from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const Context = createContext()

export function AuthContext({ children }){
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe;
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("setting loading to false")
            setLoading(false);
            if (currentUser) setUser(true)
            else setUser(null)
        });

        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, [])

    const values = {
        user: user,
        setUser: setUser
    }

    return (
        <Context.Provider value={values}>
            {!loading && children}
        </Context.Provider>
    )
}