import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Card, CardContent, Grid } from "@mui/material";
import AuthorCard from "./AuthorCard";

const Author = () => {

    const { author_id, vertical_id } = useParams();
    const [authorDetails, setAuthorDetails] = useState(null)

    sessionStorage.setItem('currentTab', 'literature');

    useEffect(() => {
        const getAuthorDetails = async () => {
            const authorDetails = await fetchAuthorDetails()
            setAuthorDetails(authorDetails)
        }
        getAuthorDetails()
    }, [author_id]);

    const fetchAuthorDetails = async () => {
        const url = process.env.REACT_APP_FLASK_WEBSERVER + 'author_details?author_id=' + author_id + '&vertical_id=' + vertical_id
        const res = await fetch(url)
        const data = await res.json()
        return data
    }

    return (
        authorDetails ?
            <Box>
                <Grid container spacing={4}>
                    <Grid item xs={3}>
                        <AuthorCard details={authorDetails} />
                    </Grid>
                    <Grid item xs={8}>
                        <Card>
                            <CardContent>
                                <div className='author-papers references'>
                                    <p>Vertical Specific Publications</p>
                                    <p style={{ fontSize: '10px', color: 'gray', marginTop: '0px' }}>
                                        &#42;&nbsp;Internal links (all papers are present in database)
                                    </p>
                                    {Object.keys(authorDetails.source_papers).map((key) => (
                                        <>
                                            <Link to={`/paper/${key}/${vertical_id}`}>&nbsp;&nbsp;•&nbsp;&nbsp;{authorDetails.source_papers[key].title}</Link>
                                            <br></br>
                                        </>
                                    ))}

                                    {
                                        authorDetails.papers && (
                                            <>
                                                <p>All Publications</p>
                                                <p style={{ fontSize: '10px', color: 'gray', marginTop: '0px' }}>
                                                    &#42;&nbsp;External links (all papers are not present in the database)
                                                </p>
                                                {authorDetails.papers.map((paper) => (
                                                    <>
                                                        <Link target="_blank" to={paper.url}>&nbsp;&nbsp;•&nbsp;&nbsp;{paper.title}</Link>
                                                        <br></br>
                                                    </>
                                                ))}
                                            </>
                                        )
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            :
            <div>
                <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
            </div>
    )
}

export default Author
