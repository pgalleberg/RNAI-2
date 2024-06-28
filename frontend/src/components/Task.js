import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faTimes, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import AlertDialog from "./AlertDialog";
import { useContext } from 'react';
import { GlobalContext } from '../context/globalContext';
import { Box } from '@mui/material';

const Task = ({ task, admin, onDelete }) => {
  const {setVerticalId} = useContext(GlobalContext);
  const navigate = useNavigate()

  const handleClick = () => {
    setVerticalId(task._id)
    localStorage.setItem('vertical_id',task._id)
    navigate(`/people/${task._id}`)
  }

  return (
    <>
        <span className="result-item">{task.query}</span>
        {admin && <span className="result-item">{task.user.name}</span>}
        <span className="result-item">{task.time}</span>
        
        {
          task.status === "Completed" || task.status === "Approved" || task.status === "Rejected"?
            <Box onClick={handleClick} className='result-item' 
              style={{color: task.status === "Rejected" ?'#e14141' : "#10a37f"}}>
              <span>{task.status} &nbsp;&nbsp;</span>
            </Box>
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
