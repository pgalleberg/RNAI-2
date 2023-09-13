import RNAILogo from '../RNAI_logo_II.png';
import { useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  return (
    <>
      <img 
        src={RNAILogo} className="img" 
        style={{marginTop: location.pathname === '/' && '-30px'}}
      />
    </>
  )
}

export default Header
