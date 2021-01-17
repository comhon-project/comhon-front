import './CcButton.css';

function CcButton(props) {
  return (
    <button {...props} className={'my-button '+props.className}/>
  )
}

export default CcButton;
