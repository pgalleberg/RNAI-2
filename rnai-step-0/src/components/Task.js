import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faTimes, faCircleCheck, faCircleXmark, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import AlertDialog from "./AlertDialog";

const Task = ({ task, admin, onDelete }) => {
  return (
    <>
        <span className="result-item">{task.query}</span>
        {admin && <span className="result-item">{task.user.name}</span>}
        <span className="result-item">{task.time}</span>
        
        {
          task.status === "Completed" || task.status === "Approved" || task.status === "Rejected"?
            <Link to={`/task/${task._id}`} className='result-item' 
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

        <span className="result-item">
          <AlertDialog id={task._id} action={onDelete} dialogTitle={"Delete vertical: " + task.query + "?"} dialogContentText={"This action cannot be undone. This will permanently delete the vertical and remove the data from our servers."}/> 
        </span>
    </>
  )
}

export default Task
