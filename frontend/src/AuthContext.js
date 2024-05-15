import { useEffect, useState, createContext } from "react";
import auth from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const Context = createContext()

export function AuthContext({ children }){
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe;
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setLoading(false);
            if (currentUser) {
                currentUser.getIdTokenResult().then((idTokenResult) => {
                    if (idTokenResult.claims.approved === true){
                        setUser("Approved")
                    } else {
                        setUser("Created")
                        signOut(auth).then(() => {
                        });
                    }
                })
            }
            else {
                setUser("SignedOut")
            }
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