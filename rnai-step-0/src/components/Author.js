import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"

const Author = () => {

    const { id } = useParams();
    const [authorDetails, setAuthorDetails] = useState(null)

    useEffect(() => {
        const getAuthorDetails = async () => {
            const authorDetails = await fetchAuthorDetails()
            setAuthorDetails(authorDetails)
        }
        getAuthorDetails()
    }, []);

    const fetchAuthorDetails = async () => {
        const url = process.env.REACT_APP_FLASK_WEBSERVER + 'author_details?id=' + id
        const res = await fetch(url)
        const data = await res.json()

        return data
    }

    return (
        authorDetails && 
        <div className="authorDetails" style={{border: '1px solid black', width: '75%'}}>
            <h3>{authorDetails.name}</h3>
            <p>Aliases: {authorDetails.aliases}</p>
            <p>Paper Count: {authorDetails.paperCount}</p>
            <p>Citation Count: {authorDetails.citationCount}</p>
            <p>hIndex: {authorDetails.hIndex}</p>
            <p>url: {authorDetails.url}</p>
            
            {authorDetails.papers.map((paper) => (
                <>
                <Link to={`/author/${paper.paperId}`}><p className=''>{paper.title}</p></Link>
                <span>&nbsp;&nbsp;</span>
                </>
            ))}

        </div>
    )
}

export default Author
