import { createUserWithEmailAndPassword } from "firebase/auth";
import auth from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpEmail = () => {
  
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()

    const onSubmit = async (e) => {

        e.preventDefault()
        console.log("auth: ", auth)
        console.log("email: ", email)
        console.log("password: ", password)

        // const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
            console.log("User Created: ", user)
            navigate("/")
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
            console.log("User Not Created\n", errorCode, ":", errorMessage)
        });

        console.log("Finally here")
        
    }

    return (
        <div>
            <form onSubmit={ onSubmit }>
                <div>
                    <input type="email" placeholder="Email" 
                    required style={{width: '285px'}} 
                    value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div>
                    <input type="password" placeholder="Password" 
                    required style={{width: '285px'}} 
                    value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <div>
                    <input type="submit" value="Sign Up"/>
                </div>
            </form>
            
            <p>Already have an account? <a href="/login"> Log in</a></p> 
        </div>
  )
}

export default SignUpEmail
