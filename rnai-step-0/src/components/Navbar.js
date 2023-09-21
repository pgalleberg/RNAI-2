import {  signOut } from "firebase/auth";
import auth from "../firebase";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
import RNAILogo from '../RNAI_logo_II.png';
import { useLocation } from 'react-router-dom'


const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation()

    const handleLogout = () => {               
        signOut(auth).then(() => {
        // Sign-out successful.
            navigate("/login");
            console.log("Signed out successfully")
        }).catch((error) => {
            // An error happened.
            console.log("Error: ", error)
        });
    }

    return (
        <div className="navbar" style={{paddingBottom: location.pathname === '/' && '0px', marginTop: location.pathname === '/' && '0px'}}>
            {   location.pathname === '/' ? <div></div> :
                <Link to="/">
                    <img src={ RNAILogo } alt='RNAI logo' style={{height: '100px'}}/>
                </Link>
            }
            <div>
                <Link to="/">Home</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="#" onClick={ handleLogout }>Sign Out</Link>
            </div>
        </div>
    )
}

export default Navbar
