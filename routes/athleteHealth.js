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

            fhirAthlete.GetPatientInfo(ourIdentifier).then(
                //If successful, we search for the clinical info, and then render everything


                PatientInfo => {
                    condition = [];
                    allergy = [];
                    medication = [];

                    var ServerAssignedId = PatientInfo.id;

                    fhirAthlete.GetClinicalInfo('Condition', ServerAssignedId).
                    then(

                            fhir_conditions => {
                                condition = fhir_conditions;


                                fhirAthlete.GetClinicalInfo('AllergyIntolerance', ServerAssignedId).
                                then(
                                    fhir_allergies => {
                                        allergy = fhir_allergies;
                                        res.render('athlete-health.ejs', {
                                            title: 'Athlete Health',
                                            athlete: result[0],
                                            patient: PatientInfo,
                                            conditions: condition,
                                            allergies: allergy,
                                            message: ''
                                        });
                                    });
                                //fhirAthlete.GetClinicalInfo('MedicationRequest', ServerAssignedId).then(fhir_meds => medication = fhir_meds);

                            })
                        .catch(e => { return res.status(500).send(e) });
                });
        })
    }
}