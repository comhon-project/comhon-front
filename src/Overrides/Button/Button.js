import './Button.css';

function Button(props) {
  return (
    <button className='my-button'>
      {props.children}
    </button>
  )
}

export default Button;
