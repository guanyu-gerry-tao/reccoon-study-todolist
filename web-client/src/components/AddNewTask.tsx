import '../App.css'

import type { TaskActions } from './type.ts';
import Dashline from './Dashline.tsx';

import Project from './ProjectButton.tsx'

function AddNewTask({ actions, status, newOrder }: { actions: TaskActions, status: number, newOrder: number }) {

  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      const newTaskTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field
      const newTaskOrder = newOrder;
      if (newTaskTitle) { // Check if the input is not empty
        const newTask = {
          title: newTaskTitle,
          status: status,
          order: newTaskOrder,
          previousStatus: status,
          project: 'default', // Assuming a default project, you can modify this as needed
        };
        actions.addTask(newTask); // Call the add function from actions with the new task
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
      <input type="text" 
      placeholder={"+ add new task"} 
      onKeyDown={handleKeyboard}
      className='relative cursor-default outline-0 pl-4 p-2'/>
    </>
  )
}

export default AddNewTask