import '../App.css'

import type { TaskActions } from './type.ts';

import Project from './Project.tsx'

function AddNewTask({ actions, status }: { actions: TaskActions, status: 'planned' | 'working' | 'finished' }) {

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newTaskTitle = e.currentTarget.value.trim();
      if (newTaskTitle) {
        const newTask = {
          title: newTaskTitle,
          status: status,
        };
        actions.add(newTask);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <>
      <div></div>
      <input type="text" placeholder={"+ add new task"} onKeyDown={handleAddTask}/>
    </>
  )
}

export default AddNewTask