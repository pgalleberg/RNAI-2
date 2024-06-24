import { Box, List as MuiList, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, styled } from '@mui/material'
import React from 'react';

const List = styled
(MuiList)(({ theme }) =>({
    borderRadius:'10px',
    '&& .Mui-selected, && .Mui-selected:hover': {
      backgroundColor: 'red',
      '&, & .MuiListItemIcon-root': {
        color: 'pink',
      },
    },
    // hover states
    '& .MuiListItemButton-root:hover': {
      backgroundColor: theme.palette.hover.main,
      '&, & .MuiListItemIcon-root': {
        color: '#000',
      },
    },
  }));

const DrawerList = ({sidebarRoutes}) => {
  return (
    <>
      <Toolbar sx={{display: { xs: 'block', md: 'none' }}}/>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {sidebarRoutes.map((route, index) => (
            <ListItem key={route.title} disablePadding>
              <ListItemButton>
                <ListItemIcon sx={{minWidth:'30px'}}>
                  <route.icon size={20} />
                </ListItemIcon>
                <ListItemText primary={route.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>    
      </Box>
      </>
  )
}

export default DrawerList