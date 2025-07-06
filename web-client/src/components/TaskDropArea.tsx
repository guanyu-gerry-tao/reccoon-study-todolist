import { useEffect } from 'react';

import '../App.css'
import './TaskDropArea.css';

import Tasklist from './TaskList.tsx';

import type { setIsOverDeletedTaskArea } from './type.ts'
import { Droppable } from '@hello-pangea/dnd';


/**
 * TaskDropArea component provides a drop area for tasks in a specific status column.
 * Note: This component is not ready to use. Maybe will be deprecated in the future.
 * @param status - The status of the tasks in this drop area.
 * @param setIsMouseOverDropZone - A function to set the mouse over state for the drop zone.
 */
function TaskDropArea({ status, setIsMouseOverDropZone }:
  { status: number, setIsMouseOverDropZone: any }) {

  // Study Note: Droppable is a component from the @hello-pangea/dnd library that provides a drop area for draggable items.
  // It allows you to define a droppable area where draggable items can be dropped.
  // the 'provided' object contains properties and methods that need to be applied to the droppable area.
  // 'snapshot' provides information about the current state of the droppable area, such as whether it is being dragged over or not. Provided by the Droppable component.
  // 'provided.innerRef' is a ref that needs to be attached to the droppable area to make it droppable. Necessary for the Droppable component to function correctly.
  // 'provided.droppableProps' are the props that need to be spread onto the droppable area to make it droppable. Needed by the Droppable component to function correctly.
  // 'provided.placeholder' is a placeholder that needs to be rendered inside the droppable area to maintain the layout during dragging. Needed by the Droppable component to maintain the layout during dragging.
  // the type='task' indicates that this droppable area is for tasks, which is used to differentiate between different types of draggable items in the application.
  return (
    <>
      <Droppable droppableId={status.toString()} type='task'>
        {(provided, snapshot) => (
          // useEffect is used to set the mouse over state for the drop zone when the snapshot.isDraggingOver changes.
          // This is used to update the state of the drop zone when a task is being dragged
          // Could going to be deprecated in the future.
          useEffect(() => {
            setIsMouseOverDropZone(snapshot.isDraggingOver);
            console.log(snapshot.isDraggingOver);
          }, [snapshot.isDraggingOver]),
          <div className='taskDropArea'
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  )
}

export default TaskDropArea