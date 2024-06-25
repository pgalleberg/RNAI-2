import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';

import Navbar from '../../components/Navbar';

import styled from '@emotion/styled';
import * as React from 'react';
import { sidebarRoutes } from '../../routes/sidebarRoutes';
import DrawerList from './DrawerList';



const drawerWidth = 240;

const Main = styled(Box)`
  min-width: 80vw;
  display:flex;
  position:relative;
  margin: 0 auto;
  padding-top: 5rem;
  @media (max-width: 1440px) {
     width:95%
  }
`

export default function DashboardLayout({children}) {
  // const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor:'white' }}>
        <Navbar closeSidebar={handleDrawerToggle}/>
      </AppBar>
      <Main>
          <Drawer
              variant="temporary"
              open={mobileOpen}
              onTransitionEnd={handleDrawerTransitionEnd}
              onClose={handleDrawerClose}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                marginTop:'20px',
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              <DrawerList/>
            </Drawer>
        <Box
          sx={{
            position:'sticky',
            top:'5rem',
            display: { xs: 'none', md: 'block' },
            width:'20%',
            height:'80vh',
          }}
          open
        >
          <DrawerList />
        </Box>
        <Box 
          sx={{ flexGrow: 1, p: 3, overflowX:'hidden', minWidth: { xs:'100%', md: '75%'} }}
        >
          {children}
        </Box>
      </Main>
    </Box>
  );
}
