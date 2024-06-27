import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "../firebase";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaTimes } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons'

const LogIn = ({ setEmail_ }) => {

  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  let emailId = searchParams.get('emailId')
  let userStatus = searchParams.get('status')

  const [email, setEmail] = useState(emailId)
  const [password, setPassword] = useState('')

  const [correctEmail, setCorrectEmail] = useState('true')
  const [correctPwd, setCorrectPwd] = useState('true')

  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    // const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      const idToken = await user.getIdToken(true)
      localStorage.setItem('firebaseToken', idToken);
      navigate("/")
    })
    .catch((error) => {
      setSubmitting(false)

      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("User Not Created\n", errorCode, ":", errorMessage)

      if (errorCode === "auth/user-not-found"){
        console.log("User Not Found")
        setCorrectEmail(false)
        setCorrectPwd(true)
      } else if (errorCode === "auth/wrong-password"){
        console.log("Wrong Password")
        setCorrectPwd(false)
        setCorrectEmail(true)
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
      <form onSubmit={ onSubmit }  autoComplete="on">
          <div>
              <input type="email" placeholder="Email" 
              required style={{width: '285px', border: !correctEmail && '1px solid red'}} 
              value={email} onChange={(e) => setEmail(e.target.value)}/>
          </div>

          <div>
              <input type="password" placeholder="Password"
              required style={{width: '285px', marginBottom: '0px', border: !correctPwd && '1px solid red'}} 
              value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>

          {!correctEmail && <p style={{color: 'red', fontSize: '12px', textAlign: 'left'}}>
            <FaTimes style={{color: 'red', verticalAlign: 'middle'}} />
            &nbsp;&nbsp;User not found
          </p> }

          {!correctPwd && <p style={{color: 'red', fontSize: '12px', textAlign: 'left'}}>
            <FaTimes style={{color: 'red', verticalAlign: 'middle'}} />
            &nbsp;&nbsp;Wrong password
          </p> }

          {correctEmail && correctPwd && userStatus === "created" && <p style={{color: 'red', fontSize: '12px', textAlign: 'left'}}>
            {/* <faTriangleExclamation style={{color: 'red', verticalAlign: 'middle'}} /> */}
            <FontAwesomeIcon icon={faTriangleExclamation} color="red"/>
            &nbsp;&nbsp;Contact administrator for access. 
          </p> }

          <div style={{textAlign: 'left', fontSize: '12px', paddingBottom: '10px'}}>
            <Link to='#' onClick={forgotPassword}>Forgot Password?</Link>
          </div>

          <div>
            {
              submitting ?
                <FontAwesomeIcon icon={faSpinner} style={{color: 'black'}} spin size="3x"></FontAwesomeIcon>
                : 
                <input type="submit" value="Log In"/>
            }
          </div>

      </form>
      
      <p>Don't have an account? <Link to="/signup"> Sign Up</Link></p> 
    </div>
  )
}

export default LogIn
