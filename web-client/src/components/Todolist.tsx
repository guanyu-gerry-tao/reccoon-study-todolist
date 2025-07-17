import '../App.css';
import './Todolist.css';
import './TaskDropArea.css';

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { Actions, States, StatusData, StatusType } from '../utils/type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'
import { sortChain } from '../utils/utils.ts';
import { useAppContext } from './AppContext.tsx';

/**
 * Todolist component represents the main todo list interface.
 * It displays the task columns and handles the overall state and actions.
 * @param tasks - The list of tasks to be displayed.
 * @param projects - The list of projects to which tasks belong.
 * @param userStatus - The current user's status information.
 * @param actions - The actions object containing methods to manipulate tasks and projects.
 * @param draggedTask - The currently dragged task information.
 */
function Todolist() {
  // Use the AppContext to access the global state and actions
  const { states, actions } = useAppContext();

  // State to manage the visibility of the delete and complete task drop areas.
  // Not used yet. // TODO: @Bestpart-Irene add the functionality to show/hide the delete and complete task drop areas when the user clicks on the delete or complete task buttons.
  const [isDeletedTaskClicked, setIsDeletedTaskClicked] = useImmer<boolean>(false);

  // State to manage the visibility of the completed task drop area.
  // Not used yet. // TODO: @Bestpart-Irene add the functionality to show/hide the completed task drop area when the user clicks on the complete task button.
  const [isCompletedTaskClicked, setIsCompletedTaskClicked] = useImmer<boolean>(false);

  // State to manage the mouse over state for the drop zone, used to show/hide the drop area visual.
  const [isMouseOverDropZone, setIsMouseOverDropZone] = useImmer(false);

  const statusesSorted = sortChain(states.statuses) as [string, StatusType][];

  return (
    <>
      <div className='todolistContainer'>
        {/* The top menu bar */}
        {/* Contains logos, project, user information */}
        <Menubar />

        {/* The task columns */}
        <div className='todolistColumns'>

          {states.showDeleted && (
            <TodoColumn
              title={"Deleted"}
              bgColor='#ffcce6'
              status={"deleted"}
            />
          )}

          {states.showCompleted && (
            <TodoColumn
              title={"Completed"}
              bgColor='#e6f2ff'
              status={"completed"}
            />
          )}

          {statusesSorted.map(([key, status]) => (
            <TodoColumn key={key} title={status.title}
              bgColor={status.color}
              status={status.id}
            />
          ))}
        </div>

        {/* The right panel for AI chat */}
        {/* This panel is used to interact with the AI chat feature, which can help users with task management and organization. */}
        {/* //TODO: implement the AI chat feature in future */}
        {/* <div className='todolistRightPanel'>
          <AIChatPanel />
        </div> */}

      </div>



    </>
  )
}

export default Todolist