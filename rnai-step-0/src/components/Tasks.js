import { useEffect, useState } from "react";
import Task from "./Task";
import auth
 from "../firebase";
console.log("Tasks component initialized")

const Tasks = () => {
    console.log("Tasks component rendered")
    const [tasks, setTasks] = useState([])
    const [admin, setAdmin] = useState(false)

    useEffect(() => {
        console.log("useEffect trigerred")

        //check if admin
        auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          // Confirm the user is an Admin.
          console.log("idTokenResult.claims.admin: ", idTokenResult.claims.admin)
          if (!!idTokenResult.claims.admin) {
            // Show admin UI.
            // showAdminUI();
            setAdmin(true)
            console.log("admin set to true")
          } 
        })
        .catch((error) => {
          console.log(error);
        });

        const getTasks = async () => {
          const tasksFromServer = await fetchTasks()
          setTasks(tasksFromServer)
        }

        getTasks()
    }, [])

    const fetchTasks = async () => {
      console.log("url: ", process.env.REACT_APP_MOCK_WEBSERVER + 'tasks')
      const res = await fetch(process.env.REACT_APP_MOCK_WEBSERVER + 'tasks')
      console.log("res: ", res)
      const data = await res.json()
    
      console.log("fetchTasks::Tasks: ", data)
      data.reverse()
      console.log("fetchTasks::Tasks reversed: ", data)
      
      return data
    }

  return (
    <div className={admin ? "result-admin" : "result"}>
        <h2>Query</h2>
        {admin && <h2>Submitted By</h2>}
        <h2>Submission Time</h2>
        <h2>Status</h2>
        <h2> </h2>
        {tasks.map((task) => <Task key={task.id} task={task} admin={admin}/>)}
    </div>
  )
}

export default Tasks
