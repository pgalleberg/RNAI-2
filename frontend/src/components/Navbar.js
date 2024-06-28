import {  signOut } from "firebase/auth";
import auth from "../firebase";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
import RNAILogo from '../RNAI_logo_II.png';
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons'
import { Box, IconButton } from "@mui/material";

const Navbar = ({closeSidebar}) => {

    const navigate = useNavigate();
    const location = useLocation()

    const handleLogout = () => {               
        signOut(auth).then(() => {
        // Sign-out successful.
            navigate("/login");
        }).catch((error) => {
            // An error happened.
            console.log("Error: ", error)
        });
    }

    const goBack = () => {
        navigate(-1);
      };
    

    return (
        <>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', width:{xs:'95%',lg:'80%'}, alignSelf:'center', height:'4rem'}}>
                <Box sx={{display:'flex', alignItems:'center',gap:1}}>
                    <IconButton 
                        sx={{ display: { xs: 'block', md: 'none' } }}
                        onClick={() => closeSidebar()}
                    >
                        <FontAwesomeIcon color="black" icon={faBars}/>
                    </IconButton>
                    <Link to="/">
                        <img src={ RNAILogo } alt='RNAI logo' style={{height: '30px'}}/>
                    </Link>
                </Box>
            
                <Box sx={{display:'flex', alignItems:'center', gap:5}}>
                    <Link to="/">Home</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="#" onClick={ handleLogout }>Sign Out</Link>
                </Box>
            </Box>
            
            {/* {
                (location.pathname.includes('/inventor') || location.pathname.includes('/patent') || location.pathname.includes('/grant') || location.pathname.includes('/paper/') || location.pathname.includes('/author/')) && 
                <div style={{textAlign: 'left', width: location.pathname.includes('/paper/') ? '75%' : '90%'}}>
                    <Link onClick={goBack}>
                        <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                        &nbsp;&nbsp;
                        Back
                    </Link>
                </div>
            } */}
        </>
    )
}

export default Navbar
