import { useState } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DragDropContextProps } from '@hello-pangea/dnd';
import type { TaskItem } from './components/type.ts';
import {loadInitData} from './data/loadInitData.ts'
import { filter, pre } from 'motion/react-client';

function App() {

  const testInitData = loadInitData();
  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData);
  const [isDragging, setIsDragging] = useState(false);

  const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
    console.log('onDragEnd', result);
    if (!result.destination) {
      console.log('No destination found');
      return;
    }
    setTasks(draft => {
      const task = draft.find(t => t.id === result.draggableId);

      if (task && result.destination){

        // TODO: fix bug of ordering

        const previousStatus = task.status;
        const previousOrder = task.order;
        const resultStatus = Number(result.destination.droppableId);
        const resultIndex = result.destination.index;


        if (previousOrder === resultIndex && previousStatus === resultStatus) {
          console.log('No change in order or status');
          return; // No change in order or status, do nothing
        }

        if (resultIndex > previousOrder) {
          task.order = resultIndex + 0.5; // Adjust order if moving down
        } else {
          task.order = resultIndex - 0.5; // Adjust order if moving up
        }        
        
        if (resultStatus !== previousStatus) {
          task.status = resultStatus; // Update the status of the task
          const prevFiltered = draft.filter(t => t.status === previousStatus).sort((a, b) => a.order - b.order);
          prevFiltered.forEach((t, index) => {
            t.order = index; // Reorder tasks in the previous status
          });
        }
        
        const filtered = draft.filter(t => t.status === resultStatus).sort((a, b) => a.order - b.order);
        filtered.forEach((t, index) => {
          t.order = index; // Reorder tasks in the same status
        });

        //task.order = resultIndex; // Set the new order based on the destination index
        //task.status = resultStatus; // Update the status based on the droppableId
        
        console.log('previousStatus:', previousStatus);
        console.log('resultStatus:', resultStatus);
        console.log('previousOrder:', previousOrder);
        console.log('resultIndex:', resultIndex);
      }
      setIsDragging(false);
    });
    // Handle the drag end logic here
    // For example, update the task order based on the result
  }

  const onDragStart: DragDropContextProps['onDragStart'] = (start) => {
    setIsDragging(true);
  }
    

  return (
    <DragDropContext
    onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className='relative bg-[#fbfbfb] m-4 p-2 rounded-3xl [height:calc(100vh-2rem)]'>
        <Todolist tasks={tasks} setTasks={setTasks}/>
      </div>
    </DragDropContext>
  )
}

export default App