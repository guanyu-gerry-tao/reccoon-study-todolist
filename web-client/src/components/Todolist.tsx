import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { TaskItem , TaskActions, } from './type.ts'


function Todolist({tasks, taskActions, draggedTask}: 
  {tasks: TaskItem[], taskActions: TaskActions, draggedTask: [string] | null } ) {

  return (
    <>
      <div className='relative flex flex-row h-screen w-screen'>
        <div className='menubarContainer relative flex flex-col w-65 p-2 mr-5 h-full flex-shrink-0 bg-[#f5f5f5]'>
          <Menubar draggedTask={draggedTask} />
        </div>

        <div className='relative flex flex-row max-w-245 flex-grow overflow-y-auto overflow-x-auto items-start'>

          <TodoColumn title={"Now"} 
          bgColor='#e8fdec' 
          status={1} 
          actions={taskActions} 
          tasks={tasks.filter(task => task.status === 1)} 
          />
          
          <TodoColumn title={"Next"} 
          bgColor='#f0f1fd' 
          status={2} 
          actions={taskActions} 
          tasks={tasks.filter(task => task.status === 2)} 
          />
          
          <TodoColumn title={"Later"} 
          bgColor='#fff8e8' 
          status={3} 
          actions={taskActions} 
          tasks={tasks.filter(task => task.status === 3)} 
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