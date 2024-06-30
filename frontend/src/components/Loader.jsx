import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack } from '@mui/material'
import React from 'react'

const Loader = () => {
  return (
    <Stack justifyContent={'center'} alignItems={'center'} py={4}>
        <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
    </Stack>
  )
}

export default Loader