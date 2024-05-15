import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUnlock } from '@fortawesome/free-solid-svg-icons'

const Patent = ({ patentDetails, index }) => {
  return (
    <div style={{backgroundColor: 'whitesmoke', padding: '10px 10px', paddingRight: '20px', marginBottom: '10px', borderRadius: '10px'}}>
        <Link to={`/${patentDetails.patent_id}/${patentDetails.vertical_id}`}><h2>{patentDetails.title}</h2></Link>

        {patentDetails.assignees && <strong>{patentDetails.assignees[0]}</strong>}
        <strong>&nbsp; &#x2022; &nbsp;{patentDetails.application_number}</strong>

        <div>
            {patentDetails.inventors.map((inventor) => (
                <>
                    <Link to={`/inventor/${inventor.name}/${patentDetails.vertical_id}`}><span className='author'>{inventor.name}</span></Link>
                    <span>&nbsp;&nbsp;</span>
                </>
            ))}
        </div>

        <div>
          {patentDetails.priority_date && <span className="detail">Priority {patentDetails.priority_date}</span>}
          {patentDetails.filing_date && <span className="detail">Filed {patentDetails.filing_date}</span>}
          {patentDetails.grant_date && <span className="detail">Granted {patentDetails.grant_date}</span>}
          {patentDetails.publication_date && <span className="detail">Published {patentDetails.publication_date}</span>}
        </div>

        {patentDetails.abstract &&
          <>
              <span className="text">Abstract</span>
              <p style={{margin: 0, textAlign: 'justify'}}>{patentDetails.abstract}</p>
              <br></br>
          </>
        }

        {patentDetails.pdf &&
          <div className='pdf'>
            <br></br>
            <FontAwesomeIcon icon={faUnlock} style={{ marginRight: '10px' }} />
            <a href={patentDetails.pdf} target="_blank" rel="noreferrer">PDF</a>
          </div>
        }

    </div>
  )
}
export default Patent