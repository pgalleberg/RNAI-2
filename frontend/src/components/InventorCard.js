import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react"
import { faSpinner} from '@fortawesome/free-solid-svg-icons'

const InventorCard = ({ details }) => {
    return (
        details ?
            <div className='author-card' style={{borderRadius: '10px'}}>
                <div className="background" style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}></div>
                <div className="author-details">
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 3fr', marginTop: '10px', marginBottom: '20px', alignItems: 'center'}}>
                        <FontAwesomeIcon icon={faUserCircle} size="4x" style={{color: 'gray'}}></FontAwesomeIcon>       
                        <Link to={`/inventor/${details.name}/${details.vertical_id}`} style={{ textDecoration: 'none' }}>
                            <p style={{ fontSize: '24px', paddingBottom: '0px' }}><strong>{details.name}</strong></p>
                        </Link>
                    </div>
                    <div className="author-stat">
                        <p>Patents</p>
                        <p><strong>{Object.keys(details.organic_results).length}</strong></p>
                    </div>
                    <hr></hr>
                    <p><strong>Vertical Specific</strong></p>
                    <div className="author-stat">
                        <p>Patents</p>
                        <p><strong>{Object.keys(details.source_patents).length}</strong></p>
                    </div>
                </div>
            </div>
            :
            <div className="container">
                <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
            </div>
    )
}
export default InventorCard