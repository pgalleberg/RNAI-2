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
                <Link to={`/grant/${grantDetails.id}`} state={grantDetails.metadata}><h2 style={{marginBottom: '0px'}}>{grantDetails.metadata.OpportunityTitle}</h2></Link>
                <>
                    {
                        grantDetails.metadata.AgencyName &&
                        <span className="detail">
                            {grantDetails.metadata.AgencyName}
                        </span>

                    }

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
                    
                    {
                        grantDetails.metadata.CloseDate &&
                        <span className="detail">
                            Deadline {formatDate(grantDetails.metadata.CloseDate)}
                        </span>

                    }

                    {
                        grantDetails.metadata.GrantorContactEmail && 
                        <span className="detail">
                            {grantDetails.metadata.GrantorContactEmail}
                        </span>
                    }
                    

                    <br></br>
                </>

                <span className="text">Description</span>
                <p style={{ display: 'block', margin: 0, maxHeight: '410px', overflow: 'scroll', textOverflow: 'ellipsis', textAlign: 'justify' }}>{grantDetails.metadata.Description}</p>

                <div className='pdf'>
                    <br></br>
                    <FontAwesomeIcon icon={faClipboardCheck} style={{ marginRight: '10px' }} />
                    {
                        grantDetails.metadata.OpportunityID ? 
                            <a href={'https://grants.gov/search-results-detail/' + grantDetails.metadata.OpportunityID} target="_blank">Apply</a>
                        :
                        <a href={grantDetails.metadata.grant_source_url} target="_blank">Apply</a>
                    }
                </div>
                <p style={{color: 'gray', display: 'flex', justifyContent: 'flex-end', padding: 0, margin: 0}}>{grantDetails.metadata.source}</p>
            </div>
        </>
    )
}

export default Grant
