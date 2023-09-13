import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from 'react-icons/fa'

const LogIn = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [correctEmail, setCorrectEmail] = useState('true')
  const [correctPwd, setCorrectPwd] = useState('true')

  const navigate = useNavigate()

  const onSubmit = async (e) => {

    e.preventDefault()
    console.log("auth: ", auth)
    console.log("email: ", email)
    console.log("password: ", password)

    // const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
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
      console.log("User Not Created\n", errorCode, ":", errorMessage)

      if (errorCode === "auth/user-not-found"){
        console.log("User Not Found")
        setCorrectEmail(false)
      } else if (errorCode === "auth/wrong-password"){
        console.log("Wrong Password")
        setCorrectPwd(false)
        setCorrectEmail(true)
      }

    });

    // setCorrectEmail(true)
    // setCorrectPwd(true)
    console.log("Finally here")  
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
            &nbsp;&nbsp;Wrong email
          </p> }

          {!correctPwd && <p style={{color: 'red', fontSize: '12px', textAlign: 'left'}}>
            <FaTimes style={{color: 'red', verticalAlign: 'middle'}} />
            &nbsp;&nbsp;Wrong password
          </p> }

          <div style={{textAlign: 'left', fontSize: '12px', paddingBottom: '10px'}}>
            <a href='#'>Forgot Password?</a>
          </div>

          <div>
              <input type="submit" value="Log In"/>
          </div>
      </form>
      
      <p>Don't have an account? <a href="/signup"> Sign Up</a></p> 
    </div>
  )
}

export default LogIn
