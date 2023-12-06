export type Children = {
  children: any | null;
}


export interface logindata {
  agencyname: string,
  contactnumber: string,
  email: string,
  photoURL: string,
  type: string,
  uid: string,
  username: string,
  userType: string,
  responder: string,
  
}

export interface reportdata {


  incidenttype: string,
  valid: string,
  barangay: string,
  _reporttype: any,
  _report: any,
  type: string,
  time: string,
  incidentID: string,
  coordinates: [number, number],
  description: string,
  media: string,
  mdiatype: string,
  victiminfo: [{ names: string[], gender:string[], age: string[]}],
  number: string,
  reporter: string,
  reporterID: string,
  reporterphotoURL: string,
  reporttype: string,
  date: string,
  responded: boolean,
  recording: string,
  responderID: string,
  responder: string,
  archive: boolean,
  actualincident: string,
  contactnumber: string,

}

export interface locationdata {
  
  _location: any,
  coords: any,
}

export interface incidentiddata {
  incidentID: string,
  _incidentid: any,

}