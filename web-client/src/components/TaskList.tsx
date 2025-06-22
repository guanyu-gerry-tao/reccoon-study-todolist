import { div } from 'motion/react-client';
import '../App.css'
import Task from './Task.tsx';
import TaskGap from './TaskGap.tsx'
import type { TaskItem, TaskActions } from './type.ts';


function Tasklist({tasks, actions}: {tasks: TaskItem[], actions: TaskActions}) {

  const tasksSorted = tasks.sort((a, b) => a.order - b.order);

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    console.log(e.dataTransfer.getData('text/drag-source'))
    if (e.target instanceof HTMLElement){
      if (e.currentTarget.classList.contains("dragZoneT") && e.target.classList.contains('Card')) {
        console.log('test T');
      }
      if (e.currentTarget.classList.contains("dragZoneB") && e.target.classList.contains('Card')) {
        console.log('test B');
      }
    }
  }
  
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (e.target instanceof HTMLElement){
      if (e.currentTarget.classList.contains("dragZoneT") && e.target.classList.contains('Card')) {
        console.log('Leave test T');
      }
      if (e.currentTarget.classList.contains("dragZoneB") && e.target.classList.contains('Card')) {
        console.log('Leave test B');
      }
    }
  }

  return (
    <>
        {tasksSorted.map((task: TaskItem) => (
          <div key={task.id} className='cardContainer relative'>

            <div className={`dragZone dragZoneT absolute left-0 h-3 w-full ${task.order === 0 ? 'dragZoneFirst' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}></div>

            <Task taskInfo={task} actions={actions} />

            <div className={`dragZone dragZoneB absolute left-0 h-3 w-full ${task.order === tasksSorted.length -1 ? 'dragZoneLast' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}></div>

          </div>
        ))}
    </>
  )
}

export default Tasklist