import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { logindata, reportdata } from '../../../../types/interfaces';
import Maps from './map';
import { CalculateDistance } from '../../../../firebase/function';
import ReactAudioPlayer from 'react-audio-player';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { AuthContext } from 'auth';

const barangays: string[] = [
  "Select Barangay",
  'Bantogon',
  'Cadiz',
  'Datu Ito Andong',
  'Datu Wasay',
  'Dumangas Nuevo',
  'Hinalaan',
  'Limulan',
  'Nalilidan',
  'Obial',
  'Pag-asa (Sultan Gunting Mopak)',
  'Paril',
  'Poblacion',
  'Sabanal',
  'Sangay',
  'Santa Clara',
  'Santa Maria',
];

export default function Data({ item,  isLoading, isSuccess, onClick }: { item: reportdata[], isLoading: (e: boolean) => void, isSuccess: (e: boolean) => void, onClick: (e: any) => void, }) {

  const data: reportdata[] = item 
  
  data.sort((a, b) => {
    const dateA: any = new Date(b.date);
    const dateB: any = new Date(a.date);
    return dateA - dateB;
  });
  const [on, seton] = useState(false)
  const [isopenArray, setIsOpenArray] = useState(Array(item.length).fill(false));
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>();
  const [locationStrings, setLocationStrings] = useState<string[]>(Array(item.length).fill(''));
  const [responder, setresponder] = useState<logindata[]>([])
  const { currentUser } = useContext(AuthContext);
  const [barangay, setbarangay] = useState<string>(data[0].barangay);
  const [valid, setvalid] = useState<string>(data[0].valid);
  const [incidenttype, setincidenttype] = useState<string>(data[0].incidenttype);
  const [actualincident, setactualincident] = useState<string>(data[0].actualincident);

  useEffect(() => {
    const getResponder = async() => {
      const querySnapshot = await getDocs(collection(db, 'user'));
      const thisdata: logindata[] = []
      querySnapshot.forEach((doc) => {
        if(doc.data().uid === currentUser?.uid){
          thisdata.push({
            agencyname: doc.data().agencyname,
            contactnumber: doc.data().contactnumber,
            email: doc.data().email,
            photoURL: doc.data().photoURL,
            type: doc.data().type,
            uid: doc.data().uid,
            username: doc.data().username,
            userType: doc.data().userType,
            responder: doc.data().responder,
          })
        }
      })
      setresponder(thisdata)
    }
    getResponder()
    const getReverseGeocoding = async (latitude: number, longitude: number, index: number) => {
      const reverseGeocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      console.log(longitude);
      try {
        const response = await fetch(reverseGeocodingUrl);
        if (response.ok) {
          const data = await response.json();
          const { address } = data;
          const locationString = `${address.village || address.road || address.street} ${address.city || address.town || address.village}`;
          setLocationStrings((prevLocationStrings) => {
            const updatedLocationStrings = [...prevLocationStrings];
            updatedLocationStrings[index] = locationString;
            return updatedLocationStrings;
          });
        } else {
          console.error('Reverse geocoding request failed.');
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }
    };
    

    // Iterate over each reportdata item
    item.forEach((report, index) => {
      console.log(report);
      const latitude = report.coordinates[1];
      const longitude = report.coordinates[0];
      getReverseGeocoding(latitude, longitude, index);
    });
  }, [item]);
  

  const toggleIsOpen = (index: number) => {
    const updatedIsOpenArray = [...isopenArray];
    updatedIsOpenArray[index] = !updatedIsOpenArray[index];
    setIsOpenArray(updatedIsOpenArray);
    seton(!on)
  };

  useEffect(() => {
    const fetchLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position: any) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting user location:', error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    };

    fetchLocation();
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
  
    // Determine whether it's AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert 24-hour format to 12-hour format
    hours = hours % 12 || 12;
  
    // Format hours and minutes to ensure they have leading zeros if needed
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    // Create a string in the format HH:MM AM/PM
    const currentTimeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
  
    return currentTimeString;
  };

  const dispatchunit = async (incidentID: string, responded: boolean) => {
    isLoading(true)
    
    if(!responded){
    try {
      const time = getCurrentTime()
      const incidentDocRef = doc(db, 'incident', incidentID);
      console.log(responder)
        await updateDoc(incidentDocRef, {
        responded: true,
        responder: responder[0].responder,
        time: time,
        responderID: currentUser?.uid,
      }).then(() => {
        isLoading(false)
        isSuccess(true)
      })
      
      console.log('Document successfully updated.');
    } catch (error) {
      isLoading(false)
      console.error('Error updating document:', error);
    }} else if(responded){
        return
    }
  };
  const archive = async (incidentID: string) => {
    isLoading(true)
    if(!incidenttype && !actualincident && !valid && !barangay){
      alert('incident must be validated')
      isLoading(false)
    } else {
      try {
        const incidentDocRef = doc(db, 'incident', incidentID);
        console.log(responder)
          await updateDoc(incidentDocRef, {
          archive: true,
          incidenttype: incidenttype,
          actualincident: actualincident,
          valid: valid,
          barangay: barangay,

        }).then(() => {
          isLoading(false)
          isSuccess(true)
        })
        
        console.log('Document successfully updated.');
      } catch (error) {
        isLoading(false)
        console.error('Error updating document:', error);
      }
    }
  };
  

  return (
    <div className={on ? 'dashboard-data-on' : 'dashboard-data-off'}>
     
      {item.map((item, index) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const [month, day, year] = item.date.split('/'); // Split the date string
        const formattedDate = `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`; // Format the date
        let result = null;
        if (location && location.latitude !== undefined && location.longitude !== undefined) {
          result = CalculateDistance(location, item.coordinates).toFixed(2);
        }
       

        return (
          <div className='data-container' key={index}>
            <div className='data-padding'>
              {!isopenArray[index] ? (
                <div>
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    style={{ padding: 5, width: 100, height: 100    , color: 'red', marginRight: 10, background: '#fff', borderRadius: 100 }}
                  />
                  
                  <span>
                    <h2>{item.reporttype} Report Alert!</h2>
                    <span className='location-container'>
                      <span className='h4-data-padding'>Location:</span> {locationStrings[index]}
                    </span>
                    <br/>
                    <span className='location-container'>
                      <span className='h4-data-padding'>Date/Time: </span> {formattedDate} {item?.time ? `| ${item.time} `: ''}
                    </span>
                      <br/>
                      <br/>
                    <span className='distance-text'>
                     {result} KM away from you
                    </span>
                  </span>
                </div>
              ) : (
                <>
                  <div className="data-title">
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      style={{ padding: 5, width: 100, height: 100, color: 'red', marginRight: 10, background: '#fff', borderRadius: 100 }}
                    />
                     <span>
                    <h2>{data.length > 0 ? data[0].reporttype : ''} Report Alert!</h2>
                    <span className='location-container'>
                      <span className='h4-data-padding'>Location:</span> {locationStrings[index]}
                    </span>
                    <br/>
                    <span className='location-container'>
                      <span className='h4-data-padding'>Date/Time: </span>
                      {formattedDate}
                      </span>
                      <br/>
                      <br/>
                    <span className='distance-text'>
                     {result} KM away from you
                    </span>
                  </span>
                  </div>  
                  <br/>
                  {data.length > 0 && data[0].responded && <span className='input-container'>
                  <select disabled = {data.some(item => item.archive)} defaultValue={'Select Validation'} value={valid} onChange={(e) => setvalid(e.target.value)}>
                      <option disabled defaultValue = {'Select Validation'} key={index}>Select Validation</option>
                      <option  value = {'valid'} key={index}>Valid</option>
                      <option  value = {'invalid'} key={index}>Invalid</option>
                  </select>
                  <select disabled = {data.some(item => item.archive)} defaultValue={'Select Incident Type'} value = {incidenttype}  onChange={(e) => setincidenttype(e.target.value)}>
                      <option disabled defaultValue = {'Select Incident Type'} key={0}>Select Incident Type</option>
                      <option  value = {'Accidents'} key={1}>Accidents</option>
                      <option  value = {'Natural/man-made calamities'} key={2}>Natural/man-made calamities</option>
                      <option  value = {'Crime Incidents'} key={3}>Crime Incidents</option>
                  </select>
                  <input disabled = {data.some(item => item.archive)} placeholder='Actual Incident' value = {actualincident} onChange={(e) => setactualincident(e.target.value)} />
                  <select disabled = {data.some(item => item.archive)}defaultValue={'Select Barangay'}  onChange={(e) => setbarangay(e.target.value)}>
                    {barangays && barangays.map((item: string, index: number) => (
                      <option disabled = {item === 'Select Barangay'} value = {item[index]} key={index}>{item}</option>
                    ))}
                  </select>
                  </span>
                  }
                  <div style = {{justifyContent: data[0].responded ? 'space-between' : 'flex-end', alignItems: 'flex-end', width: '100%', marginTop: 10}}>
                  {data.some(item => item.responded && !item.archive) ? (
                    <button
                      className={'enable-button'}
                      onClick={() => {
                          archive(data[0].incidentID);
                          onClick(item);
                        
                      }}
                    >
                      Validate and Archive
                    </button>
                  ) : (
                    <></>
                  )}
                  <button disabled = {data[0].responded === true} className={data[0].responded ? 'disabled-button' : 'enable-button'} onClick={() => { dispatchunit(item.incidentID, item.responded); onClick(item); }}>Dispatch</button>
                  </div>
                  <br/>
                  <Maps coordinates = {data.length > 0 ? data[0].coordinates : [0,0]} />
                  <span className='contact-number'>
                    <h4> Reporter Contact Number:{'    '}</h4>
                    <p>{' '}{data.length > 0 ? data[0].number : ''}</p>
                  </span>
                  <br/>
                  <span className='report-image'>
                    <div>
                    <p>
                      <h4>Incident Details</h4>{data.length > 0 ? data[0].description :''}
                    </p>
                    {data.length > 0 ? '' : data[0].media !== 'No Image' ? <img src= {item.media}  width={'100%'} height={'250px'} className='report-image' /> 
                    :
                    <h3>{item.media}</h3>
                    }
                    </div>
                  </span>
                  <br/>
                  <div className='report-recording'>
                  <ReactAudioPlayer
                    src= {data.length > 0 ? data[0].recording : ''}
                    controls
                    style={{alignItems: 'center', justifyContent: 'center'}}
                  />
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Estimated Age</th>
                        <th>Sex</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>{data.length === 0 ? [] : data[0].victiminfo[0].names && data[0].victiminfo[0].names.map((name) => <div key={name}>{name}</div>)}</td>
                        <td>{data.length === 0 ? [] : data[0].victiminfo[0].age &&  data[0].victiminfo[0].age.map((gender) => <div key={gender}>{gender}</div>)}</td>
                        <td>{data.length === 0 ? [] : data[0].victiminfo[0].gender && data[0].victiminfo[0].gender.map((age) => <div key={age}>{age}</div>)}</td>
                        </tr>
                    </tbody>
                  </table>
                </>
              )}

            </div>
            <button onClick={() => {toggleIsOpen(index)}}>{isopenArray[index] ? 'Hide' : 'View'}</button>
            <br />
            <span className='location-container'>
              <span className='h4-data-padding'>Responder:</span> {data.length &&  data[0].responder ? data[0].responder : 'No responder yet'}
            </span>
            <br/>
          </div>
        );
      })}
    </div>
  );
}
