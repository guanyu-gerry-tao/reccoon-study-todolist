import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { TaskItem , TaskActions, Projects, UserStatus } from './type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'


function Todolist({tasks, projects, userStatus, taskActions, draggedTask}: 
  {tasks: TaskItem[], projects: Projects, userStatus: UserStatus, taskActions: TaskActions, draggedTask: [string] | null } ) {

  const [currentProjectID, setCurrentProjectID] = useImmer<string>(userStatus.project);

  return (
    <>
      <div className='relative flex flex-row h-screen w-screen overflow-hidden'>
          <Menubar draggedTask={draggedTask} projects={projects} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} />


        <div className='relative flex flex-row max-w-245 flex-grow overflow-y-auto overflow-x-auto items-start'>

          <TodoColumn title={"Now"} 
          bgColor='#e8fdec' 
          status={1} 
          actions={taskActions} 
          tasks={tasks.filter(task => task.status === 1)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Next"} 
          bgColor='#f0f1fd' 
          status={2} 
          actions={taskActions} 
          tasks={tasks.filter(task => task.status === 2)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Later"} 
          bgColor='#fff8e8' 
          status={3} 
          actions={taskActions} 
          tasks={tasks.filter(task => task.status === 3)} 
          currentProjectID={currentProjectID}
          />
          </div>
      
      <div className='relative right-0 top-0 flex flex-col w-100 min-w-100 h-screen bg-gray-200 border-l border-gray-300 flex-grow'>
        <AIChatPanel />
      </div>

      </div>

      

    </>
  )
}

export default Todolist