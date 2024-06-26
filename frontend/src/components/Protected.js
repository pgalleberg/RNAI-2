import { useContext } from "react";
import { Context } from "../AuthContext";
import { Navigate } from "react-router-dom";

export function Protected({ children }){
    const { user } = useContext(Context);
    if (user === "Approved"){
        return children
    }
    else if (user === "Created"){
        return <Navigate  to='/login?status=created' />
    }
    else {
        return <Navigate  to='/login' />
    } 
}