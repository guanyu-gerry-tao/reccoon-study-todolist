import { useImmer } from 'use-immer'
import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import {loadInitData} from '../data/loadInitData.ts'

import type { TaskItem, NewTaskItem } from './type.ts'


function Todolist() {


  const testInitData = loadInitData();
  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData);

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


  const taskActions = {
    add: addTask,
    update: updateTask,
    delete: deleteTask,
  };

  return (
    <>
      <div className='relative flex flex-row'>
        <Menubar />

        <TodoColumn title={"Planned"} 
        bgColor='#f5dacb' 
        status={1} 
        actions={taskActions} 
        tasks={tasks.filter(task => task.status === 1)}
        />
        
        <TodoColumn title={"Working"} 
        bgColor='#f5f3cb' 
        status={2} 
        actions={taskActions} 
        tasks={tasks.filter(task => task.status === 2)}
        />
        
        <TodoColumn title={"Finished"} 
        bgColor='#d6f5cb' 
        status={3} 
        actions={taskActions} 
        tasks={tasks.filter(task => task.status === 3)}
        />

      </div>
    </>
  )
}

export default Todolist