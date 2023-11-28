import { fetchdata } from '../../firebase/function'
import React, { useEffect, useState } from 'react'
import { Header } from 'screens/contents/components/gen/header'
import NavBarItems from 'screens/contents/components/gen/navigator/navbaritems'
import Navbarmenu from 'screens/contents/components/gen/navigator/navbarmenu'
import Data from 'screens/contents/components/home/data'
import { reportdata } from '../../types/interfaces'

type Props = {}

export default function History({}: Props) {

  const [jobdata, setjobdata] = useState<reportdata[]>([])
  const [isloading, setisloading] = useState(false);
  const [issuccess, setissuccess] = useState(false);
  const [timer, settimer] = useState(5)

  const fetchjobdata =async() => {
      
    const thisdata: reportdata[] = await fetchdata("incident", true)||[];
      console.log(thisdata.length)
      setjobdata(thisdata)
  }

  useEffect(() => {
      fetchjobdata()
  }, [])

  return (
    <div className = 'container'>
      <Header menu={Navbarmenu} />
      <div className='data-wrapper'>
        {jobdata.length == 0 ? <div className = 'no-data-container'>
          <img src={'https://i.imgur.com/QS4Hx2T.png'}/>
          <h2>No Emergency report</h2>
          <p>While there are no active emergencies, it is crucial for all emergency response teams to remain on high alert and maintain readiness. Regular equipment checks, team briefings, and communication drills are essential to ensure a swift and coordinated response in case of an unforeseen incident.</p>
        </div>
        :
        <Data item={jobdata} isLoading={setisloading} isSuccess = {setissuccess} onClick={() => {}}/>}
      </div>
    </div>
  )
}