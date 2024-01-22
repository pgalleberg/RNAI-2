import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTriangleExclamation, faGear } from '@fortawesome/free-solid-svg-icons'
import auth from "../firebase";

const Form = () => {
    console.log("Form rendered")
    const user = auth.currentUser;
    console.log("user: ", user)
    const [autoSuggest, setAutoSuggest] = useState(true)
    const [genericNames, setGenericNames] = useState([]) 
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [numberOfGrantsPerGenericName, setNumberOfGrantsPerGenericName] = useState(3)

    console.log("genericNames: ", genericNames)

    const fetchGenericNames = async (verticalName) => {
      setLoading(true);
      const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'getGenericNames?verticalName=' + verticalName) 
      console.log("fetchTasks::res: ", res)
      const data = await res.json()
      console.log("fetchTasks::data: ", data)
      
      setGenericNames([
        { 
          id: 1,
          genericName: data[0]
        }, 
        { 
          id: 2,
          genericName: data[1]
        }, 
        { 
          id: 3,
          genericName: data[2]
        }, 
        { 
          id: 4,
          genericName: data[3]
        }, 
        { 
          id: 5,
          genericName: data[4]
        }])

        setLoading(false);
    }

    const addTask = async (task) => {
        console.log("addTask::task received: ", task)
        console.log("addTask::JSON.stringify(task): ", JSON.stringify(task))
        const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'tasks',{ /* TODO: Should I send request to tasks/user */
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(task)
        })

        //const data = await res.json() //don't need to await here
        //console.log("addTask::data added: ", data)
    }

    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()

        setSubmitting(true)
         
        console.log("Submit clicked")
        const now = new Date();
        const task = {
            "query": document.getElementById("verticalName").value,
            "user": {
              "uid": user.uid,
              "name": user.displayName,
              "email": user.email
            },
            "status": "Pending",
            "time": now.toLocaleString(),
            "papers": [
                document.getElementById("paper1").value,
                document.getElementById("paper2").value,
                document.getElementById("paper3").value,
                document.getElementById("paper4").value,
                document.getElementById("paper5").value
            ]
            , 
            "names": [
                document.getElementById("name1").value,
                document.getElementById("name2").value,
                document.getElementById("name3").value,
                document.getElementById("name4").value,
                document.getElementById("name5").value
            ],
            "autoSuggest": autoSuggest,
            "numberOfGrants": parseInt(document.getElementById("numberOfGrants").value, 10),
            "numberOfGrantsPerGenericName": parseInt(document.getElementById("numberOfGrantsPerGenericName").value, 10), 
            "OpportunityStatus": [
              document.getElementById("posted").checked === true && 'posted',
              document.getElementById("forecasted").checked === true && 'forecasted',
              document.getElementById("closed").checked === true && 'closed'
            ].filter(Boolean),
        }

        await addTask(task)
        setSubmitting(false)
        navigate('/dashboard')
    }

  return (
    <form id="mainForm" className="grid-container" onSubmit={ onSubmit }>
        <div style={{backgroundColor: 'whitesmoke', textAlign: 'left', paddingBottom: '20px', borderRadius: '10px'}}>
            <div className="background" style={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}></div>
            <div style={{paddingLeft: '10px'}}>
              <p style={{fontSize: '20px'}}><strong> Configurations&nbsp;<FontAwesomeIcon icon={faGear} size="lg" color="black"/></strong></p>   
              {/* <hr style={{marginRight: '120px'}}></hr> */}
            <br></br>
              <div>
                <div>
                  <label># of grants for vertical name:</label>
                  <input id="numberOfGrants" type="number" defaultValue="5" max={10} min={1}></input><br></br>
                </div>
                <div>
                  <label># of grants for generic names:</label>
                  <input 
                    id="numberOfGrantsPerGenericName" type="number" value={numberOfGrantsPerGenericName} max={5} min={0}
                    onChange={(e) => {
                      setNumberOfGrantsPerGenericName(e.target.value)
                      autoSuggest && document.getElementById('verticalName').value.length > 5 && e.target.value > 0 && document.getElementById('name1').value.length === 0 &&
                      fetchGenericNames(document.getElementById('verticalName').value)
                    }}
                  ></input><br></br>
                </div>
              </div>
              <div >
                <p style={{fontWeight: 'bolder'}}>Opportunity Status:</p>
                <input type="checkbox" id="posted" defaultChecked></input>
                <label>Posted</label><br></br>
                <input type="checkbox" id="forecasted" defaultChecked></input>
                <label>Forecasted</label><br></br>
                <input type="checkbox" id="closed" disabled></input>
                <label>Closed</label><br></br>
              </div>

              {/* <br></br>
              <hr style={{marginRight: '20px', borderColor: 'lightgray', borderTopWidth: '0.1px'}}></hr>

              <div>
                <div className="">
                  <label for="fname"># of relevant papers:</label>
                  <input type="number" defaultValue="3" max={10} min={1}></input><br></br>
                </div>
                <div className="">
                  <label for="fname"># of recommended papers:</label>
                  <input type="number" defaultValue="3" max={10} min={1}></input><br></br>
                </div>
              </div> */}
            </div>

        </div>
        <div className="inputs" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'}}>
            <div className="grid-item"></div>
            <div className="grid-item" style={{ paddingBottom: '10px', width: '320px' }}>
              Relevant Papers
              &nbsp;
              <FontAwesomeIcon 
                icon={faTriangleExclamation} size="lg" color="rgb(255, 165, 0)"
              />
            </div>
            <div className="grid-item" style={{ paddingBottom: '10px' }}>Generic Vertical Names</div> 
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper1" placeholder="Title of First Paper" id="paper1" disabled style={{backgroundColor: 'lightgray'}}/> {/* required */}
            </div>
            <div className="grid-item"> 
              <input id="name1" type="text" name="name1" placeholder="First Generic Name" 
                defaultValue={genericNames[0] !== undefined ? genericNames[0].genericName : ''} 
                required={numberOfGrantsPerGenericName > 0}
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white'}}
                disabled={autoSuggest ? true : false}
                // onChange={(e) => changeGenericName(genericNames[0].id, e.target.value)}
                />
                <FontAwesomeIcon 
                  icon={faSpinner} spin size="lg" color="black"
                  style={{marginLeft: '10px', visibility: !loading && 'hidden'}} 
                />
            </div>  
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper2" placeholder="Title of Second Paper" id="paper2" disabled style={{backgroundColor: 'lightgray'}}/> {/* required */}
            </div>
            <div className="grid-item">
                <input id="name2" type="text" name="name2" placeholder="Second Generic Name" 
                defaultValue={genericNames[1] !== undefined ? genericNames[1].genericName: ''}
                required={numberOfGrantsPerGenericName > 0}
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                // onChange={(e) => changeGenericName(genericNames[1].id, e.target.value)}
                />
                <FontAwesomeIcon 
                  icon={faSpinner} spin size="lg" color="black"
                  style={{marginLeft: '10px', visibility: !loading && 'hidden'}} 
                />
            </div>  
            <div className="grid-item">
                <input id="verticalName" type="text" name="vertical" placeholder="Vertical Name" required 
                onBlur = {(e) => {
                  autoSuggest && e.target.value.length > 5 && numberOfGrantsPerGenericName > 0
                      ? fetchGenericNames(e.target.value)
                      : setGenericNames([])
                }}
                />
            </div>
            <div className="grid-item">
                <input type="text" name="paper3" placeholder="Title of Third Paper" id="paper3" disabled style={{backgroundColor: 'lightgray'}}/> {/* required */}
            </div>
            <div className="grid-item">
                <input id="name3" type="text" name="name3" placeholder="Third Generic Name" 
                defaultValue={genericNames[2] !== undefined ? genericNames[2].genericName: ''}
                required={numberOfGrantsPerGenericName > 0}
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                // onChange={(e) => changeGenericName(genericNames[2].id, e.target.value)}
                />
                <FontAwesomeIcon 
                  icon={faSpinner} spin size="lg" color="black"
                  style={{marginLeft: '10px', visibility: !loading && 'hidden'}} 
                />
            </div>  
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper4" placeholder="Title of Fourth Paper" id="paper4" disabled style={{backgroundColor: 'lightgray'}}/> {/* required */}
            </div>
            <div className="grid-item">
                <input id="name4" type="text" name="name4" placeholder="Fourth Generic Name" 
                defaultValue={genericNames[3] !== undefined ? genericNames[3].genericName: ''}
                required={numberOfGrantsPerGenericName > 0}
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false} 
                // onChange={(e) => changeGenericName(genericNames[3].id, e.target.value)}
                />
                <FontAwesomeIcon 
                  icon={faSpinner} spin size="lg" color="black"
                  style={{marginLeft: '10px', visibility: !loading && 'hidden'}} 
                />
            </div> 
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper5" placeholder="Title of Fifth Paper" id="paper5" disabled style={{backgroundColor: 'lightgray'}}/> {/* required */}
            </div>
            <div className="grid-item">
                <input id="name5" type="text" name="name5" placeholder="Fifth Generic Name" 
                defaultValue={genericNames[4] !== undefined ? genericNames[4].genericName: ''}
                required={numberOfGrantsPerGenericName > 0}
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                // onChange={(e) => changeGenericName(genericNames[4].id, e.target.value)}
                />
                <FontAwesomeIcon 
                  icon={faSpinner} spin size="lg" color="black"
                  style={{marginLeft: '10px', visibility: !loading && 'hidden'}} 
                />
            </div>   

            <div className="grid-item"></div>
            <div className="grid-item">
              {
                submitting ?
                  <FontAwesomeIcon icon={faSpinner} style={{color: 'black'}} spin size="5x"></FontAwesomeIcon>
                  : 
                  <input style={{cursor: loading && 'wait'}} type="submit" value="Submit" disabled={loading}/>
              }
            </div>

            <div className="grid-item">
            <div style={{ paddingTop: '10px' }}>
                <label className="switch">
                <input type="checkbox" id="autoSuggestCheckbox" 
                  checked={autoSuggest} 
                  onChange={(e) => {
                    setAutoSuggest(e.currentTarget.checked)
                    document.getElementById('verticalName').value.length > 5 && numberOfGrantsPerGenericName > 0 &&  document.getElementById('name1').value.length == 0 &&
                    fetchGenericNames(document.getElementById('verticalName').value)
                  }}
                  disabled={loading}
                />
                <span className="slider round"  style={{cursor: loading && 'wait'}}></span>
                </label>
                <p id="autoSuggestText">Auto Suggest: {autoSuggest ? 'ON' : 'OFF'}</p>
            </div>
            </div>
        </div>
    </form>
  )}

export default Form
