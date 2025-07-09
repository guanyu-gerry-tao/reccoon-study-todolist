import '../App.css'
import './AddNewProject.css'

import type { Actions, ProjectItem } from './type.ts'

/**
 * AddNewProject component allows users to add a new project by typing in an input field.
 * @actions - The actions object containing methods to manipulate projects.
 * @projects - The list of existing projects, used to determine the order of the new project.
 */
function AddNewProject({
  actions,
  projects
}: {
  actions: Actions,
  projects: [string, ProjectItem][]
}) {

  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      console.log('Enter pressed');
      const newProjectTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field

      if (newProjectTitle) { // Check if the input is not empty
        const newProject = {
          title: newProjectTitle,
          prev: projects.length > 0 ? projects[projects.length - 1][0] : null, // Set the previous project to the last project in the list or null if no projects exist
          next: null, // Set the next project to null initially
        };
        actions.addProject(newProject); // Call the add function from actions with the new task
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
        className='addNewProjectInput' />
    </>
  )
}

export default AddNewProject