import { useEffect, useState } from "react";
import Task from "./Task";
import auth from "../firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner} from '@fortawesome/free-solid-svg-icons'
   
const Tasks = () => {

    const user = auth.currentUser;
    const [tasks, setTasks] = useState([])
    const [polling, setPolling] = useState([])
    const [admin, setAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const deleteVertical = async (id) => {
      setTasks(tasks.filter(task => task._id !== id));
      const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'delete_vertical/' + id,{
          method: 'DELETE'
      })
    }

    sessionStorage.removeItem('currentTab');

    useEffect(() => {
        //check if admin
        user.getIdTokenResult()
        .then((idTokenResult) => {
          if (!!idTokenResult.claims.admin) {
            setAdmin(true)
          }
        })
        .catch((error) => {
          console.log(error);
        });

        fetchTasks()
    }, [])

    const fetchTasks = async () => {
      const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'tasks?uid=' + user.uid)
      const data = await res.json()
      data.reverse()
      setTasks(data)
      setLoading(false)
      setPolling(data.some(task => task.status === 'Pending'))
    }

    useEffect(() => {
      let interval = null
      if (polling){
        interval = setInterval(() => {
          fetchTasks()
        }, 10000)
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      }

    }, [polling])

  return (
    loading ?
      <div className="container">
        <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
      </div>
      :
      <div className={admin ? "result-admin" : "result"}>
          <h2>Query</h2>
          {admin && <h2>Submitted By</h2>}
          <h2>Submission Time</h2>
          <h2>Status</h2>
          <h2> </h2>
          <h2> </h2>
          {tasks.map((task) => <Task key={task._id} task={task} admin={admin} onDelete={deleteVertical}/>)}
      </div>
  )
}

export default Tasks
