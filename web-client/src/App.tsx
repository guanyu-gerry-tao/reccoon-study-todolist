import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DragDropContextProps } from '@hello-pangea/dnd';
import type { TaskItem, NewTaskItem, TaskActions, Projects } from './components/type.ts';
import { loadInitData, loadProjects, loadTestUserData } from './data/loadInitData.ts'


function App() {

  const testInitData = loadInitData();
  const testProjectsData = loadProjects();
  const testUserData = loadTestUserData(); 

  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData);
  const [projects, setProjects] = useImmer<Projects>(testProjectsData);
  const [userStatus, setUserStatus] = useImmer(testUserData);
  const [draggedTask, setDraggedTask] = useImmer<[string] | null>(null);
  

  const addTask = (newTask: NewTaskItem) => {
    setTasks(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newTask, id });
      console.log(`Task added with id: ${id}`);

      const filtered = draft.filter(t => t.status === newTask.status).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    });
  };

  const updateTask = (id: string, updatedFields: Partial<TaskItem>) => {
    setTasks(draft => {
      const task = draft.find(task => task.id === id);
      if (task) {
        Object.assign(task, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
      const filtered = draft.filter(t => t.status === task?.status).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    });
  };

  const deleteTask = (id: string) => {
    setTasks(draft => {
      const index = draft.findIndex(task => task.id === id);
      const deletedTask = draft[index];
      if (index !== -1) {
        draft[index].status = -2;
      }
      const filtered = draft.filter(t => t.status === deletedTask.previousStatus).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    })
  };

  const refreskTasks = () => {
    // This function can be used to refresh the tasks from the server or local storage
  };
  

  const taskActions: TaskActions = {
    addTask: addTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    refreshTasks: refreskTasks,
  };

  const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {

    console.log('onDragEnd', result);
    if (result.destination){
      setTasks(draft => {
        const task = draft.find(t => t.id === result.draggableId);

        if (task && result.destination) {
          const previousStatus = task.status;
          const previousOrder = task.order;
          const resultStatus = Number(result.destination.droppableId);
          const resultIndex = result.destination.index;
  
  
          // If the task is moving within the same status
          if (resultStatus === previousStatus && resultIndex !== previousOrder) {
            if (resultIndex > previousOrder) { // If moving down (3 to 5 ex.), move 4, 5 to 3, 4
              draft.filter(t => t.status === resultStatus && 
                t.order > previousOrder && 
                t.order <= resultIndex)
                .forEach(t => {
                  t.order -= 1
                })
            } else { // If moving up (5 to 3 ex.), move 3, 4 to 4, 5
              draft.filter(t => t.status === resultStatus && 
                t.order >= resultIndex && 
                t.order < previousOrder)
                .forEach(t => {
                  t.order += 1
                })
            }
          }
  
          // If the task is moving to a different status
          if (resultStatus !== previousStatus) {
            draft.filter(t => t.status === previousStatus && 
              t.order > previousOrder)
              .forEach(t => {
                t.order -= 1; // Decrease order of tasks in the previous status
              });
            draft.filter(t => t.status === resultStatus && 
              t.order >= resultIndex)
              .forEach(t => {
                t.order += 1; // Increase order of tasks in the new status
              });
          }
          
          // Update the task's order and status
          task.order = resultIndex; 
          task.status = resultStatus; 
          
          console.log('previousStatus:', previousStatus);
          console.log('resultStatus:', resultStatus);
          console.log('previousOrder:', previousOrder);
          console.log('resultIndex:', resultIndex);
        }
      });
    } else {
      // If the task was dropped outside of a droppable area, handle it here
    }
    setDraggedTask(null);

    console.log('onDragEnd completed');
  }

  const onDragStart: DragDropContextProps['onDragStart'] = (start) => {
    setDraggedTask([start.draggableId]);
  }
  



  const prevDroppableId = useRef<string | null>(null);

  const onDragUpdate: DragDropContextProps['onDragUpdate'] = (update) => {
    const current = update.destination?.droppableId || null;

    if (current !== prevDroppableId.current) {
      if (prevDroppableId.current === '-1') { // exit delete-zone
        document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
          // Remove the class indicating the draggable is over the delete area
        });
      }

      if (current === '-1') { // enter delete-zone
        document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
          // Add a class to indicate the draggable is over the delete area
        });
      }

      if (prevDroppableId.current !== null && current === null) { // exit all Droppable
        // places to handle when the draggable is not over any droppable area
      }
      prevDroppableId.current = current;
    }
  }
  


  return (
    <DragDropContext
    onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
      <Todolist tasks={tasks} projects={projects} userStatus={userStatus} taskActions={taskActions} draggedTask={draggedTask}
       />
    </DragDropContext>
  )
}

export default App