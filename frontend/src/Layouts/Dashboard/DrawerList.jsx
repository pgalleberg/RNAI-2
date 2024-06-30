import { Box, List as MuiList, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, styled } from '@mui/material'
import React, { useContext } from 'react';
import { sidebarRoutes } from '../../routes/sidebarRoutes';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { GlobalContext } from '../../context/globalContext';

const List = styled
(MuiList)(({ theme }) =>({
  '&& .Mui-selected, && .Mui-selected:hover': {
      backgroundColor: 'red',
      '&, & .MuiListItemIcon-root': {
        color: 'pink',
      },
    },
    // hover states
    '& .MuiListItemButton-root:hover': {
      backgroundColor: theme.palette.hover.main,
      borderRadius:10,
      '&, & .MuiListItemIcon-root': {
        color: '#000',
      },
      '&:disabled':{
        cursor: 'not-allowed'
      }
    },
  }));

const Link = styled
(RouterLink)(({ theme, isActive }) => ({
    width:'100%',
    borderRadius:10,
    background: isActive ? theme.palette.active.main : 'transparent',
  }));

const DrawerList = () => {
  const {verticalId} = useContext(GlobalContext)
  const loc = useLocation()
  return (
    <>
      <Toolbar sx={{display: { xs: 'block', md: 'none' }}}/>
      <Box sx={{ overflow: 'auto', zIndex:10 }}>
        <List>
          {sidebarRoutes.map((route, index) => (
            <ListItem key={route.title} disablePadding>
              <Link isActive={loc.pathname.includes(route.href)} to={!!verticalId ? route.href + `/${verticalId}`: ''}>
                <ListItemButton disabled={!!!verticalId}>
                  <ListItemIcon sx={{minWidth:'30px'}}>
                    <route.icon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={route.title} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>    
      </Box>
      </>
  )
}

export default DrawerList