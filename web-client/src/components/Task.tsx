import '../App.css'
import Dashline from './Dashline'

type TaskProps = {
  title: string
}

function Task({ title }: TaskProps) {

  return (
    <>
      <Dashline />
      <p>{title}</p>
    </>
  )
}

export default Task