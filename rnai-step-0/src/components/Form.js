import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'


const Form = () => {
    console.log("Form rendered")

    const [autoSuggest, setAutoSuggest] = useState(true)
    const [genericNames, setGenericNames] = useState([]) 
    const [loading, setLoading] = useState(false)

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
        const res = await fetch(process.env.REACT_APP_MOCK_WEBSERVER + 'tasks',{ /* TODO: Should I send request to tasks/user */
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(task)
        })

        const data = await res.json()

        console.log("addTask::data added: ", data)
    }

    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
         
        console.log("Submit clicked")
        const now = new Date();
        const task = {
            "query": document.getElementById("verticalName").value,
            "user": "Hassaan", /* TODO: Write the actual web master or super admin name/email address here.*/
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
            "autoSuggest": autoSuggest
        }

        await addTask(task)
        navigate('/dashboard')
    }

  return (
    <form id="mainForm" onSubmit={ onSubmit }>
        <div className="grid-container">

            <div className="grid-item"></div>
            <div className="grid-item" style={{ paddingBottom: '10px' }}>Relevant Papers</div>
            <div className="grid-item" style={{ paddingBottom: '10px' }}>Generic Vertical Names</div> 

            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper1" placeholder="Title of First Paper" id="paper1" required />
            </div>
            <div className="grid-item"> 
              <input id="name1" type="text" name="name1" placeholder="First Generic Name" 
                defaultValue={genericNames[0] !== undefined ? genericNames[0].genericName : ''} required 
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
                <input type="text" name="paper2" placeholder="Title of Second Paper" id="paper2" required />
            </div>
            <div className="grid-item">
                <input id="name2" type="text" name="name2" placeholder="Second Generic Name" 
                defaultValue={genericNames[1] !== undefined ? genericNames[1].genericName: ''} required 
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
                  autoSuggest && 
                    e.target.value.length > 5 
                      ? fetchGenericNames(e.target.value)
                      : setGenericNames([])
                }}
                />
            </div>
            <div className="grid-item">
                <input type="text" name="paper3" placeholder="Title of Third Paper" id="paper3" required />
            </div>
            <div className="grid-item">
                <input id="name3" type="text" name="name3" placeholder="Third Generic Name" 
                defaultValue={genericNames[2] !== undefined ? genericNames[2].genericName: ''} required 
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
                <input type="text" name="paper4" placeholder="Title of Fourth Paper" id="paper4" required />
            </div>
            <div className="grid-item">
                <input id="name4" type="text" name="name4" placeholder="Fourth Generic Name" 
                defaultValue={genericNames[3] !== undefined ? genericNames[3].genericName: ''} required 
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
                <input type="text" name="paper5" placeholder="Title of Fifth Paper" id="paper5" required />
            </div>
            <div className="grid-item">
                <input id="name5" type="text" name="name5" placeholder="Fifth Generic Name" 
                defaultValue={genericNames[4] !== undefined ? genericNames[4].genericName: ''} required 
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
                <input style={{cursor: loading && 'wait'}} type="submit" value="Submit" disabled={loading}/>
            </div>
            <div className="grid-item">
            <div style={{ paddingTop: '10px' }}>
                <label className="switch">
                <input type="checkbox" id="autoSuggestCheckbox" 
                checked={autoSuggest} onChange={(e) => setAutoSuggest(e.currentTarget.checked)} disabled={loading}
                />
                <span className="slider round"  style={{cursor: loading && 'wait'}}></span>
                </label>
                <p id="autoSuggestText">Auto Suggest: ON</p>
            </div>
            </div>
        </div>
    </form>
   
  )}

export default Form