import React from 'react'
import Tasks from '../../components/Tasks'
import { Box, Button, Typography } from '@mui/material'

const Index = () => {
  return (
    <div>
        <Typography variant='h2' fontWeight={'bold'}>Research Net AI</Typography>
        <Box display={'flex'} my={5} alignItems={'center'} gap={2}>
          <Button variant='outlined'>Try RNAI</Button>
          <Button variant='contained'>My Requests</Button>
        </Box>
        <Tasks />
    </div>
  )
}

export default Index