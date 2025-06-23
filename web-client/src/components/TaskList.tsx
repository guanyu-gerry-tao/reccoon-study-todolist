import { div } from 'motion/react-client';
import '../App.css'
import Task from './Task.tsx';
import TaskGap from './TaskGap.tsx'
import type { TaskItem, TaskActions } from './type.ts';
import { Droppable } from '@hello-pangea/dnd';

function Tasklist({status, tasks, actions, draggingType, draggingTaskId}: 
  {status: number, tasks: TaskItem[], actions: TaskActions, draggingType?: string | null, draggingTaskId?: string | null}) {

  const tasksSorted = tasks.sort((a, b) => a.order - b.order);

  return (
          <Droppable droppableId={status.toString()}>
            {(provided) => (
              <div
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
  )
}

export default Tasklist