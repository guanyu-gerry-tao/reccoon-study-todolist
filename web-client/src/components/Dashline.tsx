import '../App.css'

function Dashline({color = '#000000'}: {color?: string}) {

  return (
    <>
      <div className="w-full mt-2 mb-2" style={{backgroundColor: color, height: "1px"}}></div>
    </>
  )
}

export default Dashline