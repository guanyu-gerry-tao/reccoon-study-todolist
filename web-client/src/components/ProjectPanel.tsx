import '../App.css'

import { Droppable } from '@hello-pangea/dnd'
import ProjectButton from './ProjectButton.tsx'
import type { ProjectItem, TaskActions } from './type'
import AddNewProject from './AddNewProject.tsx'


function ProjectPanel({ 
    taskActions, 
    projects,
    currentProjectID,
    setCurrentProjectID,
    }:
    {
        taskActions: TaskActions,
        projects: ProjectItem[],
        currentProjectID: string,
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
            <Droppable droppableId='projectPanel' type='project' >
                {(provided, snapshot) => (
                    <div className='relative flex flex-col mt-3 h-full bg-amber-300'
                        ref={provided.innerRef}
                        {...provided.droppableProps}>
                        {projectsSorted.map((project) => (
                            <ProjectButton key={project.id} project={project} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} />
                        ))}
                        {provided.placeholder}
                        <AddNewProject taskActions={taskActions} newOrder={newOrder}/>
                    </div>
                )}
            </Droppable>
        </>
    )
}

export default ProjectPanel