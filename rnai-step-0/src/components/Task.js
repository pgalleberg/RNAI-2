import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faTimes, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const Task = ({ task, admin }) => {
  console.log("Task rendered")
  return (
    <>
        <span className="result-item">{task.query}</span>
        {admin && <span className="result-item">{task.user}</span>}
        <span className="result-item">{task.time}</span>
        
        {
          task.status === "Completed" || task.status === "Approved" || task.status === "Rejected"?
            <Link to={`/task/${task.id}`} className='result-item' 
              style={{color: task.status === "Rejected" ?'#e14141' : "#10a37f"}}>
              <span>{task.status} &nbsp;&nbsp;</span>
            </Link>
          : <span className='result-item'>{task.status} &nbsp;&nbsp;</span>
        }
        
        
        <span className="result-item" style={{textAlign: 'left'}}>
            {task.status === "Pending" && <FontAwesomeIcon icon={faSpinner} spin size="xs"/>}
            {task.status === "Completed" && <FontAwesomeIcon icon={faCheck} size="xs" style={{color: '#10a37f'}}/>}
            {task.status === "Approved" && <FontAwesomeIcon icon={faCircleCheck} size="xs" style={{color: '#10a37f'}}/>}
            {task.status === "Failed" && <FontAwesomeIcon icon={faTimes} size="xs" style={{color: "#e14141"}} />}
            {task.status === "Rejected" && <FontAwesomeIcon icon={faCircleXmark} size="xs" style={{color: "#e14141"}} />}
        </span>
    </>
  )
}

export default Task
