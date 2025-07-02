import '../App.css'

import { useImmer } from 'use-immer';
import { Droppable } from '@hello-pangea/dnd';
import ProjectButton from './ProjectButton.tsx';
import type { ProjectItem, Actions } from './type';
import AddNewProject from './AddNewProject.tsx';


function ProjectPanel({
  actions,
  projects,
  currentProjectID,
  projectDeleteMode,
  setCurrentProjectID,
}:
  {
    actions: Actions,
    projects: ProjectItem[],
    currentProjectID: string,
    projectDeleteMode: boolean,
    setCurrentProjectID: (projectID: string) => void
  }) {
  // This component renders the project panel with draggable project buttons.

  const handleDragEnd = (result: any) => {
    // Handle the drag end event to reorder projects
  };

  console.log(projects);
  const projectsSorted = [...projects].sort((a, b) => a.order - b.order);

  const newOrder = projects.length;
  

  return (
    <>

      <div className='relative flex flex-col flex-grow hide-x-scrollbar scroll-y-auto-fade'>

        <Droppable droppableId='projectPanel' type='project' >
          {(provided, snapshot) => (
            <div className='relative flex flex-col mt-3 h-full'
              ref={provided.innerRef}
              {...provided.droppableProps}>
              {projectsSorted.map((project) => (
                <ProjectButton key={project.id} projects={projects} project={project} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} actions={actions} deleteMode={projectDeleteMode} />
              ))}
              {provided.placeholder}
              <AddNewProject actions={actions} newOrder={newOrder} />
            </div>
          )}
        </Droppable>
      </div>
    </>
  )
}

export default ProjectPanel