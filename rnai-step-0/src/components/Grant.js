import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

const Grant = ({ grantDetails }) => {

    console.log("Grant::grantDetails: ", grantDetails)

    function formatDate(dateStr) {
        if (dateStr.length !== 8)
            return dateStr; // or handle error as you prefer
    
        const month = dateStr.substring(0, 2);
        const day = dateStr.substring(2, 4);
        const year = dateStr.substring(4);
    
        return `${year}-${month}-${day}`;
    }
    
    return (
        <>
            <div style={{backgroundColor: 'whitesmoke', padding: '10px 10px', paddingRight: '20px', marginBottom: '10px', borderRadius: '10px'}}>
                <Link to={`/grant/${grantDetails.metadata.OpportunityID}`} state={grantDetails.metadata}><h2 style={{marginBottom: '0px'}}>{grantDetails.metadata.OpportunityTitle}</h2></Link>
                <>
                    <span className="detail">{grantDetails.metadata.AgencyName}</span>
                    {
                        grantDetails.metadata.AwardFloor && grantDetails.metadata.AwardCeiling &&
                            <span className="detail">
                                ${grantDetails.metadata.AwardFloor} - ${grantDetails.metadata.AwardCeiling}
                            </span>
                    }
                    {
                        grantDetails.metadata.AwardFloor && !grantDetails.metadata.AwardCeiling &&
                        <span className="detail">
                            ${grantDetails.metadata.AwardFloor}
                        </span>
                    }
                    {
                        !grantDetails.metadata.AwardFloor && grantDetails.metadata.AwardCeiling &&
                        <span className="detail">
                            ${grantDetails.metadata.AwardCeiling}
                        </span>
                    }
                    <span className="detail">
                        {
                            grantDetails.metadata.CloseDate &&
                                formatDate(grantDetails.metadata.CloseDate)
                        }
                    </span>

                    <span className="detail">
                        {grantDetails.metadata.GrantorContactEmail}
                    </span>

                    <br></br>
                </>

                <span className="text">Description</span>
                <p style={{ display: 'block', margin: 0, maxHeight: '410px', overflow: 'scroll', textOverflow: 'ellipsis', textAlign: 'justify' }}>{grantDetails.metadata.Description}</p>

                <div className='pdf'>
                    <br></br>
                    <FontAwesomeIcon icon={faClipboardCheck} style={{ marginRight: '10px' }} />
                    <a href={'https://grants.gov/search-results-detail/' + grantDetails.metadata.OpportunityID} target="_blank">Apply</a>
                </div>

            </div>
        </>
    )
}

export default Grant
