import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const Task = ({ task }) => {
  console.log("Task rendered")
  return (
    <>
        <span className="result-item">{task.query}</span>
        <span className="result-item">{task.time}</span>
        {/* <Link to=""></Link> */}
        <Link to={`/task/${task.id}`} className='result-item' 
            style={{color: task.status == "Completed" ? '#10a37f' : 'black'}}>
            <span>{task.status} &nbsp;&nbsp;</span>
        </Link>
        <span className="result-item" style={{textAlign: 'left'}}>
            {task.status === "Pending" && <FontAwesomeIcon icon={faSpinner} spin size="xs"/>}
            {task.status === "Completed" && <FontAwesomeIcon icon={faCheck} size="xs" style={{color: '#10a37f'}}/>}
            {task.status === "Failed" && <FontAwesomeIcon icon={faTimes} style={{color: "#e14141"}} />}
        </span>
    </>
  )
}

export default Task
