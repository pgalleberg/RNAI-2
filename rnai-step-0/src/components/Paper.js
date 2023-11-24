
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUnlock } from '@fortawesome/free-solid-svg-icons'

const Paper = ({ paperDetails, index }) => {

    console.log("Paper::paperDetails: ", paperDetails)
    function expand(index, section){
        console.log("index received: ", index)
        console.log("section name: ", section)
    
        let className = ''
        if (section === 'citations'){
          className = 'citations'
        } else if (section === 'references'){
          className = 'references'
        }
        const buttonText = document.getElementsByClassName('expand-'+section)[index].innerHTML
        
        if (buttonText === 'Expand'){
          document.getElementsByClassName(className)[index].style.display = 'block'
          document.getElementsByClassName('expand-'+section)[index].innerHTML = 'Collapse'
        } else if (buttonText === 'Collapse'){
          document.getElementsByClassName(className)[index].style.display = 'none'
          document.getElementsByClassName('expand-'+section)[index].innerHTML = 'Expand'
        }
       
        console.log("Expand clicked")
    }

    return (
            <div>
                <Link to={`/paper/${paperDetails._id}`}><h2>{paperDetails.title}</h2></Link>

                <div className="authors">
                {paperDetails.authors.map((author) => (
                    <>
                    <Link to={`/author/${author.authorId}`}><span className='author'>{author.name}</span></Link>
                    <span>&nbsp;&nbsp;</span>
                    </>
                ))}
                </div>

                <>
                {paperDetails.s2FieldsOfStudy.map((field) => (
                    field.source === 's2-fos-model' && <span className="detail">{field.category}</span>
                ))}

                <span className="detail">{paperDetails.venue}</span>

                <span className="detail">{paperDetails.publicationDate}</span>
                <br></br>
                </>

                {paperDetails.tldr && 
                <>
                    <span className="text">TLDR</span>
                    <p style={{ display: 'inline', margin: 0 }}>{paperDetails.tldr.text}</p>
                    <br></br>
                </>
                }

                {paperDetails.abstract && 
                <>
                    <span className="text">Abstract</span>
                    <p style={{ display: 'inline', margin: 0 }}>{paperDetails.abstract}</p>
                    <br></br>
                </>
                }

                {paperDetails.isOpenAccess &&
                <div className='pdf'>
                    <br></br>
                    <FontAwesomeIcon icon={faUnlock} style={{marginRight: '10px'}}/>
                    <a href={paperDetails.openAccessPdf && paperDetails.openAccessPdf.url} target="_blank">PDF</a>
                </div>
                }

                <>
                {paperDetails.citations &&
                    <>
                    <br></br>
                    <span>{paperDetails.citationCount}&nbsp;Citations&nbsp;</span>
                    <span>({paperDetails.influentialCitationCount}&nbsp;Influential Citations)&nbsp;</span>
                    <span className="expand-citations" onClick={() => expand(index, 'citations')}>Expand</span>
                    <div className="citations" style={{display: 'none'}}>
                        <br></br>
                        {paperDetails.citations.map((citation) => (
                            <a href='#'>&nbsp;&nbsp;•&nbsp;&nbsp;{citation.title}</a>
                        ))}
                        {/* <span className="expand-citations" onClick={() => expand(index)}>Expand</span> */}
                    </div>
                    </>
                }
                </>

                <>
                {paperDetails.references &&
                    <>
                    <br></br>
                    <span>{paperDetails.references.length}&nbsp;References&nbsp;</span>
                    <span className="expand-references" onClick={() => expand(index, 'references')}>Expand</span>
                    <div className="references" style={{display: 'none'}}>
                        <br></br>
                        {paperDetails.references.map((reference) => (
                            <a href='#'>&nbsp;&nbsp;•&nbsp;&nbsp;{reference.title}</a>
                        ))}
                        {/* <span className="expand-references" onClick={() => expand(index)}>Expand</span> */}
                    </div>
                    </>
                }
                </>

            </div>
    )
}

export default Paper
