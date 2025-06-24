
import '../App.css'
import Tasklist from './TaskList.tsx';

import type { setIsOverDeletedTaskArea } from './type.ts'
import { Droppable } from '@hello-pangea/dnd';

function TaskDropArea({ status, draggedTask }: 
  {  status: number, draggedTask: [string] | null }) {

  if (draggedTask)  {
    draggedTask.forEach(taskId => {
      console.log(`Task with id ${taskId} is being dragged.`);
    });
  }

   

  return (
    <>
      <Droppable droppableId={status.toString()}>
        {(provided) => (
          <div
            className={`deletedDropArea `}
            ref={provided.innerRef}
            {...provided.droppableProps}>
              <div className={`deletedDropAreaVisual ${draggedTask ? '' : 'hide'}`}>
                <span>Drop to delete</span> 
              </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  )
}

export default TaskDropArea