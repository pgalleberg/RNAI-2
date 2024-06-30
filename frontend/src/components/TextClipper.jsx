import { Typography } from '@mui/material'
import React from 'react'

export const TextClipper = ({ children, lineClamp = 1 }) => {
    return (
        <Typography
            sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: lineClamp,
                WebkitBoxOrient: 'vertical',
                mt: 3
            }}
        >
            {children}
        </Typography>
    )
}
