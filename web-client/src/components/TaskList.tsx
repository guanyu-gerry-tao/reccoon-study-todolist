import { div } from 'motion/react-client';
import '../App.css';
import './Tasklist.css';
import Task from './Task.tsx';
import type { TaskItem, Actions, ProjectItem } from './type.ts';
import { Droppable } from '@hello-pangea/dnd';

/** 
 * Tasklist component provide a container, renders a list of tasks in a specific status column.
 * It uses the Droppable component from the @hello-pangea/dnd library to make the task list droppable.
 * @param status - The status of the tasks in this list.
 * @param tasks - An array of TaskItem objects representing the tasks in this list.
 * @param actions - An object containing functions to manipulate tasks.
 * @param currentProjectID - The ID of the currently selected project, used to filter tasks by project.
 */
function Tasklist({ status,
  tasks,
  actions,
  currentProjectID }: {
    status: number,
    tasks: TaskItem[],
    actions: Actions,
    currentProjectID: string
  }) {

  // Filter tasks by the current project ID (make sure this tasklist only shows tasks from the current project) 
  // and sort them by order
  const tasksSorted = tasks
    .filter(t => t.project === currentProjectID)
    .sort((a, b) => a.order - b.order);

  // Study Note: Droppable is a component from the @hello-pangea/dnd library that provides a drop area for draggable items.
  // It allows you to define a droppable area where draggable items can be dropped.
  // the 'provided' object contains properties and methods that need to be applied to the droppable area.
  // 'snapshot' provides information about the current state of the droppable area, such as whether it is being dragged over or not. Provided by the Droppable component.
  // 'provided.innerRef' is a ref that needs to be attached to the droppable area to make it droppable. Necessary for the Droppable component to function correctly.
  // 'provided.droppableProps' are the props that need to be spread onto the droppable area to make it droppable. Needed by the Droppable component to function correctly.
  // 'provided.placeholder' is a placeholder that needs to be rendered inside the droppable area to maintain the layout during dragging. Needed by the Droppable component to maintain the layout during dragging.
  // the type='task' indicates that this droppable area is for tasks, which is used to differentiate between different types of draggable items in the application.
  return (
    <Droppable droppableId={status.toString()} type='task'>
      {(provided) => (
        <div className='taskListContainer'
          ref={provided.innerRef}
          {...provided.droppableProps}>

          {/* Render the tasks in the task list */}
          {/* tasksSorted.map: this maps over the sorted tasks and renders a Task for each */}
          {tasksSorted.map((task: TaskItem) => (
            <Task key={task.id} taskInfo={task}
              actions={actions} />
          ))}

          {provided.placeholder}

        </div>
      )}
    </Droppable>
  )
}

export default Tasklist