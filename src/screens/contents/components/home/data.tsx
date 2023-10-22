import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { reportdata } from '../../../../types/interfaces';
import Maps from './map';
import { CalculateDistance } from '../../../../firebase/function';
import ReactAudioPlayer from 'react-audio-player';
import { doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';

export default function Data({ item,  isLoading, isSuccess }: { item: reportdata[], isLoading: (e: boolean) => void, isSuccess: (e: boolean) => void }) {

  const [on, seton] = useState(false)
  const [isopenArray, setIsOpenArray] = useState(Array(item.length).fill(false));
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>();
  const [locationStrings, setLocationStrings] = useState<string[]>(Array(item.length).fill(''));

  useEffect(() => {
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

  const dispatchunit = async (incidentID: string, responded: boolean) => {
    isLoading(true)
    if(!responded){
    try {

      const incidentDocRef = doc(db, 'incident', incidentID);
      
      await updateDoc(incidentDocRef, {
        responded: true,
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
                      <span className='h4-data-padding'>Date/Time: </span> {formattedDate}
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
                    <h2>{item.reporttype} Report Alert!</h2>
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
                  <div style = {{justifyContent: 'flex-end', alignItems: 'flex-end', width: '100%', marginTop: 10}}>
                    <button className={item.responded ? 'disabled-button' : ''} onClick={() => dispatchunit(item.incidentID, item.responded)}>Dispatch</button>
                  </div>
                  <br/>
                  <Maps coordinates = {item.coordinates} />
                  <span className='contact-number'>
                    <h4> Reporter Contact Number:{'    '}</h4>
                    <p>{' '}{item.number}</p>
                  </span>
                  <br/>
                  <span className='report-image'>
                    <div>
                    <p>
                      <h4>Incident Details</h4>{item.description}
                    </p>
                    {item.media !== 'No Image' ? <img src= {item.media}  width={'100%'} height={'250px'} className='report-image' /> 
                    :
                    <h3>{item.media}</h3>
                    }
                    </div>
                  </span>
                  <br/>
                  <div className='report-recording'>
                  <ReactAudioPlayer
                    src= {item.recording}
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
                        <td>{item.victiminfo[0].names && item.victiminfo[0].names.map((name) => <div key={name}>{name}</div>)}</td>
                        <td>{item.victiminfo[0].gender &&  item.victiminfo[0].age.map((gender) => <div key={gender}>{gender}</div>)}</td>
                        <td>{item.victiminfo[0].age && item.victiminfo[0].gender.map((age) => <div key={age}>{age}</div>)}</td>
                        </tr>
                    </tbody>
                  </table>
                </>
              )}

            </div>
            <button onClick={() => toggleIsOpen(index)}>{isopenArray[index] ? 'Hide' : 'View'}</button>
            <br />
          </div>
        );
      })}
    </div>
  );
}
