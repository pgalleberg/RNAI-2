import * as React from 'react';
import { useState } from 'react';

import { Avatar, IconButton, Tooltip } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { signOut } from 'firebase/auth';
import { IoIosLogOut } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import auth from '../firebase';
import { FaUser } from 'react-icons/fa';
import { useContext } from 'react';
import { GlobalContext } from '../context/globalContext';


const NavMenu = () => {
    const {setVerticalId} = useContext(GlobalContext)
    const [anchorEl, setAnchorEl] = useState(null);

    const navigate = useNavigate();
    const location = useLocation()

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleLogout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            localStorage.setItem('vertical_id', '')
            setVerticalId('')
            navigate("/login");
            setAnchorEl(null);
        }).catch((error) => {
            // An error happened.
            console.log("Error: ", error)
        });
    }
    return (
        <React.Fragment>
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar sx={{ width: 32, height: 32 }}><FaUser size={14}/></Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <IoIosLogOut />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}

export default NavMenu