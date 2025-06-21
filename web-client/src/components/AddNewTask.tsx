import '../App.css'

import type { TaskActions } from './type.ts';

import Project from './Project.tsx'

function AddNewTask({ actions, status }: { actions: TaskActions, status: 'planned' | 'working' | 'finished' }) {

  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      const newTaskTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field
      if (newTaskTitle) { // Check if the input is not empty
        const newTask = {
          title: newTaskTitle,
          status: status,
        };
        actions.add(newTask); // Call the add function from actions with the new task
        e.currentTarget.value = ''; // Clear the input field after adding the task
      }
    }
    if (e.key === 'Escape') { // Check if the Escape key is pressed: this will clear the input field
      e.currentTarget.value = ''; // Clear the input field
      e.currentTarget.blur(); // Remove focus from the input field
    }
  };

  return (
    <>
      <div></div>
      <input type="text" placeholder={"+ add new task"} onKeyDown={handleKeyboard}/>
    </>
  )
}

export default AddNewTask