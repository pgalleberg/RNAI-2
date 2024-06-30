import { Button,Card as MuiCard, CardActions, CardContent, CardHeader } from '@mui/material'
import React from 'react'

export const Card = (props) => {
    const {title, href='', children} = props
    return (
        <MuiCard sx={{ width: '100%'}}>
            <CardHeader sx={{ bgcolor: 'active.main', width: '100%', height: 100 }} title={title} />
            <CardContent>
                {children && children}
            </CardContent>
            <CardActions>
                {href && <Button component='a' href={href} size="small">Learn More</Button>}
            </CardActions>
        </MuiCard>
    )
}
