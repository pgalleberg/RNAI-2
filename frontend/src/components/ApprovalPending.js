import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";


const ApprovalPending = () => {

  return (
    <div>
        <FontAwesomeIcon icon={faTriangleExclamation} color="red" size='3x'/>
        <p style={{color: '', fontSize: '', textAlign: ''}}>     
            &nbsp;&nbsp;Contact administrator for access
        </p>

        <br></br>
        <br></br>

        <Link to='/login' style={{fontSize: '20px'}}>Back to Log In</Link>

    </div>
  )
}

export default ApprovalPending
