import '../App.css'

import type { TaskActions } from './type.ts';
import Dashline from './Dashline.tsx';

import Project from './ProjectButton.tsx'

function AddNewProject({ taskActions, newOrder }: 
  { taskActions: TaskActions, newOrder: number }) {

  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      console.log('Enter pressed');
      const newProjectTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field
      const newProjectOrder = newOrder;
      if (newProjectTitle) { // Check if the input is not empty
        const newProject = {
          title: newProjectTitle,
          order: newProjectOrder,
        };
        taskActions.addProject(newProject); // Call the add function from actions with the new task
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
      placeholder={"+ add new project"} 
      onKeyDown={handleKeyboard}
      className='relative cursor-default outline-0 pl-4 p-2'/>
    </>
  )
}

export default AddNewProject