import { useEffect, useState } from "react"
import Button from "./Button"
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faSpinner} from '@fortawesome/free-solid-svg-icons'
import Paper from "./Paper"
import Grant from "./Grant"

const TaskDetails = () => {
  console.log("TaskDetails rendered")
  const { id } = useParams();
  console.log("TaskDetails::id: ", id)
  const [taskDetails, setTaskDetails] = useState([])
  const [fundingDetails, setFundingDetails] = useState([])
  const [task, setTask] = useState({})
  const [change, setChange] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("useEffect triggered")
    const getTaskDetails = async () => {
      console.log("useEffect::fetchTaskDetails")
      const taskDetails = await fetchTaskDetails()
      console.log("useEffect::taskDetails: ", taskDetails)
      setTaskDetails(taskDetails)

      console.log("useEffect::fetchFundingDetails")
      const fundingDetails = await fetchFundingDetails()
      console.log("useEffect::fundingDetails: ", fundingDetails)
      setFundingDetails(fundingDetails)

      console.log("useEffect::fetchTask")
      const taskFromServer = await fetchTask()
      setTask(taskFromServer)

      setLoading(false)
    }
    getTaskDetails()
  }, [])


  const fetchTaskDetails = async () => {
    const url = process.env.REACT_APP_FLASK_WEBSERVER + 'vertical_details?id=' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const fetchFundingDetails = async () => {
    const url = process.env.REACT_APP_FLASK_WEBSERVER + 'funding_details?id=' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const fetchTask = async () => {
    const url = process.env.REACT_APP_FLASK_WEBSERVER + 'task?id=' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const updateStatus = async (action) => {
    action === 'Approve' ? setTask({ ...task, status: 'Approved' }) : setTask({ ...task, status: 'Rejected' })
    setChange(true)
  }

  useEffect(() => {
    console.log("useEffect 2 triggered")
    const updateTask = async () => {
      const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'update_vertical', {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(task)
      })

      await res.json()
    }

    if (task.status !== undefined && change === true) {
      console.log("useEffect 2::updateTask")
      updateTask()
    }

  }, [task, change])

  function editDetails(subHeading) {
    console.log("Button clicked")
    document.getElementById(subHeading).contentEditable = true
    document.getElementById(subHeading).focus();

    document.getElementById(subHeading + 'buttons').style.display = 'block'
  }

  function cancelEdit(subHeading, originalText) {
    document.getElementById(subHeading).contentEditable = false
    document.getElementById(subHeading + 'buttons').style.display = 'none'
    document.getElementById(subHeading).innerHTML = originalText
  }

  async function saveEdits(subHeading) {
    document.getElementById(subHeading).contentEditable = false
    document.getElementById(subHeading + 'buttons').style.display = 'none'
    setTaskDetails({ ...taskDetails, [subHeading]: document.getElementById(subHeading).innerHTML })
    const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'task_details/' + id, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ ...taskDetails, [subHeading]: document.getElementById(subHeading).innerHTML })
    })

    await res.json()
  }

  return (
    loading ? 
      <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
      :
      <div style={{ width: '75%' }}>
        <h1 style={{ textAlign: 'left' }}>Vertical: {task.query}</h1>
        <hr></hr>

        <div className='papers'>

          {Object.keys(fundingDetails).length > 0 &&
            <div>
              <h2>Funding Opportunities</h2>

              {/* <h4>{task.query}</h4> */}
              {
                fundingDetails[task.query].map((grant) => (
                  <Grant key={grant._id} grantDetails={grant}/>
                ))
              }

              {
                Object.entries(fundingDetails).map(([search_term, grants]) => 
                  search_term !== task.query &&
                  <>
                    <hr></hr>
                    <h2 style={{fontSize: '1.25em',}}><i>{search_term}</i></h2>
                  { grants.map((grant) => (
                      <Grant key={grant._id} grantDetails={grant}/>
                    ))}
                  </>
                )
              }
            </div>
          }
          
          {taskDetails.length > 0 &&
            <div>
              <h2>Papers & Authors</h2>
              {taskDetails.map((paper, index) => (
                <Paper key={paper._id} paperDetails={paper} index={index} />
              ))}
            </div>
          }

        </div>

        {task.status === 'Completed' &&
          <div>
            <Button text={'Approve'} className={'btn approve'} onClick={() => updateStatus('Approve')} />
            <Button text={'Reject'} className={'btn reject'} onClick={() => updateStatus('Reject')} />
          </div>}

        {task.status === 'Rejected' &&
          <div>
            <FontAwesomeIcon icon={faCircleXmark} style={{ height: '75px', color: '#e14141', paddingTop: '30px' }} />
            <br />
            <h3 style={{ color: "#e14141" }}>Rejected</h3>
          </div>
        }

        {task.status === 'Approved' &&
          <div>
            <FontAwesomeIcon icon={faCircleCheck} style={{ height: '75px', color: '#10a37f', paddingTop: '30px' }} />
            <br />
            <h3 style={{ color: "#10a37f" }}>Approved</h3>
          </div>
        }
      </div>
  )
}

export default TaskDetails
