import { useState } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DragDropContextProps } from '@hello-pangea/dnd';
import type { TaskItem } from './components/type.ts';
import {loadInitData} from './data/loadInitData.ts'

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

        task.status = Number(result.destination.droppableId);
        task.order = result.destination.index; // Use a float to allow for gaps

        const filteredTasks = draft
        .filter(t => t.status === task.status)
        .sort((a, b) => a.order - b.order);
        
        filteredTasks.forEach((t, index) => {
          t.order = index;
        });

        console.log(`Task ${task.id} moved to status ${task.status} at order ${task.order}`);
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