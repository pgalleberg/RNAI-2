import { useEffect, useState } from "react"
import Button from "./Button"
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons'

const TaskDetails = () => {
  console.log("TaskDetails rendered")
  const { id } = useParams();
  const [taskDetails, setTaskDetails] = useState({})
  const [task, setTask] = useState({})
  const [change, setChange] = useState(false)

  useEffect(() => {
    console.log("useEffect triggered")
    const getTaskDetails = async () => {
      console.log("useEffect::fetchTaskDetails")
      const taskDetails = await fetchTaskDetails()
      setTaskDetails(taskDetails)

      console.log("useEffect::fetchTask")
      const taskFromServer = await fetchTask()
      setTask(taskFromServer)
    }
    getTaskDetails()
  }, [])


  const fetchTaskDetails = async () => {
    const url = process.env.REACT_APP_WEBSERVER + 'task_details/' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const fetchTask = async () => {
    const url = process.env.REACT_APP_WEBSERVER + 'tasks/' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const updateStatus = async (action) => {
    action === 'Approve' ? setTask({ ...task, status: 'Approved'}) : setTask({ ...task, status: 'Rejected'})
    setChange(true)
  }

  useEffect(() => {
    console.log("useEffect 2 triggered")
    const updateTask = async () => {
      const res = await fetch(process.env.REACT_APP_WEBSERVER + 'tasks/' + id, {
        method: 'PUT',
        headers: {
          'Content-type' : 'application/json'
        },
        body: JSON.stringify(task)
      })
  
      await res.json()
    }

    if (task.status !== undefined && change === true){
      console.log("useEffect 2::updateTask")
      updateTask()
    }
    
  }, [task, change])

  function editDetails(subHeading){
    console.log("Button clicked")
    document.getElementById(subHeading).contentEditable = true
    document.getElementById(subHeading).focus();

    document.getElementById(subHeading + 'buttons').style.display = 'block'
  }

  function cancelEdit(subHeading, originalText){
    document.getElementById(subHeading).contentEditable = false
    document.getElementById(subHeading + 'buttons').style.display = 'none'
    document.getElementById(subHeading).innerHTML = originalText
  }

  async function saveEdits(subHeading){
    document.getElementById(subHeading).contentEditable = false
    document.getElementById(subHeading + 'buttons').style.display = 'none'
    setTaskDetails({ ...taskDetails, [subHeading]: document.getElementById(subHeading).innerHTML })
    const res = await fetch(process.env.REACT_APP_WEBSERVER + 'task_details/' + id, {
        method: 'PUT',
        headers: {
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({ ...taskDetails, [subHeading]: document.getElementById(subHeading).innerHTML })
      })
  
      await res.json()
  }

  return (
    <div style={{width: '75%'}}>
      <h1 style={{textAlign: 'left'}}>Vertical: {taskDetails.query}</h1>
          {Object.entries(taskDetails).map(([key, value]) => (
            (key !== 'id' && key !== 'query') &&
            <div style={{textAlign: 'left'}}>
                <p><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    {task.status === 'Completed' &&
                      <button className="editButton" onClick={() => editDetails(key)}>
                        <FontAwesomeIcon icon={faPenToSquare}/>
                      </button>
                    }
                </p>
                <p id={key} tabIndex="-1">{value}</p>
                <div id={key + 'buttons'} style={{textAlign: 'center', display: 'none'}}>
                  <input type='submit' value="Save & Submit" onClick={() => saveEdits(key)} style={{width: '150px', marginRight: '20px'}}></input>
                  <input type='submit' value="Cancel" onClick={() => cancelEdit(key, value)} style={{width: '75px', backgroundColor: 'grey'}}></input>
                </div>
            </div>
          ))}

       {task.status === 'Completed' &&
        <div>
          <Button text={'Approve'} className={'btn approve'} onClick={() => updateStatus('Approve')}/>
          <Button text={'Reject'} className={'btn reject'} onClick={() => updateStatus('Reject')}/>
        </div>}

        {task.status === 'Rejected' &&
        <div >
          <FontAwesomeIcon icon={faCircleXmark} style={{height: '75px', color: '#e14141', paddingTop: '30px'}} />
          <br />
          <h3 style={{color: "#e14141"}}>Rejected</h3>
        </div>}

        {task.status === 'Approved' &&
        <div>
          <FontAwesomeIcon icon={faCircleCheck} style={{height: '75px', color: '#10a37f', paddingTop: '30px'}} />
          <br />
          <h3 style={{color: "#10a37f"}}>Approved</h3>
        </div>}

        
    </div>
  )
}

export default TaskDetails
