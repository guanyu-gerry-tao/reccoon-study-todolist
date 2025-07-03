import { div } from 'motion/react-client';
import '../App.css';
import './Tasklist.css';
import Task from './Task.tsx';
import type { TaskItem, Actions, ProjectItem } from './type.ts';
import { Droppable } from '@hello-pangea/dnd';


function Tasklist({ status, tasks, actions, currentProjectID }:
  { status: number, tasks: TaskItem[], actions: Actions, currentProjectID: string }) {

  const tasksSorted = tasks
    .filter(t => t.project === currentProjectID)
    .sort((a, b) => a.order - b.order);

  return (
    <Droppable droppableId={status.toString()} type='task'>
      {(provided) => (
        <div className='taskListContainer'
          ref={provided.innerRef}
          {...provided.droppableProps}>

          {tasksSorted.map((task: TaskItem) => (
            <Task key={task.id} taskInfo={task}
              actions={actions} />
          ))}

          {provided.placeholder}

        </div>
      )}
    </Droppable>
  )
}

export default Tasklist