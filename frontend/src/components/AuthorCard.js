import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"
import { faSpinner} from '@fortawesome/free-solid-svg-icons'
import { Button, Card, CardActions, CardContent, CardHeader, Divider, Typography } from '@mui/material';

const styles ={
    publicationsStyles : {display:'flex', justifyContent:'space-between', alignItems:'center', mb:2}
}

const AuthorCard = ({ details }) => {
  return (
    details ?(
        <Card sx={{ width: '100%', ':hover': {scale:120} }}>
            <CardHeader sx={{bgcolor: 'active.main', width:'100%', height:100 }} title={details.name} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Details
                </Typography>
                <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                    <span>Publications</span>
                    <span>{details.paperCount}</span>
                </Typography>
                <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                    <span>h-index</span>
                    <span>{details.hIndex}</span>
                </Typography>
                <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                    <span>Citations</span>
                    <span>{details.citationCount}</span>
                </Typography>
                {
                    details.papers &&
                        <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                            <span>Highly Influential Citations</span>
                            <span>{details.papers.reduce((total, paper) => total + paper.influentialCitationCount, 0)}</span>
                        </Typography>
                }
                <Divider />

                <Typography gutterBottom variant="h5" mt={3} component="div">
                    Vertical Specific
                </Typography>

                <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                     <span>Publications</span>
                     <span>{Object.keys(details.source_papers).length}</span>
                 </Typography>
                 <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                     <span>Citations</span>
                     <span>{Object.keys(details.source_papers).reduce((sum, key) => sum + details.source_papers[key].citationCount, 0)}</span>
                 </Typography>
                 <Typography sx={styles.publicationsStyles} variant="body2" color="text.secondary">
                     <span>Highly Influential Citations</span>
                     <span>{Object.keys(details.source_papers).reduce((sum, key) => sum + details.source_papers[key].influentialCitationCount, 0)}</span>
                 </Typography>
            </CardContent>
            <CardActions>
                <Button component='a' href={`/author/${details.authorId}/${details.vertical_id}`} size="small">Learn More</Button>
            </CardActions>
        </Card>
    )
    :
    <div className="container">
        <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
    </div>
)}
export default AuthorCard
