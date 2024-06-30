import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"
import { faSpinner} from '@fortawesome/free-solid-svg-icons'
import { Button, Card, CardActions, CardContent, CardHeader, Divider, Typography } from '@mui/material';


const styles ={
    publicationsStyles : {display:'flex', justifyContent:'space-between', alignItems:'center', mb:2}
}


const InventorCard = ({ details }) => {
    return (
        details ?
            <Card sx={{ width: '100%'}}>
                <CardHeader sx={{bgcolor: 'active.main', width:'100%', height:100 }} title={details.name} />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Details
                    </Typography>
                    <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                        <span>Patents</span>
                        <span>{Object.keys(details.organic_results).length}</span>
                    </Typography>
                   
                    <Divider />

                    <Typography gutterBottom variant="h5" mt={3} component="div">
                        Vertical Specific
                    </Typography>

                    <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                        <span>Patents</span>
                        <span>{Object.keys(details.source_patents).length}</span>
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button component='a' href={`/inventor/${details.name}/${details.vertical_id}`} size="small">Learn More</Button>
                </CardActions>
            </Card>
            :
            <div className="container">
                <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
            </div>
    )
}
export default InventorCard