import { div } from 'motion/react-client';
import '../App.css'
import Task from './Task.tsx';
import type { TaskItem, TaskActions } from './type.ts';
import { Droppable } from '@hello-pangea/dnd';


function Tasklist({status, tasks, actions}: 
  {status: number, tasks: TaskItem[], actions: TaskActions}) {

  const tasksSorted = tasks.sort((a, b) => a.order - b.order);

  return (
    <div className='relative flex flex-col gap-2'>
          <Droppable droppableId={status.toString()}>
            {(provided) => (
              <div
              className='relative min-h-10'
                ref={provided.innerRef}
                {...provided.droppableProps}>

                {tasksSorted.map((task: TaskItem) => (
                  <Task key={task.id} taskInfo={task} 
                  actions={actions} />)
                )}
                {provided.placeholder} 
                </div>
              )}
          </Droppable>
    </div>
  )
}

export default Tasklist