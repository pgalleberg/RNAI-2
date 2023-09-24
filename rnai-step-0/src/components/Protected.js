import { useContext } from "react";
import { Context } from "../AuthContext";
import { Navigate } from "react-router-dom";

export function Protected({ children }){
    const { user } = useContext(Context);

    if(!user){
        return <Navigate  to='/login' />
    } else {
        return children
    }
}