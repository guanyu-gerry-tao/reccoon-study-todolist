import '../App.css'


function TaskGap() {


  const handleDragEnter = (e: React.DragEvent<HTMLInputElement>) => {
    if (e.currentTarget instanceof HTMLElement){
      if (e.currentTarget.classList.contains("dragZoneT")) {
        console.log('test T');
      }
      if (e.currentTarget.classList.contains("dragZoneB")) {
        console.log('test B');
      }
    }
  }
  
  const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
    if (e.currentTarget instanceof HTMLElement){
      if (e.currentTarget.classList.contains("dragZoneT")) {
        console.log('Leave test T');
      }
      if (e.currentTarget.classList.contains("dragZoneB")) {
        console.log('Leave test B');
      }
    }
  }

  return (
    <>
      <div className='taskGap relative'>
        <div className='dragZone dragZoneT absolute left-0 bg-amber-100 h-3 w-full'
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}></div>
        <div className='dragZone dragZoneB absolute left-0 bg-amber-300 h-3 w-full'
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}></div>
      </div>
    </>
  )
}

export default TaskGap