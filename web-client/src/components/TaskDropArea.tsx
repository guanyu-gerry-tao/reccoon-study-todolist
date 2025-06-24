
import { useEffect } from 'react';
import '../App.css'
import Tasklist from './TaskList.tsx';

import type { setIsOverDeletedTaskArea } from './type.ts'
import { Droppable } from '@hello-pangea/dnd';



function TaskDropArea({ status, setIsMouseOverDropZone }: 
  {  status: number, setIsMouseOverDropZone: any }) {   

  return (
    <>
      <Droppable droppableId={status.toString()} type='task'> 
        {(provided, snapshot) => (
          useEffect(() => {
            setIsMouseOverDropZone(snapshot.isDraggingOver);
          }, [snapshot.isDraggingOver]),
          <div className='relative h-full w-full'
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