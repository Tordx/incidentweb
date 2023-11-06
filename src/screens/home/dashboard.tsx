import React, {useState, useEffect} from 'react'
import { Header } from 'screens/contents/components/gen/header'
import Data from 'screens/contents/components/home/data'
import Navbarmenu from 'screens/contents/components/gen/navigator/navbarmenu'
import { reportdata } from 'types/interfaces'
import { fetchdata } from '../../firebase/function'
import './styles/styles.css'
import { collection, getDocs, onSnapshot } from '@firebase/firestore'
import { db } from '../../firebase/'
import useSound from 'use-sound';
import alert from '../../sounds/alarm.mp3'


export default function Home({}) {

  const [jobdata, setjobdata] = useState<reportdata[]>([])
  const [isloading, setisloading] = useState(false);
  const [issuccess, setissuccess] = useState(false);
  const [timer, settimer] = useState(5);
  const [newalert, setnewalert] = useState(false)
  const [play,{stop}] = useSound(alert); 

  useEffect(() => {

    const audio = new Audio(alert)
    const incidentCollection = collection(db, "incident");
  
    const unsubscribe = onSnapshot(incidentCollection, (querySnapshot) => {
      const updatedData: (reportdata & { id: string })[] = [];
      querySnapshot.forEach((doc) => {
        updatedData.push({ id: doc.id, ...doc.data() } as (reportdata & { id: string }));
      });
      
      const nonRespondedData = updatedData.filter((item) => !item.responded);
      if(nonRespondedData.length) {
        audio.muted = false;
        audio.play()
      }
      setjobdata(nonRespondedData);
    });

    return () => {
        unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (newalert) {
      play();
      showNotification('New Report Incoming', { body: 'Click to view the new report' });
    }
  }, [newalert]);
  
  const showNotification = (title: string, options: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
  };
  
  
  useEffect(() => {

    if(issuccess) {
      if(timer > 0) {
        setTimeout(() => {

          settimer(timer - 1)
          
        }, 1000);
      } else {
        settimer(5)
        setissuccess(false)
      }
    } 
    console.log(isloading)
    console.log(issuccess)
  },[timer, issuccess])


  return (
    <div className='container'>
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
            <h2>Dispatch Successful</h2>
            <p>Make sure the dispatch unit is on their way.</p>
          </div>
        </div>
      }
      {newalert && 
        <div className="loading-modal">
          <div className="loading-content newalert-modal">
            <h2>NEW REPORT INCOMING!!</h2>
            <button onClick={() => {stop(); setnewalert(false)}}>View</button>
          </div>
        </div>
      }
      <Header menu={Navbarmenu}/>
      <div className='data-wrapper'>
        {jobdata.length == 0 ? <div className = 'no-data-container'>
          <img src={'https://i.imgur.com/QS4Hx2T.png'}/>
          <h2>No Emergency report</h2>
          <p>While there are no active emergencies, it is crucial for all emergency response teams to remain on high alert and maintain readiness. Regular equipment checks, team briefings, and communication drills are essential to ensure a swift and coordinated response in case of an unforeseen incident.</p>
        </div>
        :
        <Data item={jobdata} isLoading={setisloading} isSuccess = {setissuccess}/>}
      </div>
    </div>
  )
}