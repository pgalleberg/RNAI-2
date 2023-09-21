import { useState } from "react"
import { useNavigate } from "react-router-dom";

const Form = ({ genericNames, fetchGenericNames, changeGenericName }) => {

    console.log("genericNames: ", genericNames)

    const [autoSuggest, setAutoSuggest] = useState(true)

    const addTask = async (task) => {
        console.log("addTask::task received: ", task)
        console.log("addTask::JSON.stringify(task): ", JSON.stringify(task))
        const res = await fetch('http://127.0.0.1:5000/tasks',{ /* TODO: Should I send request to tasks/user */
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
                value={genericNames[0] !== undefined ? genericNames[0].genericName: ''} required 
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                onChange={(e) => changeGenericName(genericNames[0].id, e.target.value)}
                />
            </div>  
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper2" placeholder="Title of Second Paper" id="paper2" required />
            </div>
            <div className="grid-item">
                <input id="name2" type="text" name="name2" placeholder="Second Generic Name" 
                value={genericNames[1] !== undefined ? genericNames[1].genericName: ''} required 
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
                <input type="text" name="paper3" placeholder="Title of Third Paper" id="paper3" required />
            </div>
            <div className="grid-item">
                <input id="name3" type="text" name="name3" placeholder="Third Generic Name" 
                value={genericNames[2] !== undefined ? genericNames[2].genericName: ''} required 
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false}
                onChange={(e) => changeGenericName(genericNames[2].id, e.target.value)}
                />
            </div>  
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper4" placeholder="Title of Fourth Paper" id="paper4" required />
            </div>
            <div className="grid-item">
                <input id="name4" type="text" name="name4" placeholder="Fourth Generic Name" 
                value={genericNames[3] !== undefined ? genericNames[3].genericName: ''} required 
                style={{ backgroundColor: autoSuggest ? 'lightyellow' : 'white' }}
                disabled={autoSuggest ? true : false} 
                onChange={(e) => changeGenericName(genericNames[3].id, e.target.value)}
                />
            </div> 
            
            <div className="grid-item"></div>
            <div className="grid-item">
                <input type="text" name="paper5" placeholder="Title of Fifth Paper" id="paper5" required />
            </div>
            <div className="grid-item">
                <input id="name5" type="text" name="name5" placeholder="Fifth Generic Name" 
                value={genericNames[4] !== undefined ? genericNames[4].genericName: ''} required 
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
