const fhirAthlete = require('./athlete_fhir');

module.exports = {

    viewAthleteHealthPage: (req, res) => {
        console.log(req)
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
                    var patientCity =  patientInfo.address[0].city;
                    var ServerAssignedId = patientInfo.id;
                    var condition = await fhirAthlete.GetClinicalInfo('Condition', ServerAssignedId);
                    var allergy = await fhirAthlete.GetClinicalInfo('AllergyIntolerance', ServerAssignedId);
        
                    // lookup organization in patient's city
                    var organizationList = await fhirAthlete.GetProviderInfo('Organization', patientCity);
                    var practitionerList = await fhirAthlete.GetProviderInfo('Practitioner', patientCity);
                    console.log(practitionerList)
                    res.render('athlete-health.ejs', {
                        title: 'Athlete Health',
                        athlete: result[0],
                        patient: patientInfo,
                        conditions: condition,
                        allergies: allergy,
                        organizations: organizationList,
                        practitioners: practitionerList,
                        message: ''
                    });
                })()
                .catch(err => {return res.status(500).send(err)})
                
            } 
            catch (error) { 
                return res.status(500).send(error); 
            }
           
        })
    }
}