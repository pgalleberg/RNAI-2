import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"
import { faSpinner} from '@fortawesome/free-solid-svg-icons'

const AuthorCard = ({ details }) => {
  return (
    details ?
        <div className='author-card' style={{borderRadius: '10px'}}>
            <div className="background" style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}></div>
            <div className="author-details">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 3fr', marginTop: '10px', marginBottom: '20px', alignItems: 'center'}}>
                  <FontAwesomeIcon icon={faUserCircle} size="4x" style={{color: 'gray'}}></FontAwesomeIcon>      
                  <div>          
                    <Link to={`/author/${details.authorId}/${details.vertical_id}`} style={{ textDecoration: 'none' }}>
                        <p style={{fontSize: '24px', paddingBottom: '0px'}}><strong>{details.name}</strong></p>
                    </Link>
                    {   
                        details.aliases &&
                            <p style={{fontSize: '10px', marginBottom: '10px', color: 'gray', fontStyle: 'italic'}}>
                                <strong>{details.aliases.reduce((a, b) => (a.length > b.length ? a : b))}</strong>
                            </p>
                    }
                  </div>
                </div>
                
                <div className="author-stat">
                    <p>Publications</p>
                    <p><strong>{details.paperCount}</strong></p>
                </div>
                <div className="author-stat">
                    <p>h-index</p>
                    <p><strong>{details.hIndex}</strong></p>
                </div>
                <div className="author-stat">
                    <p>Citations</p>
                    <p><strong>{details.citationCount}</strong></p>
                </div>
                {
                    details.papers &&
                        <div className="author-stat">
                            <p>Highly Influential Citations</p>
                            <p><strong>{details.papers.reduce((total, paper) => total + paper.influentialCitationCount, 0)}</strong></p>
                        </div>
                }
                <hr></hr>
                <p><strong>Vertical Specific</strong></p>
                <div className="author-stat">
                    <p>Publications</p>
                    <p><strong>{Object.keys(details.source_papers).length}</strong></p>
                </div>
                <div className="author-stat">
                    <p>Citations</p>
                    <p><strong>{Object.keys(details.source_papers).reduce((sum, key) => sum + details.source_papers[key].citationCount, 0)}</strong></p>
                </div>
                <div className="author-stat">
                    <p>Highly Influential Citations</p>
                    <p><strong>{Object.keys(details.source_papers).reduce((sum, key) => sum + details.source_papers[key].influentialCitationCount, 0)}</strong></p>
                </div>
            </div>
        </div>
    :
    <div className="container">
        <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
    </div>
)}
export default AuthorCard
