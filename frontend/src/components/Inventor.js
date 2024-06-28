import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import InventorCard from "./InventorCard";
import { Box, Card, CardContent, Grid } from "@mui/material";

const Inventor = () => {
    const { inventor_name, vertical_id } = useParams();
    const [inventorDetails, setInventorDetails] = useState(null)

    sessionStorage.setItem('currentTab', 'patents');

    useEffect(() => {
        const getInventorDetails = async () => {
            const inventorDetails = await fetchInventorDetails()
            setInventorDetails(inventorDetails)
        }
        getInventorDetails()
    }, [inventor_name]);

    const fetchInventorDetails = async () => {
        const url = process.env.REACT_APP_FLASK_WEBSERVER + 'inventor_details?inventor_name=' + inventor_name + '&vertical_id=' + vertical_id
        const res = await fetch(url)
        const data = await res.json()
        return data
    }

    return (
        inventorDetails ?
            <Box>
                <Grid container spacing={4}>
                    <Grid item xs={3}>
                        <InventorCard details={inventorDetails} />
                    </Grid>
                    <Grid item xs={8}>
                        <Card>
                            <CardContent>
                                <div className='author-papers references'>
                                    <p>Vertical Specific Patents</p>
                                    <p style={{ fontSize: '10px', color: 'gray', marginTop: '0px' }}>
                                        &#42;&nbsp;Internal links (all patents are present in database)
                                    </p>
                                    {Object.keys(inventorDetails.source_patents).map((key) => (
                                        <>
                                            <Link to={`/${key}/${vertical_id}`}>&nbsp;&nbsp;•&nbsp;&nbsp;{inventorDetails.source_patents[key].title}</Link>
                                            <br></br>
                                        </>
                                    ))}

                                    {
                                        inventorDetails.organic_results && (
                                            <>
                                                <p>All Patents</p>
                                                <p style={{ fontSize: '10px', color: 'gray', marginTop: '0px' }}>
                                                    &#42;&nbsp;External links (all patents are not present in the database)
                                                </p>
                                                {inventorDetails.organic_results.map((patent) => (
                                                    <>
                                                        <Link target="_blank" to={patent.pdf}>&nbsp;&nbsp;•&nbsp;&nbsp;{patent.title}</Link>
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
            </Box >
            :
            <div className="container">
                <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
            </div>
    )
}
export default Inventor