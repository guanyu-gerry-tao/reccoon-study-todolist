import '../App.css'
import './ProjectPanel.css';

import { useImmer } from 'use-immer';
import { Droppable } from '@hello-pangea/dnd';
import ProjectButton from './ProjectButton.tsx';
import type { Actions, States } from './type';
import AddNewProject from './AddNewProject.tsx';
import { sortChain } from '../utils/utils.ts';

/**
 * ProjectPanel component displays a list of project buttons in a draggable panel.
 * A Project contains many tasks in same theme, for example, to study driving, to study math, etc.
 */
function ProjectPanel({
  actions,
  states,
}:
  {
    actions: Actions,
    states: States
  }) {

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

  const projectsSorted = sortChain(states.projects);


  // Note: ref: it is specially required by the Droppable component.
  // {...provided.droppableProps}: these are the props required by the Droppable component to make the project panel droppable.
  // provided.placeholder: this is required by the Droppable component to maintain the layout during dragging.
      // without it, the layout will collapse when dragging a project button.
  // the type='project' indicates that this droppable area is for projects, which is used to differentiate between different types of draggable items in the application.
  // projectsSorted.map: this maps over the sorted projects and renders a ProjectButton for each
  return (
    <>
      <Droppable droppableId='projectPanel' type='project' >
        {(provided, snapshot) => (
          <div className='projectPanelDroppable'
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {projectsSorted.map((project) => (
              <ProjectButton key={project[0]} projects={projectsSorted} project={project} currentProjectID={states.currentProjectID} actions={actions} states={states} />
            ))}
            {provided.placeholder}

            {/* AddNewProject is added at the end of the project list */}
            <AddNewProject actions={actions} states={states} projects={projectsSorted} />
          </div>
        )}
      </Droppable>
    </>
  )
}

export default ProjectPanel