import { useNavigate } from "react-router-dom";
import auth from "./firebase";
import { useEffect } from "react";

  
const ProtectedRoute = ({components}) => {

    const navigate = useNavigate()
    const verifyUser = () => {
        const user = auth.currentUser;
        console.log("verifyUser: ", user)
        return user
    }

    let user = verifyUser()

    console.log("verifyUser has ran")

    useEffect(() => {
        if (user === null){
            navigate('/login')
        }
    })


  return (
    user !== null && 
    <>
       {components}
    </> 
  )
}

export default ProtectedRoute
