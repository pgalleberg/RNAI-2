import { useEffect, useState } from "react";
import Task from "./Task";
import auth from "../firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner} from '@fortawesome/free-solid-svg-icons'

console.log("Tasks component initialized")

const Tasks = () => {
    console.log("Tasks component rendered")
    const user = auth.currentUser;
    console.log("user: ", user)
    const [tasks, setTasks] = useState([])
    const [polling, setPolling] = useState([])
    const [admin, setAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    sessionStorage.removeItem('currentTab');

    useEffect(() => {
        console.log("useEffect trigerred")

        //check if admin
        auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          console.log("idTokenResult.claims.admin: ", idTokenResult.claims.admin)
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
      console.log("url: ", process.env.REACT_APP_FLASK_WEBSERVER + 'tasks?uid=' + user.uid)
      const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + 'tasks?uid=' + user.uid)
      console.log("res: ", res)
      const data = await res.json()
    
      console.log("fetchTasks::Tasks: ", data)
      data.reverse()
      console.log("fetchTasks::Tasks reversed: ", data)
      
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
          {tasks.map((task) => <Task key={task._id} task={task} admin={admin}/>)}
      </div>
      
  )
}

export default Tasks
