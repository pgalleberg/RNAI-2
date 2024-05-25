import { useEffect, useState } from "react"
import Button from "./Button"
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Paper from "./Paper"
import Grant from "./Grant"
import Patent from "./Patent"
import AuthorCard from "./AuthorCard"
import InventorCard from "./InventorCard"

const TaskDetails = () => {
  const { id } = useParams();
  const [taskDetails, setTaskDetails] = useState([])
  const [fundingDetails, setFundingDetails] = useState([])
  const [patentDetails, setPatentDetails] = useState([])
  const [inventors, setInventors] = useState([])
  const [authors, setAuthors] = useState([])
  const [task, setTask] = useState({})
  const [change, setChange] = useState(false)
  const [loading, setLoading] = useState(true)

  let currentTab = sessionStorage.getItem('currentTab');
  if (!currentTab) {
    currentTab = 'funding'
  }
  const [activeTab, setActiveTab] = useState(currentTab)

  useEffect(() => {
    const getTaskDetails = async () => {
      // Start all fetch operations in parallel
      const [taskDetails, fundingDetails, patentDetails, taskFromServer, authors, inventors] = await Promise.all([
        fetchTaskDetails(),
        fetchFundingDetails(),
        fetchPatentDetails(),
        fetchTask(),
        fetchAuthors(),
        fetchInventors()
      ]);

      // Log and set states after all fetches have resolved
      setTaskDetails(taskDetails);
      setFundingDetails(fundingDetails);
      setPatentDetails(patentDetails);
      setTask(taskFromServer);
      setInventors(inventors);
      setAuthors(authors);
      setLoading(false);
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

  const fetchPatentDetails = async () => {
    const url = process.env.REACT_APP_FLASK_WEBSERVER + 'patent_details?id=' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const fetchAuthors = async () => {
    const url = process.env.REACT_APP_FLASK_WEBSERVER + 'authors?id=' + id
    const res = await fetch(url)
    const data = await res.json()

    return data
  }

  const fetchInventors = async () => {
    const url = process.env.REACT_APP_FLASK_WEBSERVER + 'inventors?id=' + id
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
      updateTask()
    }
  }, [task, change])


  return (
    loading ?
      <div className="container">
        <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
      </div>
      :
      <div style={{ width: '75%' }}>
        <h1 style={{ textAlign: 'left' }}>Vertical: {task.query}</h1>
        {/* <hr></hr> */}

        <div className="tab">
          <button className={activeTab === 'funding' ? 'active' : ''} onClick={() => setActiveTab('funding')}>Funding</button>
          <button className={activeTab === 'literature' ? 'active' : ''} onClick={() => setActiveTab('literature')}>Literature</button>
          <button className={activeTab === 'patents' ? 'active' : ''} onClick={() => setActiveTab('patents')}>Patents</button>
          <button className={activeTab === 'people' ? 'active' : ''} onClick={() => setActiveTab('people')}>People</button>
        </div>

        <div className='papers'>

          {activeTab === 'funding' ?
            Object.keys(fundingDetails).length > 0 ?
              <div>
                <h2>Funding Opportunities</h2>
                {
                  fundingDetails[task.query].map((grant) => (
                    <Grant key={grant._id} grantDetails={grant} />
                  ))
                }

                {
                  Object.entries(fundingDetails).map(([search_term, grants]) =>
                    search_term !== task.query &&
                    <>
                      <hr></hr>
                      <h2 style={{ fontSize: '1.25em', }}><i>{search_term}</i></h2>
                      {grants.map((grant) => (
                        <Grant key={grant._id} grantDetails={grant} />
                      ))}
                    </>
                  )
                }
              </div>
              :
              <div className="container" style={{ display: 'block' }}>
                <p style={{ paddingTop: '25vh' }}>Error 404</p>
                <p><i>No contents to display</i></p>
              </div>
            : null
          }

          {activeTab === 'literature' ?
            taskDetails.length > 0 ?
              <div>
                <h2>Papers & Authors</h2>
                {taskDetails.map((paper, index) => (
                  <Paper key={paper.paperId} paperDetails={paper} index={index} />
                ))}
              </div>
              :
              <div className="container" style={{ display: 'block' }}>
                <p style={{ paddingTop: '25vh' }}>Error 404</p>
                <p><i>No contents to display</i></p>
              </div>
            :
            null
          }

          {activeTab === 'patents' ?
            patentDetails.length > 0 ?
              <div>
                <h2>Patents</h2>
                {patentDetails.map((patent, index) => (
                  <Patent key={patent.id} patentDetails={patent} index={index} />
                ))}
              </div>
              :
              <div className="container" style={{ display: 'block' }}>
                <p style={{ paddingTop: '25vh' }}>Error 404</p>
                <p><i>No contents to display</i></p>
              </div>
            : null
          }

          
          {activeTab === 'people' ?
            authors.length > 0 || inventors.length > 0 ?
              <div>
                <h2>Authors</h2>
                <div className='person-grid' >
                  {authors.map((author, index) => (
                    console.log("author::", author),
                    <AuthorCard key={author.id} details={author}/>
                  ))}
                </div>
                <h2>Inventors</h2>
                <div className='person-grid' >
                  {inventors.map((inventor, index) => (
                    console.log("inventor::", inventor),
                    <InventorCard key={inventor.id} details={inventor}/>
                  ))}
                </div>
              </div>
              :
              <div className="container" style={{ display: 'block' }}>
                <p style={{ paddingTop: '25vh' }}>Error 404</p>
                <p><i>No contents to display</i></p>
              </div>
            : null
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
