import { fetchdata } from '../../firebase/function'
import React, { useContext, useEffect, useState } from 'react'
import { Header } from 'screens/contents/components/gen/header'
import NavBarItems from 'screens/contents/components/gen/navigator/navbaritems'
import Navbarmenu from 'screens/contents/components/gen/navigator/navbarmenu'
import Data from 'screens/contents/components/home/data'
import { reportdata } from '../../types/interfaces'
import { AuthContext } from 'auth'

type Props = {}

export default function Validate({}: Props) {

  const [jobdata, setjobdata] = useState<reportdata[]>([])
  const [isloading, setisloading] = useState(false);
  const [issuccess, setissuccess] = useState(false);
  const [timer, settimer] = useState(5)
	const {currentUser} = useContext(AuthContext)
  const fetchjobdata =async() => {
      
    const thisdata: reportdata[] = await fetchdata("incident", true)||[];
    const filteredData = thisdata.filter((item) => !item.archive && item.responderID === currentUser?.uid)
      setjobdata(filteredData)
  }

  useEffect(() => {
      fetchjobdata()
  }, [])

  useEffect(() => {

    if(issuccess) {
      if(timer > 0) {
        setTimeout(() => {

          settimer(timer - 1)
          
        }, 1000);
      } else {
        settimer(5)
        setissuccess(false)
        window.location.reload();
      }
    } 
    console.log(isloading)
    console.log(issuccess)
  },[timer, issuccess])

  return (
    <div className = 'container'>
        {isloading && 
        <div className='loading-modal'>
          <div className='loading-content'>
            <div className='spinner'></div>
            <span>loading</span>
          </div>
        </div>
      }
       {issuccess && 
        <div className="loading-modal">
          <div className="loading-content success-modal">
            <h2>Archived Successful</h2>
            <p>You can check the History tab for all archived incidents.</p>
          </div>
        </div>
      }
      <Header menu={Navbarmenu} />
      <div className='data-wrapper'>
        {jobdata.length == 0 ? <div className = 'no-data-container'>
          <img src={'https://i.imgur.com/QS4Hx2T.png'}/>
          <h2>Nothing to Validate</h2>
          <p>While there are no report to validate, it is crucial for all emergency response teams to remain on high alert and maintain readiness. Regular equipment checks, team briefings, and communication drills are essential to ensure a swift and coordinated response in case of an unforeseen incident.</p>
        </div>
        :
        <Data isDuplicate = {() => {}} item={jobdata} isLoading={setisloading} isSuccess = {setissuccess} onClick={() => {}}/>}
      </div>
    </div>
  )
}