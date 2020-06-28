const fhirAthlete = require('./athlete_fhir');


function findRace(patientInfo){ 
    if (patientInfo.extension) { 
        var raceUrl = 'http://hl7.org/fhir/us/core-r4/StructureDefinition/us-core-race';
        var raceExt; 
        for (var i = 0; i < patientInfo.extension.length; i++) {
            if (patientInfo.extension[i].url == raceUrl) {
                raceExt = patientInfo.extension[i].extension;
            }
        }
        raceList = [];
        if (raceExt) { 
            for (var i = 0; i< raceExt.length; i++) {
                if (raceExt[i].url == 'ombCategory') { 
                    var race =  { 
                        code : raceExt[i].valueCoding.code,
                        description : raceExt[i].valueCoding.display
                    }
                    if (!raceList.includes(race)) { 
                        raceList.push(race);
                    }
                } 
            }
        }

        return raceList
    }
}

function findContact (patient) { 
    var phones = ''  
    var emails = '' 
    var phoneCheck = false  
    var emailCheck = false  
    if (patient.telecom) {  
        for (var i = 0; i < patient.telecom.length ; i++) { 
   
            if (patient.telecom[i].system == 'email') { 
                if (emailCheck) { 
                    emails = emails + ', ' + patient.telecom[i].value 
                } else {  
                    emails = emails + patient.telecom[i].value 
                    emailCheck = true  
                }  
                   
            } else if (patient.telecom[i].system == 'phone') { 
                if (phoneCheck) { 
                    phones = phones + ', ' + patient.telecom[i].value 
                } else {  
                    phones = phones + patient.telecom[i].value 
                    phoneCheck = true 
               } 
            }  
       
        }  
    }
    return { 
        phoneList : phones,
        emailList : emails
    }   
}


module.exports = {

    viewAthleteHealthPage: (req, res) => {
        let athleteId = req.params.id;

        let query = "SELECT * FROM `athlete` WHERE id = '" + athleteId + "' ";

        db.all(query, [], (err, result) => {

            if (err) {
                return res.status(500).send(err);
            }
            //First we search the patient using our identifier in the FHIR server

            var ourIdentifier = result[0].Identifier;

            // used async ... await instead of promise chaining
            try {
                (async () => { 
                    
                    var patientInfo = await fhirAthlete.GetPatientInfo(ourIdentifier);
                    console.log(patientInfo.id);
                    var patientContact = findContact(patientInfo);
                    var raceList = findRace(patientInfo);

                    var patientCity =  patientInfo.address[0].city;
                    var ServerAssignedId = patientInfo.id;
                    var condition = await fhirAthlete.GetClinicalInfo('Condition', ServerAssignedId);
                    var allergy = await fhirAthlete.GetClinicalInfo('AllergyIntolerance', ServerAssignedId);
                    
                    // get immunization & medications for L03-1
                    var immunizationList = await fhirAthlete.GetClinicalInfo('Immunization', ServerAssignedId);
                    var medicationList = await fhirAthlete.GetClinicalInfo('MedicationRequest', ServerAssignedId);
                   
                    // lookup organization in patient's city
                    var organizationList = await fhirAthlete.GetProviderInfo('Organization', patientCity);
                    var practitionerList = await fhirAthlete.GetProviderInfo('Practitioner', patientCity);
                    // console.log(practitionerList)

                    res.render('athlete-health.ejs', {
                        title: 'Athlete Health',
                        athlete: result[0],
                        patient: patientInfo,
                        conditions: condition,
                        allergies: allergy,
                        organizations: organizationList,
                        practitioners: practitionerList,
                        immunizations: immunizationList,
                        medications: medicationList, 
                        race : raceList,
                        phones : patientContact.phoneList,
                        emails : patientContact.emailList,
                        message: ''
                    });
                })()
                .catch(err => {
                    console.log("there is an error");
                    console.log(err);
                    return res.status(500).send(err)
                })
                
            } 
            catch (error) { 
                return res.status(500).send(error); 
            }
           
        })
    }
}