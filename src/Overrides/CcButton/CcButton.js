import './CcButton.css';

function CcButton(props) {
  return (
    <button className='my-button'>
      {props.children}
    </button>
  )
}

export default CcButton;
