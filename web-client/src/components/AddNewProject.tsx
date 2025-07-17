import '../App.css'
import './AddNewProject.css'

import type { Actions, ProjectType, States } from '../utils/type.ts'
import { createBackup, createBulkPayload, restoreBackup } from '../utils/utils'
import { useAppContext } from './AppContext.tsx';

/**
 * AddNewProject component allows users to add a new project by typing in an input field.
 * @actions - The actions object containing methods to manipulate projects.
 * @projects - The list of existing projects, used to determine the order of the new project.
 */
function AddNewProject({ projects }: { projects: [string, ProjectType][] }) {

  // Use the AppContext to access the global state and actions
  const { states, setStates, actions } = useAppContext();

  const handleKeyboard = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      console.log('Enter pressed');
      const newProjectTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field

      if (newProjectTitle) { // Check if the input is not empty
        const newProject = {
          title: newProjectTitle,
          prev: projects.length > 0 ? projects[projects.length - 1][0] : null, // Set the previous project to the last project in the list or null if no projects exist
          next: null, // Set the next project to null initially
          userId: states.userProfile.id, // Assuming the user ID is available in the states
        };
        
        const bulkPayload = createBulkPayload(); // Create a bulk payload for the new project
        const backup = createBackup(states, bulkPayload); // Create a backup of the current state
        actions.addProject(newProject, backup); // Call the addProject function from actions with the new project
        try {
          await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(backup), // Send the new project to the server
          });
        } catch (error) {
          console.error('Error adding new project:', error);
          restoreBackup(setStates, backup); // Restore the previous state in case of an error
        }

        setStates.setCurrentProjectID(newProjectTitle); // Set the current project ID to the newly added project
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