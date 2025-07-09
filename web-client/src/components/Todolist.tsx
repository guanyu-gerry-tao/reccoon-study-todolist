import '../App.css';
import './Todolist.css';
import './TaskDropArea.css';

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { TaskItem, Actions, Projects, UserStatus, ProjectItem } from './type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'

/**
 * Todolist component represents the main todo list interface.
 * It displays the task columns and handles the overall state and actions.
 * @param tasks - The list of tasks to be displayed.
 * @param projects - The list of projects to which tasks belong.
 * @param userStatus - The current user's status information.
 * @param actions - The actions object containing methods to manipulate tasks and projects.
 * @param draggedTask - The currently dragged task information.
 */
function Todolist({
  tasks,
  projects,
  userStatus,
  actions,
  draggedTask }: {
    tasks: Record<string, TaskItem>,
    projects: Record<string, ProjectItem>,
    userStatus: UserStatus,
    actions: Actions,
    draggedTask: [string] | null
  }) {

  // State to manage the current project ID, which is used to filter tasks by project.
  const [currentProjectID, setCurrentProjectID] = useImmer<string>(userStatus.project);

  // State to manage the visibility of the delete and complete task drop areas.
  // Not used yet. // TODO: @Bestpart-Irene add the functionality to show/hide the delete and complete task drop areas when the user clicks on the delete or complete task buttons.
  const [isDeletedTaskClicked, setIsDeletedTaskClicked] = useImmer<boolean>(false);

  // State to manage the visibility of the completed task drop area.
  // Not used yet. // TODO: @Bestpart-Irene add the functionality to show/hide the completed task drop area when the user clicks on the complete task button.
  const [isCompletedTaskClicked, setIsCompletedTaskClicked] = useImmer<boolean>(false);

  // State to manage the mouse over state for the drop zone, used to show/hide the drop area visual.
  const [isMouseOverDropZone, setIsMouseOverDropZone] = useImmer(false);

  return (
    <>

      <div className='dropArea completeDropArea'>
        <TaskDropArea status={0} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual completeDropArea'
          style={{ opacity: isMouseOverDropZone ? '1' : '0', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)' }}
        >
          <p>Drop to Complete</p>
        </div>
      </div>
      <div className='dropArea deleteDropArea'
      >
        <TaskDropArea status={-1} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual deleteDropArea'
          style={{ opacity: isMouseOverDropZone ? '1' : '0.5', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)' }}
        >
          <p>Drop to Delete</p>
        </div>
      </div>


      <div className='todolistContainer'>
        {/* The top menu bar */}
        {/* Contains logos, project, user information */}
        <Menubar actions={actions} draggedTask={draggedTask} projects={projects} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} isMouseOverDropZone={isMouseOverDropZone} />

        {/* The task columns */}
        <div className='todolistColumns'>

          <TodoColumn title={"Now"}
            bgColor='#e8fdec'
            status={1}
            actions={actions}
            tasks={Object.fromEntries(Object.entries(tasks).filter(([_, task]) => task.status === 1 && task.project === currentProjectID))}
            currentProjectID={currentProjectID}
          />

          <TodoColumn title={"Next"}
            bgColor='#f0f1fd'
            status={2}
            actions={actions}
            tasks={Object.fromEntries(Object.entries(tasks).filter(([_, task]) => task.status === 2 && task.project === currentProjectID))}
            currentProjectID={currentProjectID}
          />

          <TodoColumn title={"Later"}
            bgColor='#fff8e8'
            status={3}
            actions={actions}
            tasks={Object.fromEntries(Object.entries(tasks).filter(([_, task]) => task.status === 3 && task.project === currentProjectID))}
            currentProjectID={currentProjectID}
          />
        </div>

        {/* The right panel for AI chat */}
        {/* This panel is used to interact with the AI chat feature, which can help users with task management and organization. */}
        {/* //TODO: implement the AI chat feature in future */}
        <div className='todolistRightPanel'>
          <AIChatPanel />
        </div>

      </div>



    </>
  )
}

export default Todolist