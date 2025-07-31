import '../App.css'
import './TodoColumn.css';

import AddNewTask from './AddNewTask.tsx';
import type { TaskType, StatusId, TaskId } from '../utils/type.ts';
import Task from './Task.tsx';
import { Droppable } from '@hello-pangea/dnd';
import { sortChain } from '../utils/utils.ts';
import { useAppContext } from './AppContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

/**
 * TodoColumn component represents a single column in the Kanban board.
 * It displays tasks for a specific status (e.g., "To Do", "In Progress", "Done").
 * @param title - The title of the column (e.g., "To Do", "In Progress", "Done").
 * @param bgColor - The background color of the column.
 * @param status - The status of the tasks in this column (e.g., 0 for "To Do", 1 for "In Progress", 2 for "Done").
 * @param actions - The actions object containing methods to manipulate tasks (e.g., add, update, delete tasks).
 * @param currentProjectID - The ID of the current project to which the tasks belong.
 */
function TodoColumn({
  title,
  bgColor,
  status,
}: {
  title: string;
  bgColor: string;
  status: StatusId;
}) {

  // Use the AppContext to access the global state and actions
  const { states } = useAppContext();

  const tasks = Object.fromEntries(Object.entries(states.tasks).filter(([_, task]) => task.status === status && task.projectId === states.userProfile.lastProjectId));
  console.log("tasks in TodoColumn", tasks);
  const tasksSorted = sortChain(tasks) as [TaskId, TaskType][];

  // This counts the number of tasks in the current column, which is used to determine the order of the new task.

  return (
    <>
      <motion.div className="todoColumnCard"
        id={`${status}Container`}
        style={{
          backgroundColor: bgColor,
          borderColor: (status === "completed" || status === "deleted") ? 'black' : bgColor,
          transformOrigin: "left center",
        }}
        layout
        layoutId={`${status}Container`}
        transition={{ type: 'tween', stiffness: 300, damping: 30 }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        exit={{ scaleX: 0, opacity: 0 }}
      >

        <motion.div className='taskList'
          layout
          layoutId={`${status}TaskList`}
          transition={{ type: false }}
        >
          <h1 className='todoColumnTitle'>{title}</h1>

          <div className='todoColumnContent'>

            <Droppable droppableId={status.toString()} type='task'
              isDropDisabled={(status === 'completed' && !states.showCompleted) || (status === 'deleted' && !states.showDeleted)}>
              {(provided) => (
                <div className='taskListContainer'
                  ref={provided.innerRef}
                  {...provided.droppableProps}>


                  {/* Render the tasks in the task list */}
                  {/* tasksSorted.map: this maps over the sorted tasks and renders a Task for each */}
                  <AnimatePresence mode="popLayout">
                    {tasksSorted.map((task) => (
                      <Task key={task[0]} task={task} tasks={tasksSorted} />
                    ))}
                  </AnimatePresence>

                  {provided.placeholder}

                  {status !== 'completed' && status !== 'deleted' &&
                    <AddNewTask status={status} tasksSorted={tasksSorted} />
                  }
                  <div style={{height: "20px"}}></div>

                </div>
              )}
            </Droppable>
          </div >
        </motion.div>

      </motion.div >
    </>
  )
}

export default TodoColumn