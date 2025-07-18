import '../App.css';
import './Todolist.css';
import './TaskDropArea.css';

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { Actions, States, StatusData, StatusType } from './type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'
import { sortChain } from '../utils/utils.ts';
import { useState } from 'react';

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
  states,
  actions,
}: {
  states: States,
  actions: Actions,
}) {


  // State to manage the visibility of the delete and complete task drop areas.
  // Not used yet. // TODO: @Bestpart-Irene add the functionality to show/hide the delete and complete task drop areas when the user clicks on the delete or complete task buttons.
  const [isDeletedTaskClicked, setIsDeletedTaskClicked] = useImmer<boolean>(false);

  // State to manage the visibility of the completed task drop area.
  // Not used yet. // TODO: @Bestpart-Irene add the functionality to show/hide the completed task drop area when the user clicks on the complete task button.
  const [isCompletedTaskClicked, setIsCompletedTaskClicked] = useImmer<boolean>(false);

  // State to manage the mouse over state for the drop zone, used to show/hide the drop area visual.
  const [isMouseOverDropZone, setIsMouseOverDropZone] = useImmer(false);

  // State to manage the visibility of the deleted and completed columns.
  const [deletedColumnHide, setDeletedColumnHide] = useState(false);
  const [completedColumnHide, setCompletedColumnHide] = useState(false);

  const statusesSorted = sortChain(states.statuses) as [string, StatusType][];

  // Function to handle the click event for the delete tasks button.
  const handleDeleteTasksClick = () => {
    if (states.showDeleted) {
      //  从true到false先隐藏再去掉hide
      setDeletedColumnHide(true);
      setTimeout(() => actions.setShowDeleted(false), 400);
    } else {
      // 从false到true先显示再去掉hide
      actions.setShowDeleted(true);
      setTimeout(() => setDeletedColumnHide(false), 10);
    }
  };

  const handleCompletedTasksClick = () => {
    if (states.showCompleted) {
      setCompletedColumnHide(true);
      setTimeout(() => actions.setShowCompleted(false), 400);
    } else {
      actions.setShowCompleted(true);
      setTimeout(() => setCompletedColumnHide(false), 10);
    }
  };

  return (
    <>
      <div className='todolistContainer'>
        {/* The top menu bar */}
        {/* Contains logos, project, user information */}
        <Menubar
          actions={{
            ...actions,
            setShowDeleted: handleDeleteTasksClick,
            setShowCompleted: handleCompletedTasksClick,
          }}
          states={states}
        />

        {/* The task columns */}
        <div className='todolistColumns'>

          {states.showDeleted && (
            <TodoColumn
              title={"Deleted"}
              bgColor='#ffcce6'
              status={"deleted"}
              actions={actions}
              states={states}
              className={deletedColumnHide ? 'hide' : ''}
            />
          )}

          {states.showCompleted && (
            <TodoColumn
              title={"Completed"}
              bgColor='#e6f2ff'
              status={"completed"}
              actions={actions}
              states={states}
              className={completedColumnHide ? 'hide' : ''}
            />
          )}

          {statusesSorted.map(([key, status]) => (
            <TodoColumn key={key} title={status.title}
              bgColor={status.color}
              status={status.id}
              actions={actions}
              states={states}
            />
          ))}
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