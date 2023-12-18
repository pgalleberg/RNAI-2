import { useParams } from "react-router-dom";
import { useEffect, useState } from "react"
import Paper from "./Paper";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const PaperDetails = () => {
    console.log("PaperDetails rendered")
    const { paper_id, vertical_id } = useParams();
    console.log("PaperDetails::paper_id: ", paper_id)
    console.log("PaperDetails::vertical_id: ", vertical_id)
    const [paperDetails, setPaperDetails] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getPaperDetails = async () => {
            const paperDetails = await fetchPaperDetails()
            setPaperDetails(paperDetails)
            setLoading(false)
        }
        getPaperDetails()
    }, [paper_id]);

    const fetchPaperDetails = async () => {
        const url = process.env.REACT_APP_FLASK_WEBSERVER + 'paper_details?paper_id=' + paper_id + '&vertical_id=' + vertical_id
        const res = await fetch(url)
        const data = await res.json()

        return data
    }

    return (
        paperDetails ?
        <div className="papers" style={{width: '75%'}}>
            <Paper paperDetails={paperDetails} index={0}/>
        </div>
        :
        <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
    )
}

export default PaperDetails
