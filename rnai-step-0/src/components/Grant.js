import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

const Grant = ({ grantDetails }) => {

    console.log("Grant::grantDetails: ", grantDetails)

    function formatDate(dateStr) {
        console.log('dateStr: ', dateStr)
        if (dateStr.length !== 8)
            return dateStr; // or handle error as you prefer
    
        const month = dateStr.substring(0, 2);
        const day = dateStr.substring(2, 4);
        const year = dateStr.substring(4);
    
        return `${year}-${month}-${day}`;
    }
    
    return (
        <>
            <div>
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
                <p style={{ display: 'inline', margin: 0 }}>{grantDetails.metadata.Description}</p>

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
