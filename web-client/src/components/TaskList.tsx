import '../App.css'
import Task from './Task.tsx';
import TaskGap from './TaskGap.tsx'
import type { TaskItem, TaskActions } from './type.ts';


function Tasklist({tasks, actions}: {tasks: TaskItem[], actions: TaskActions}) {

  return (
    <>
      <TaskGap />
        {tasks.map((task: TaskItem) => (
          <div key={task.id}>
            <Task taskInfo={task} actions={actions} />
            <TaskGap />
          </div>
        ))}
    </>
  )
}

export default Tasklist