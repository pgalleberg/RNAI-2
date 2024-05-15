import {signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import googleIcon from '../google.svg';  // Make sure the path is correct
import auth from "../firebase";

const SignUpGoogle = () => {
    const provider = new GoogleAuthProvider();

    const onClick = () => {
        signInWithPopup(auth, provider)
        // .then((result) => {
        //     // This gives you a Google Access Token. You can use it to access the Google API.
        //     const credential = GoogleAuthProvider.credentialFromResult(result);
        //     const token = credential.accessToken;
        //     // The signed-in user info.
        //     const user = result.user;
        //     // IdP data available using getAdditionalUserInfo(result)
        //     navigate('/')
        // }).catch((error) => {
        //     // Handle Errors here.
        //     const errorCode = error.code;
        //     const errorMessage = error.message;
        //     // The email of the user's account used.
        //     const email = error.customData.email;
        //     // The AuthCredential type that was used.
        //     const credential = GoogleAuthProvider.credentialFromError(error);
        // });
    }
  
    return (
        <div>
            <button className='loginButton'  onClick={ onClick }>
                <img src={googleIcon} alt="icon" width="35" height="35" />
                <span style={{paddingLeft: '20px', verticalAlign: 'middle'}}>Continue with Google</span>
            </button>
        </div>
    )
}

export default SignUpGoogle