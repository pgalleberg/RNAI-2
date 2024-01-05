import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

const GrantDetails = () => {
    const location = useLocation();
    const data = location.state;

    function formatDate(dateStr) {
        console.log('dateStr: ', dateStr)
        if (dateStr.length !== 8)
            return dateStr; // or handle error as you prefer
    
        const month = dateStr.substring(0, 2);
        const day = dateStr.substring(2, 4);
        const year = dateStr.substring(4);
    
        return `${month}-${day}-${year}`;
    }

    function formatFundingInstrumentType(code) {
        if (code == 'G')
            return 'Grant'
        else if (code == 'CA')
            return 'Cooperative Agreement'
        else if (code == 'O')
            return 'Other'
        else if (code == 'PC')
            return 'Procurement Contract'
        else
            return code
    }

    function formatCategoryOfFundingActivity(code) {
        if (code === 'ACA')
            return 'Affordable Care Act';
        else if (code === 'AG')
            return 'Agriculture';
        else if (code === 'AR')
            return 'Arts';
        else if (code === 'BC')
            return 'Business and Commerce';
        else if (code === 'CD')
            return 'Community Development';
        else if (code === 'CP')
            return 'Consumer Protection';
        else if (code === 'DPR')
            return 'Disaster Prevention and Relief';
        else if (code === 'ED')
            return 'Education';
        else if (code === 'ELT')
            return 'Employment, Labor and Training';
        else if (code === 'EN')
            return 'Energy';
        else if (code === 'ENV')
            return 'Environment';
        else if (code === 'FN')
            return 'Food and Nutrition';
        else if (code === 'HL')
            return 'Health';
        else if (code === 'HO')
            return 'Housing';
        else if (code === 'HU')
            return 'Humanities';
        else if (code === 'ISS')
            return 'Income Security and Social Services';
        else if (code === 'IS')
            return 'Information and Statistics';
        else if (code === 'LJL')
            return 'Law, Justice and Legal Services';
        else if (code === 'NR')
            return 'Natural Resources';
        else if (code === 'RA')
            return 'Recovery Act';
        else if (code === 'RD')
            return 'Regional Development';
        else if (code === 'ST')
            return 'Science and Technology and other Research and Development';
        else if (code === 'T')
            return 'Transportation';
        else if (code === 'O')
            return 'Other';
        else
            return code; 
    }

    function formatOpportunityCategory(code) {
        if (code === 'D')
            return 'Discretionary'
        else if (code === 'M')
            return 'Mandatory'
        else if (code === 'C')
            return 'Continuation'
        else if (code === 'E')
            return 'Earmark'
        else if (code === 'O')
            return 'Other'
        else 
            return code
    }

    function formatEligibleApplicants(code) {
        switch (code) {
            case '00':
                return 'State governments';
            case '01':
                return 'County governments';
            case '02':
                return 'City or township governments';
            case '04':
                return 'Special district governments';
            case '05':
                return 'Independent school districts';
            case '06':
                return 'Public and State controlled institutions of higher education';
            case '07':
                return 'Native American tribal governments (Federally recognized)';
            case '08':
                return 'Public housing authorities/Indian housing authorities';
            case '11':
                return 'Native American tribal organizations (other than Federally recognized tribal governments)';
            case '12':
                return 'Nonprofits having a 501(c)(3) status with the IRS, other than institutions of higher education';
            case '13':
                return 'Nonprofits that do not have a 501(c)(3) status with the IRS, other than institutions of higher education';
            case '20':
                return 'Private institutions of higher education';
            case '21':
                return 'Individuals';
            case '22':
                return 'For-profit organizations other than small businesses';
            case '23':
                return 'Small businesses';
            case '25':
                return 'Others (see text field entitled “Additional Information on Eligibility” for clarification)';
            case '99':
                return 'Unrestricted (i.e., open to any type of entity below), subject to any clarification in text field entitled “Additional Information on Eligibility”';
            default:
                return code;
        }
    }
    

    return (
        <div className="papers" style={{width: '90%'}}>
            <div className='author-container' style={{width: '100%'}}>
                <div className='author-card'>
                    <div className="background"></div>
                    <div className="author-details">
                        <p><strong>Funding Amount</strong></p>
                        
                        <div className="author-stat">
                            <p>Award Ceiling</p>
                            <p style={{textAlign: 'right'}}><strong>${data.AwardCeiling}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Award Floor</p>
                            <p style={{textAlign: 'right'}}><strong>${data.AwardFloor}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Estimated Total Program Funding</p>
                            <p style={{textAlign: 'right'}}><strong>${data.EstimatedTotalProgramFunding}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Expected Number Of Awards</p>
                            <p style={{textAlign: 'right'}}><strong>{data.ExpectedNumberOfAwards}</strong></p>
                        </div>

                        <hr></hr>

                        <p><strong>Important Dates</strong></p>

                        {data.PostDate &&
                            <div className="author-stat">
                                <p>Post Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.PostDate)}</strong></p>
                            </div>
                        }

                        {data.EstimatedSynopsisPostDate &&
                            <div className="author-stat">
                                <p>Estimated Post Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.EstimatedSynopsisPostDate)}</strong></p>
                            </div>
                        }

                        {data.LastUpdatedDate &&
                            <div className="author-stat">
                                <p>Last Updated Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.LastUpdatedDate)}</strong></p>
                            </div>
                        }

                        {data.CloseDate &&
                            <div className="author-stat">
                                <p>Close Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.CloseDate)}</strong></p>
                            </div>
                        }

                        {data.EstimatedSynopsisCloseDate &&
                            <div className="author-stat">
                                <p>Estimated Synopsis Close Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.EstimatedSynopsisCloseDate)}</strong></p>
                            </div>
                        }

                        {data.ArchiveDate &&
                            <div className="author-stat">
                                <p>Archive Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.ArchiveDate)}</strong></p>
                            </div>
                        }

                        {data.EstimatedAwardDate &&
                            <div className="author-stat">
                                <p>Estimated Award Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.EstimatedAwardDate)}</strong></p>
                            </div>
                        }

                        {data.EstimatedProjectStartDate &&
                            <div className="author-stat">
                                <p>Estimated Project Start Date</p>
                                <p style={{textAlign: 'right'}}><strong>{formatDate(data.EstimatedProjectStartDate)}</strong></p>
                            </div>
                        }

                        <hr></hr>

                        <p><strong>General Information</strong></p>

                        <div className="author-stat">
                            <p>CFDA Numbers</p>
                            <p style={{textAlign: 'right'}}><strong>{data.CFDANumbers}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Category Of Funding Activity</p>
                            <p style={{textAlign: 'right'}}><strong>{formatCategoryOfFundingActivity(data.CategoryOfFundingActivity)}</strong></p>
                        </div>

                        {/* <div className="author-stat">
                            <p>Category Explanation</p>
                            <p style={{textAlign: 'right'}}><strong>{data.CategoryExplanation}</strong></p>
                        </div> */}

                        <div className="author-stat">
                            <p>Cost Sharing Or Matching Requirement</p>
                            <p style={{textAlign: 'right'}}><strong>{data.CostSharingOrMatchingRequirement}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Funding Instrument Type</p>
                            <p style={{textAlign: 'right'}}><strong>{formatFundingInstrumentType(data.FundingInstrumentType)}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Opportunity Category</p>
                            <p style={{textAlign: 'right'}}><strong>{formatOpportunityCategory(data.OpportunityCategory)}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Opportunity Number</p>
                            <p style={{textAlign: 'right'}}><strong>{(data.OpportunityNumber)}</strong></p>
                        </div>

                        <div className="author-stat">
                            <p>Version</p>
                            <p style={{textAlign: 'right'}}><strong>{(data.Version)}</strong></p>
                        </div>
                    </div>
                </div>
                <div style={{marginLeft: '30px'}}>
                    {data.Version.includes('Forecast') &&
                        <p><i>NOTE: This is a Forecasted Opportunity.</i></p>
                    }
                    <Link to={`/grant/${data.OpportunityID}`} state={data}><h2 style={{marginBottom: '0px'}}>{data.OpportunityTitle}</h2></Link>

                    <div className='pdf' style={{marginBottom: '20px'}}>
                        <br></br>
                        <FontAwesomeIcon icon={faClipboardCheck} size='2x' style={{ marginRight: '10px'}} />
                        <a href={'https://grants.gov/search-results-detail/' + data.OpportunityID} target="_blank" style={{fontSize: '18px'}}>Apply Online</a>
                    </div>
                    

                    
                    {data.CloseDate ?
                        <>
                            <span className="text">Application Deadline</span>
                            <p style={{ display: 'inline', margin: '5px' }}>{formatDate(data.CloseDate)}</p>
                        </>
                        :
                        data.EstimatedSynopsisCloseDate &&
                            <>
                                <span className="text">Estimated Application Deadline</span>
                                <p style={{ display: 'inline', margin: '5px' }}>{formatDate(data.EstimatedSynopsisCloseDate)}</p>
                            </>
                    }
                    <br></br><br></br>

                    <span className="text">Agency Name</span>
                    <p style={{ display: 'inline', margin: '5px' }}>{data.AgencyName}&nbsp;({data.AgencyCode})</p>
                    <br></br><br></br>

                    <span className="text">Description</span>
                    <p style={{ display: 'inline-block', margin: '5px', textAlign: 'justify' }}>{data.Description}</p>
                    <br></br><br></br>

                    <span className="text">Link To Additional Information</span>
                    <p style={{ display: 'inline-block', margin: '5px', textAlign: 'justify' }}>{data.AdditionalInformationURL}</p>
                    <br></br><br></br>

                    <span className="text">Grantor Contact Email</span>
                    <p style={{ display: 'inline', margin: '5px' }}>{data.GrantorContactEmail}</p>
                    <br></br><br></br>

                    {data.GrantorContactText &&
                        <>
                            <span className="text">Grantor Contact Text</span>
                            <p style={{ display: 'inline', margin: '5px' }}>{data.GrantorContactText}</p>
                            <br></br><br></br>
                        </>
                    }

                    {data.GrantorContactName &&
                        <>
                            <span className="text">Grantor Contact Name</span>
                            <p style={{ display: 'inline', margin: '5px' }}>{data.GrantorContactName}</p>
                            <br></br><br></br>
                        </>
                    }

                    {data.GrantorContactPhoneNumber &&
                        <>
                            <span className="text">Grantor Contact Phone Number</span>
                            <p style={{ display: 'inline', margin: '5px' }}>{data.GrantorContactPhoneNumber}</p>
                            <br></br><br></br>
                        </>
                    }

                    <hr></hr>

                    <h3 style={{fontSize: '24px', marginBottom: '10px'}}>Eligibility</h3>

                    <span className="text">Eligible Applicants</span>
                    <p style={{ display: 'inline', margin: '5px' }}>{formatEligibleApplicants(data.EligibleApplicants)}</p>
                    <br></br><br></br>

                    <span className="text">Additional Information On Eligibility</span>
                    <p style={{ display: 'inline', margin: '5px' }}>{data.AdditionalInformationOnEligibility}</p>
                    <br></br><br></br>

                </div>
            </div> 
        </div>
    )
}

export default GrantDetails
