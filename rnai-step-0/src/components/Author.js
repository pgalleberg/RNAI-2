import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"

const Author = () => {

    const { author_id, vertical_id } = useParams();
    const [authorDetails, setAuthorDetails] = useState(null)

    useEffect(() => {
        console.log("Author.js::useEffect() trigerred")
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

        console.log("Author.js::author: ", data)
        return data
    }

    return (
        authorDetails && 
        <div className='author-container' >
            <div className='author-card'>
                <div className="background"></div>
                <div className="author-details">
                    <p style={{fontSize: '24px', paddingBottom: '0px'}}><strong>{authorDetails.name}</strong></p>
                    {   
                        authorDetails.aliases &&
                            <p style={{fontSize: '10px', marginBottom: '10px', color: 'gray', fontStyle: 'italic'}}>
                                <strong>{authorDetails.aliases.reduce((a, b) => (a.length > b.length ? a : b))}</strong>
                            </p>
                    }
                    
                    <div className="author-stat">
                        <p>Publications</p>
                        <p><strong>{authorDetails.paperCount}</strong></p>
                    </div>
                    <div className="author-stat">
                        <p>h-index</p>
                        <p><strong>{authorDetails.hIndex}</strong></p>
                    </div>
                    <div className="author-stat">
                        <p>Citations</p>
                        <p><strong>{authorDetails.citationCount}</strong></p>
                    </div>
                    {
                        authorDetails.paper &&
                            <div className="author-stat">
                                <p>Highly Influential Citations</p>
                                <p><strong>{authorDetails.papers.reduce((total, paper) => total + paper.influentialCitationCount, 0)}</strong></p>
                            </div>
                    }
                    <hr></hr>
                    <p><strong>Vertical Specific</strong></p>
                    <div className="author-stat">
                        <p>Publications</p>
                        <p><strong>{Object.keys(authorDetails.source_papers).length}</strong></p>
                    </div>
                    <div className="author-stat">
                        <p>Citations</p>
                        <p><strong>{Object.keys(authorDetails.source_papers).reduce((sum, key) => sum + authorDetails.source_papers[key].citationCount, 0)}</strong></p>
                    </div>
                    <div className="author-stat">
                        <p>Highly Influential Citations</p>
                        <p><strong>{Object.keys(authorDetails.source_papers).reduce((sum, key) => sum + authorDetails.source_papers[key].influentialCitationCount, 0)}</strong></p>
                    </div>
                </div>
            </div>
            
            <div className='author-papers references'>
                <p>Vertical Specific Publications</p>
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
        </div>
    )
}

export default Author
