import { useImmer } from 'use-immer'
import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import {loadInitData} from '../data/loadInitData.ts'

import type { TaskItem, NewTaskItem, TaskActions } from './type.ts'


function Todolist() {


  const testInitData = loadInitData();
  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData);
  const [draggingType, setDraggingType] = useImmer<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useImmer<string | null>(null);

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

  const draggingTask = (id: string) => {
    setDraggingTaskId(id);
    setDraggingType('task');
    console.log(`Dragging task with id: ${id}`);
  }

  const draggingTaskEnd = () => {
    setDraggingTaskId(null);
    setDraggingType(null);
    console.log(`Dragging task ended`);
  }


  const taskActions: TaskActions = {
    addTask: addTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    draggingTask: draggingTask,
    draggingTaskEnd: draggingTaskEnd,
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
        draggingType={draggingType} 
        draggingTaskId={draggingTaskId}
        />
        
        <TodoColumn title={"Working"} 
        bgColor='#f5f3cb' 
        status={2} 
        actions={taskActions} 
        tasks={tasks.filter(task => task.status === 2)} 
        draggingType={draggingType} 
        draggingTaskId={draggingTaskId}
        />
        
        <TodoColumn title={"Finished"} 
        bgColor='#d6f5cb' 
        status={3} 
        actions={taskActions} 
        tasks={tasks.filter(task => task.status === 3)} 
        draggingType={draggingType} 
        draggingTaskId={draggingTaskId}
        />

      </div>
    </>
  )
}

export default Todolist