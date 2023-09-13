import { useState } from "react"

const Form = ({ genericNames, fetchGenericNames, changeGenericName }) => {

    console.log("genericNames: ", genericNames)

    //const [verticalName, setVerticalName] = useState('')
    const [autoSuggest, setAutoSuggest] = useState(true)

  return (
    <form id="mainForm" method="post">

        <div className="grid-container">

            <div className="grid-item"></div>
            <div className="grid-item" style={{ paddingBottom: '10px' }}>Relevant Papers</div>
            <div className="grid-item" style={{ paddingBottom: '10px' }}>Generic Vertical Names</div> 

            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper1" placeholder="Title of First Paper" required />
            </div>
            <div className="grid-item">
                <input id="name1" type="text" name="name1" placeholder="First Generic Name" 
                value={genericNames[0].genericName} required 
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                onChange={(e) => changeGenericName(genericNames[0].id, e.target.value)}
                />
            </div>  
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper2" placeholder="Title of Second Paper" required />
            </div>
            <div className="grid-item">
                <input id="name2" type="text" name="name2" placeholder="Second Generic Name" 
                value={genericNames[1].genericName} required 
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                onChange={(e) => changeGenericName(genericNames[1].id, e.target.value)}
                />
            </div>  
            
            <div className="grid-item">
                <input id="verticalName" type="text" name="vertical" placeholder="Vertical Name" required 
                //value={verticalName} 
                //onChange={(e) => setVerticalName(e.target.value)}
                onBlur = {(e) => autoSuggest && fetchGenericNames(e.target.value)}/>
            </div>
            <div className="grid-item">
                <input type="text" name="paper3" placeholder="Title of Third Paper" required />
            </div>
            <div className="grid-item">
                <input id="name3" type="text" name="name3" placeholder="Third Generic Name" 
                value={genericNames[2].genericName} required 
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                onChange={(e) => changeGenericName(genericNames[2].id, e.target.value)}
                />
            </div>  
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper4" placeholder="Title of Fourth Paper" required />
            </div>
            <div className="grid-item">
                <input id="name4" type="text" name="name4" placeholder="Fourth Generic Name" 
                value={genericNames[3].genericName} required
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false} 
                onChange={(e) => changeGenericName(genericNames[3].id, e.target.value)}
                />
            </div> 
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper5" placeholder="Title of Fifth Paper" required />
            </div>
            <div className="grid-item">
                <input id="name5" type="text" name="name5" placeholder="Fifth Generic Name" 
                value={genericNames[4].genericName} required
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                onChange={(e) => changeGenericName(genericNames[4].id, e.target.value)}
                />
            </div>   

            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="submit" value="Submit" />
            </div>
            <div className="grid-item">
            <div style={{ paddingTop: '10px' }}>
                <label className="switch">
                <input type="checkbox" id="autoSuggestCheckbox" checked={autoSuggest} onChange={(e) => setAutoSuggest(e.currentTarget.checked)}/>
                <span className="slider round"></span>
                </label>
                <p id="autoSuggestText">Auto Suggest: ON</p>
            </div>
            </div>
        </div>
    </form>
  )}

export default Form
