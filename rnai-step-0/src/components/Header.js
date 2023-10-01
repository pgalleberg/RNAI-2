import RNAILogo from '../RNAI_logo_II.png';
import { useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <img 
        onClick={() => {navigate("/")}}
        src={RNAILogo} className="img" alt='RNAI logo'
        style={{marginTop: location.pathname === '/' && '-30px'}}
      />
    </>
  )
}

export default Header
