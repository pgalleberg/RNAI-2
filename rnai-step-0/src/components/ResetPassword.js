import { useEffect, useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth";
import auth from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaRegEnvelopeOpen } from 'react-icons/fa'


const ResetPassword = ({ email }) => {

    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        console.log('email: ', email)

        var actionCodeSettings = {
            url: process.env.REACT_APP_URL + 'login?emailId=' + email, 
            handleCodeInApp: false
          };

        if (email !== undefined && email !== ""){
            sendPasswordResetEmail(auth, email, actionCodeSettings)
            .then(() => {
            console.log("Sending email")
            // Password reset email sent!
            // ..
            })
            .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
            console.log("error: ", error)
            });
        }  

        else {
            navigate('/reset-password')
        }
    }, [refresh])

    const resendEmail = () => {
        setRefresh(!refresh)
    }

  return (
    
    <div style={{width: '320px'}}>
        <FaRegEnvelopeOpen style={{color: '#10a37f', fontSize: '60px'}} />

        <p style={{fontSize: '28px'}}>Check Your Email</p>
        <p style={{fontSize: '14px', lineHeight: '20px'}}>Please check the email address {email} for instructions to reset your password.</p>
        <button onClick={resendEmail} className='resendEmail'>
            <span style={{fontWeight: 'lighter'}}>Resend Email</span>
        </button>

    </div>
  )
}

export default ResetPassword
