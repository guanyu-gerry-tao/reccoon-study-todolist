import '../App.css'
import './AddNewProject.css'

import type { Actions } from './type.ts'

/**
 * AddNewProject component allows users to add a new project by typing in an input field.
 * @actions - The actions object containing methods to manipulate projects.
 * @newOrder - The order number for the new project, used to determine its position in the project list.
 */
function AddNewProject({
  actions,
  newOrder
}: {
  actions: Actions,
  newOrder: number
}) {

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