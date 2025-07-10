function ResetTestButton({ resetData }: any) {

  const handleClick = () => {
    // Reset the data by calling the resetData function passed as a prop
  }

  return (
    <>
      <div style={{ position: 'fixed', top: '10px', right: '10px', cursor: 'pointer', }} onClick={handleClick}>
        <h1>reset data</h1>
      </div>
    </>
  )
}

export default ResetTestButton;