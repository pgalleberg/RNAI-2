import { useParams } from "react-router-dom";
import { useEffect, useState } from "react"
import Paper from "./Paper";

const PaperDetails = () => {
    console.log("PaperDetails rendered")
    const { id } = useParams();
    console.log("PaperDetails::id: ", id)
    const [paperDetails, setPaperDetails] = useState(null)

    useEffect(() => {
        const getPaperDetails = async () => {
            const paperDetails = await fetchPaperDetails()
            setPaperDetails(paperDetails)
        }
        getPaperDetails()
    }, [id]);

    const fetchPaperDetails = async () => {
        const url = process.env.REACT_APP_FLASK_WEBSERVER + 'paper_details?id=' + id
        const res = await fetch(url)
        const data = await res.json()

        return data
    }

    return (
        paperDetails && 
        <div className="papers" style={{width: '75%'}}>
            <Paper paperDetails={paperDetails} index={0}/>
        </div>
    )
}

export default PaperDetails
