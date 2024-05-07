import { createUserWithEmailAndPassword } from "firebase/auth";
import auth from "../firebase";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaTimes } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const SignUpEmail = ({ setEmail_ }) => {
  
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [weakPwd, setWeakPwd] = useState(false)
    const [emailExists, setEmailExists] = useState(false)

    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            // const user = userCredential.user;
            navigate("/approval-pending")
        })
        .catch((error) => {
            setSubmitting(false)
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("User Not Created\n", errorCode, ":", errorMessage)
            if (errorCode === "auth/weak-password"){
                console.log("Weak Password")
                setEmailExists(false)
                setWeakPwd(true)
            }
            else if (errorCode === "auth/email-already-in-use"){
                console.log("Weak Password")
                setEmailExists(true)
                setWeakPwd(false)
            }
        });        
    }

    const forgotPassword = async (e) => {
        e.preventDefault();
        setEmail_(email)
        navigate('/reset-password')
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

                {weakPwd && <p style={{color: 'red', fontSize: '12px', textAlign: 'left'}}>
                    <FaTimes style={{color: 'red', verticalAlign: 'middle'}} />
                    &nbsp;&nbsp;Password should be at least 6 characters
                </p> }

                {emailExists && 
                    <>
                        <p style={{color: 'red', fontSize: '12px', textAlign: 'left'}}>
                            <FaTimes style={{color: 'red', verticalAlign: 'middle'}} />
                            &nbsp;&nbsp;Email already in use. 
                        </p> 
                        <div style={{textAlign: 'left', fontSize: '12px', paddingBottom: '10px'}}>
                            <Link to='#' onClick={forgotPassword}>Forgot Password?</Link>
                        </div>
                    </>
                }

                <div>
                    {
                    submitting ?
                        <FontAwesomeIcon icon={faSpinner} style={{color: 'black'}} spin size="3x"></FontAwesomeIcon>
                        : 
                        <input type="submit" value="Sign Up"/>
                    }
                </div>
            </form>
            
            <p>Already have an account? <Link to="/login"> Log in</Link></p> 
        </div>
  )
}

export default SignUpEmail
