import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'

import type { TaskItem, NewTaskItem, TaskActions } from './type.ts'

type setTasks = (updater: (draft: TaskItem[]) => void) => void;
function Todolist({tasks, setTasks}: {tasks: TaskItem[], setTasks: setTasks} ) {

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
  
  const taskActions: TaskActions = {
    addTask: addTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
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