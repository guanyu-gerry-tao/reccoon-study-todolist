import { div } from 'motion/react-client';
import '../App.css'
import Task from './Task.tsx';
import TaskGap from './TaskGap.tsx'
import type { TaskItem, TaskActions } from './type.ts';

function Tasklist({tasks, actions, draggingType, draggingTaskId}: 
  {tasks: TaskItem[], actions: TaskActions, draggingType?: string | null, draggingTaskId?: string | null}) {

  const tasksSorted = tasks.sort((a, b) => a.order - b.order);

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (draggingType === 'task' && draggingTaskId) {
      if (e.currentTarget.classList.contains("dragZoneT")) {
        console.log(`Enter div T, who: ${draggingTaskId}, at order: ${e.currentTarget.dataset.order}`);
      }
      if (e.currentTarget.classList.contains("dragZoneB")) {
        console.log(`Enter div B, who: ${draggingTaskId}, at order: ${e.currentTarget.dataset.order}`);
      }
    }
  }
  
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (draggingType === 'task' && draggingTaskId) {
      if (e.currentTarget.classList.contains("dragZoneT")) {
        console.log(`Leave div T, who: ${draggingTaskId}, at order: ${e.currentTarget.dataset.order}`);
      }
      if (e.currentTarget.classList.contains("dragZoneB")) {
        console.log(`Leave div B, who: ${draggingTaskId}, at order: ${e.currentTarget.dataset.order}`);
      }
    }
  }

  return (
    <>
        {tasksSorted.map((task: TaskItem) => (
          <div key={task.id} className='cardContainer relative'>

            <div data-order={task.order} 
            className={`dragZone dragZoneT absolute left-0 h-3 w-full ${task.order === 0 ? 'dragZoneFirst' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}></div>

            <Task taskInfo={task} 
            actions={actions} 
            draggingType={draggingType} 
            draggingTaskId={draggingTaskId}/>

            <div data-order={task.order} 
            className={`dragZone dragZoneB absolute left-0 h-3 w-full ${task.order === tasksSorted.length -1 ? 'dragZoneLast' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}></div>

          </div>
        ))}
    </>
  )
}

export default Tasklist