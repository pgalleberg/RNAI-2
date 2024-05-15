const Button = ({ text, className, onClick }) => {
  return (
    <>
        <button className={className} onClick={onClick} type="button">{text}</button>
    </>
  )
}

export default Button
