import '../App.css'
import './ProjectContainer.css';

import { useImmer } from 'use-immer';
import { Droppable } from '@hello-pangea/dnd';
import ProjectButton from './ProjectItem.tsx';
import type { Actions, Project, States } from '../utils/type.ts';
import AddNewProject from './AddNewProject.tsx';
import { sortChain } from '../utils/utils.ts';
import { useAppContext } from './AppContext.tsx';
import ProjectItem from './ProjectItem.tsx';

/**
 * ProjectContainer component displays a list of project buttons in a draggable panel.
 * A Project contains many tasks in same theme, for example, to study driving, to study math, etc.
 */
function ProjectContainer() {

  // Use the AppContext to access the global state and actions
  const { states, actions } = useAppContext();

  const handleDragEnd = (result: any) => {
    // Handle the drag end event to reorder projects
    // placeholder for drag end logic, not implemented yet
  };


  /**
   * Get the projects sorted
   * This function find the first project that has no previous project (prev === null),
   * and then iteratively find the next project by following the next link.
   * @returns An array of ProjectItem sorted.
   */

  const projectsSorted = sortChain(states.projects) as [string, Project][];

  // Note: ref: it is specially required by the Droppable component.
  // {...provided.droppableProps}: these are the props required by the Droppable component to make the project panel droppable.
  // provided.placeholder: this is required by the Droppable component to maintain the layout during dragging.
  // without it, the layout will collapse when dragging a project button.
  // the type='project' indicates that this droppable area is for projects, which is used to differentiate between different types of draggable items in the application.
  // projectsSorted.map: this maps over the sorted projects and renders a ProjectButton for each
  return (
    <div className='projectPanelDroppable'>
      {projectsSorted.map((project) => (
        <ProjectItem key={project[0]} projectId={project[0]} />
      ))}

      {/* AddNewProject is added at the end of the project list */}
      <AddNewProject />
    </div>
  )
}

export default ProjectContainer