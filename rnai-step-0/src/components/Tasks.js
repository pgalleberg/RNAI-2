import { useEffect, useState } from "react";
import Task from "./Task";

class Task_ {
    constructor(id, query, user, status, time){
      this.id = id;
      this.query = query;
      this.user = user;
      this.status = status;
      this.time = time
    }
  }

  console.log("Tasks component initialized")

const Tasks = () => {
    console.log("Tasks component rendered")

    const [tasks, setTasks] = useState([])

    const queries = ['methane removal from ambient air', 'science of reading', 'bio-inspired burrowing robots', 'quantum computing', 'solar energy']
    const statuses = ['Pending', 'Pending', 'Pending', 'Failed', 'Completed', ]

    const getTasks = () => {
      var newTasks = []
      for (var i=0; i<5; i++){
        const now = new Date();
        console.log(now.toUTCString()); // Outputs the date in UTC format
        const task = new Task_(i, queries[i], i, statuses[i], now.toLocaleString())
        newTasks.push(task)
      }
      setTasks(newTasks)
    }

    useEffect(() => {
        console.log("useEffect trigerred")
        getTasks()
    }, [])

    // useEffect(() => {
    //     console.log("Updated tasks:", tasks);
    // }, [tasks]);

  return (
    <div className="result">
        <h2 className="result-heading">Query</h2>
        <h2 className="result-heading">Submission Time</h2>
        <h2 className="result-heading">Status</h2>
        <h2 className="result-heading"></h2>
        {tasks.map((task) => <Task key={task.id} task={task}/>)}
    </div>
  )
}

export default Tasks
