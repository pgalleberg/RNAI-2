import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const ForgotPassword = ({ setEmail_, email_ }) => {
    const [email, setEmail] = useState(email_)
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault()
        setEmail_(email)
        navigate('/reset-password/send-email')
    }

    return (
        <div style={{width: '320px', position: 'relative'}}>
            <p style={{fontWeight: 'bold', fontSize: '28px'}}>Reset your password</p>
            <p style={{fontSize: '14px', lineHeight: '20px'}}>Enter your email address and we will send you instructions to reset your password.</p>
            <form onSubmit={ onSubmit }  autoComplete="on">
                <div>
                    <input type="email" placeholder="Email" 
                    required style={{width: '285px'}} 
                    // defaultValue={email_}
                    value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div>
                <input type="submit" value="Continue"/>
                </div>
            </form>
            <Link to='/login' className="backLink">Back</Link>
        </div>
    )
}

export default ForgotPassword
