import '../App.css'
import Task from './Task.tsx';
import type { TaskItem, TaskActions } from './type.ts';


function Tasklist({tasks, actions}: {tasks: TaskItem[], actions: TaskActions}) {

  return (
    <>
        {tasks.map((task: TaskItem) => (
          <div key={task.id}>
            <Task taskInfo={task} actions={actions} />
          </div>
        ))}
    </>
  )
}

export default Tasklist