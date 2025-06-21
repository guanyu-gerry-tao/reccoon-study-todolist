import '../App.css'
import Task from './Task.tsx';
import type { TaskItem, NewTaskItem } from './type.ts';


function Tasklist({tasks}: {tasks: TaskItem[]}) {

  return (
    <>
        {tasks.map((task: TaskItem) => (
            <Task title={task.title} />
        ))}
    </>
  )
}

export default Tasklist