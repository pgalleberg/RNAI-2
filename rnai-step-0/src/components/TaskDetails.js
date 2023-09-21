import { useEffect, useState } from "react"
import Button from "./Button"
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'


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
    const url = 'http://127.0.0.1:5000/task_details/' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const fetchTask = async () => {
    const url = 'http://127.0.0.1:5000/tasks/' + id
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
      const res = await fetch('http://127.0.0.1:5000/tasks/' + id, {
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

  return (
    <div style={{width: '75%'}}>
        <h1 style={{textAlign: 'left'}}>Vertical: {taskDetails.query}</h1>
        <div style={{textAlign: 'left'}}>
            <p><strong>Papers:</strong></p>
            <p>{taskDetails.papers}</p>

            <p><strong>Authors:</strong></p>
            <p>{taskDetails.authors}</p>

            <p><strong>Institutes:</strong></p>
            <p>{taskDetails.institutes}</p>

            <p><strong>Funding:</strong></p>
            <p>{taskDetails.fundings}</p>
        </div>

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
