import { useParams } from "react-router-dom";
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";
import { faUnlock } from '@fortawesome/free-solid-svg-icons'

const PatentDetails = () => {
    const { patent_id, vertical_id } = useParams();
    const [patentDetails, setPatentDetails] = useState(null)

    sessionStorage.setItem('currentTab', 'patents');

    useEffect(() => {
        const getPatentDetails = async () => {
            const patentDetails = await fetchPatentDetails()
            setPatentDetails(patentDetails)
        }
        getPatentDetails()
    }, [patent_id]);

    const fetchPatentDetails = async () => {
        const url = process.env.REACT_APP_FLASK_WEBSERVER + 'individual_patent_details?patent_id=' + patent_id + '&vertical_id=' + vertical_id
        const res = await fetch(url)
        const data = await res.json()

        return data
    }
  return (
    patentDetails ?
        <div className="papers" style={{width: '90%'}}>
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
                </>
            }

            {patentDetails.pdf &&
                <div className='pdf'>
                    <br></br>
                    <FontAwesomeIcon icon={faUnlock} style={{ marginRight: '10px' }} />
                    <a href={patentDetails.pdf} target="_blank" rel="noreferrer">PDF</a>
                </div>
            }

            {patentDetails?.images && patentDetails?.images?.length && (
                <div>
                    <p><strong>Images ({patentDetails.images?.length})</strong></p>
                    <div style={{display: "flex", width: "100%", overflowX: "scroll"}}>
                        {patentDetails.images?.map((i) => (
                            <img src={i}
                                style={{ border: "2px solid black", maxWidth: "100%", maxHeight: "100%", height: "250px", marginRight: "10px", display: "inline-block", verticalAlign: "middle"}}
                                width="contains" alt="patent"
                            />
                        ))}
                    </div>
                </div>
            )}

            {patentDetails.classifications && (
                <div>
                    <p><strong>Classifications</strong></p>
                    <table>
                        {patentDetails.classifications.map((i) => (
                            <tr style={{paddingLeft: "15px", fontSize: "13px"}}>
                                <td style={{paddingTop: "5px", paddingBottom: "5px"}}>
                                    {i.code}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                </td>
                                <td style={{paddingTop: "5px", paddingBottom: "5px"}}>
                                    {i.description}
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>
            )}

            {patentDetails?.patent_citations?.original && patentDetails?.patent_citations?.original?.length && (
                <div style={{padding: "10px"}}>
                    <p><strong>Patent Citations ({patentDetails?.patent_citations?.original?.length})</strong></p>
                    <table>
                        <tr>
                            <th>Publication number</th>
                            <th>Priority date</th>
                            <th>Publication date</th>
                            <th>Assignee</th>
                            <th>Title</th>
                        </tr>

                        {patentDetails?.patent_citations?.original?.map((i) => (
                        <tr>
                            <td><a href={`https://patents.google.com/patent/${i.publication_number}/en`} target="_blank" rel="noreferrer">{i.publication_number}</a></td>
                            <td>{i.priority_date}</td>
                            <td>{i.publication_date}</td>
                            <td>{i.assignee_original}</td>
                            <td>{i.title}</td>
                        </tr>
                        ))}
                    </table>
                </div>
            )}

            {patentDetails?.non_patent_citations && patentDetails?.non_patent_citations?.length && (
                <div style={{padding: "10px"}}>
                    <p><strong>Non-Patent Citations ({patentDetails?.non_patent_citations?.length})</strong></p>
                    <table>
                        <tr>
                            <th>Title</th>
                        </tr>

                        {patentDetails?.non_patent_citations?.map((i) => (
                        <tr>
                            <td>{i.title}</td>
                        </tr>
                        ))}
                    </table>
                </div>
            )}

            {patentDetails?.cited_by?.original && patentDetails?.cited_by?.original?.length && (
                <div style={{padding: "10px"}}>
                    <p><strong>Cited By - Original ({patentDetails?.cited_by?.original?.length})</strong></p>
                    <table>
                        <tr>
                            <th>Publication number</th>
                            <th>Priority date</th>
                            <th>Publication date</th>
                            <th>Assignee</th>
                            <th>Title</th>
                        </tr>

                        {patentDetails?.cited_by?.original?.map((i) => (
                        <tr>
                            <td><a href={`https://patents.google.com/patent/${i.publication_number}/en`} target="_blank" rel="noreferrer">{i.publication_number}</a></td>
                            <td>{i.priority_date}</td>
                            <td>{i.publication_date}</td>
                            <td>{i.assignee_original}</td>
                            <td>{i.title}</td>
                        </tr>
                        ))}
                    </table>
                </div>
            )}

            {patentDetails?.cited_by?.family_to_family && patentDetails?.cited_by?.family_to_family?.length && (
                <div style={{padding: "10px"}}>
                    <p><strong>Cited By - Family to Family ({patentDetails?.cited_by?.family_to_family?.length})</strong></p>
                    <table>
                        <tr>
                            <th>Publication number</th>
                            <th>Priority date</th>
                            <th>Publication date</th>
                            <th>Assignee</th>
                            <th>Title</th>
                        </tr>

                        {patentDetails?.cited_by?.family_to_family?.map((i) => (
                        <tr>
                            <td><a href={`https://patents.google.com/patent/${i.publication_number}/en`} target="_blank" rel="noreferrer">{i.publication_number}</a></td>
                            <td>{i.priority_date}</td>
                            <td>{i.publication_date}</td>
                            <td>{i.assignee_original}</td>
                            <td>{i.title}</td>
                        </tr>
                        ))}
                    </table>
                </div>
            )}

            {patentDetails?.similar_documents && patentDetails?.similar_documents?.length && (
                <div style={{padding: "10px"}}>
                    <p><strong>Similar Documents ({patentDetails?.similar_documents?.length})</strong></p>
                    <table>
                        <tr>
                            <th>Publication</th>
                            <th>Publication Date</th>
                            <th>Title</th>
                        </tr>

                        {patentDetails?.similar_documents?.map((i) => (
                        <tr>
                            <td>
                                {i.publication_number ? 
                                    <a href={`https://patents.google.com/patent/${i.publication_number}/en`} target="_blank" rel="noreferrer">{i.publication_number}</a>
                                :
                                    <a href={`https://patents.google.com/scholar/${i.scholar_id}`} target="_blank" rel="noreferrer">{i.scholar_authors}</a>
                                }
                            </td>
                            <td>{i.publication_date}</td>
                            <td>{i.title}</td>
                        </tr>
                        ))}
                    </table>
                </div>
            )}

            {patentDetails.description && (
                <>
                    <p><strong>Description</strong></p>
                    <p style={{margin: 0, fontSize: "13px"}}>
                        {patentDetails.description}
                    </p>
                </>
            )}

            {patentDetails.claims && (
                <div style={{ padding: "10px", width: "100%"}}>
                    <p><strong>Claims</strong></p>
                    {patentDetails.claims?.map((i) => (
                        <p style={{ margin: 0, fontSize: "13px"}}>
                          {i}<br></br>
                        </p>
                    ))}
                </div>
            )}

        </div>
        :
        <div className="container">
            <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
        </div>
  )
}
export default PatentDetails