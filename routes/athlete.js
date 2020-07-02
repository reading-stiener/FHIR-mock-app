const fhirAthlete = require('./athlete_fhir');
const Client = require('fhir-kit-client'); 
const axios = require('axios');

const fhirClient = new Client({ 
    baseUrl : 'http://fhir.hl7fundamentals.org/r4',
    customHeaders : { 
        'Content-Type' : 'application/fhir+json',
        'Accept' : 'application/fhir+json'
    }
})

module.exports = {

    addAthletePage: (req, res) => {
        res.render('add-athlete.ejs', {
            title: 'Welcome to My Sport Team | Add a new athlete',
            message: ''
        });
    },

    addAthlete: (req, res) => {
        let message = '';
        let Given = req.body.Given;
        let Family = req.body.Family;
        let Identifier = req.body.Identifier;
        let Gender = req.body.Gender;
        let birthDate = req.body.birthDate;
        let Team = req.body.Team;
        let Position = req.body.Position;

        let usernameQuery = "SELECT * FROM `athlete` WHERE Identifier = '" + Identifier + "'";
        console.log(usernameQuery);
        db.all(usernameQuery, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'Identifier already exists';
                res.render('add-athlete.ejs', {
                    message,
                    title: 'Welcome to My Sport Team | Add a new athlete'
                });
            } else {
                // send the athlete's details to the database
                let query = "INSERT INTO `athlete` (Family, Given, Identifier, birthDate, Gender, Team, Position) VALUES ('" +
                    Family + "', '" + Given + "', '" + Identifier + "', '" + birthDate + "', '" + Gender + "', '" + Team + "', '" + Position + "')";
                console.log(query);
                db.run(query, [], (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            };
        });
    },
    addLabResultsPage : (req, res) => {
        try { 
            res.render('add-lab-report.ejs', { 
                title : "Add a lab report. Fill out the form below", 
                message: ""
            })
        }
        catch(error){
            console.log(error);
        } 
      
    },

    // This is the part for L04-01. 
    // I chose to post a Diagnostic lab report 
    // using the DiagnosticReport resource.
    addLabResults : (async (req,  res) => { 

        // must have fields
        let message = '';
        let status = req.body.Status;
        let labDescription =  req.body.Display;
        let labCode = req.body.Code;
        let patientRef = req.body.Subject;
        let value = req.body.Value;
        let valueSystem = req.body.ValueSystem;
        let valueCode = req.body.ValueCode;
        let effectiveDate = req.body.Effective;

    
        try { 
            // reading the patient resource given id
            response = await fhirClient.read({ 
                resourceType : 'Patient',
                id : patientRef
            })

            // creating the DiagnosticReport object
            var l = new Object; 

            l.resourceType = 'Observation';
            l.status = status; 
            l.category =  [
                {
                    coding : [
                        {
                            system : 'http://terminology.hl7.org/CodeSystem/observation-category',
                            code : 'laboratory',
                            display : 'laboratory'
                        }
                    ]
                }
            ]
            l.code = { 
                coding : [
                    {
                        system : 'http://loinc.org',
                        code :  labCode,
                        display : labDescription
                    }
                ]
            }
            l.subject = { 
                reference : 'Patient/' + patientRef,
                display : response.name[0].given[0] + ' ' + response.name[0].family
            }
            l.effectiveDateTime = effectiveDate;
            l.valueQuantity = { 
                value : value,
                system : valueSystem,
                code : valueCode
            }
            
            console.log(l)
            // parameters to connect for validation

            var urlFHIREndpoint = 'http://fhir.hl7fundamentals.org/r4';
            var ResourceClass = "Observation";
            var OperationName = "$validate";
            var FullURL = urlFHIREndpoint + "/" + ResourceClass + "/" + OperationName;

            // validating...
            /*
            
            var response = await axios.post(
                FullURL, l, {
                    headers: {
                        "Content-Type": "application/fhir+json",
                        "Accept": "application/fhir+json"
                    }
                }
            )
            var data = response.data;
            console.log(data);
            */
            // posting data .... 
            data = await fhirClient.create({
                resourceType : 'Observation',
                body : l
            })
            res.redirect('/');

        } catch(error){
            message = 'There was an error : (';
            console.log(error);
            res.render('add-lab-report.ejs', {
                message : message,
                title : 'Add a new lab report'
            })
        }    
    }),

    addImmunizationPage : (req, res) => {
        try { 
            res.render('add-immunization.ejs', { 
                title : "Add an immunization. Fill out the form below", 
                message: ""
            })
        }
        catch(error){
            console.log(error);
        } 
      
    },

    addImmunizations : (async (req,  res) => { 

        // must have fields
        let message = '';
        let status = req.body.Status;
        let vaccineDis =  req.body.Display;
        let vaccineCode = req.body.Code;
        let patientRef = req.body.Subject;
        let occurrence = req.body.Occurrence;
        let primarySource = req.body.Source;
    
        try { 
            // reading the patient resource given id
            response = await fhirClient.read({ 
                resourceType : 'Patient',
                id : patientRef
            })

            // creating the DiagnosticReport object
            var l = new Object; 

            l.resourceType = 'Immunization';
            l.status = status; 
      
            l.vaccineCode = { 
                coding : [
                    {
                        system : 'http://hl7.org/fhir/sid/cvx',
                        code :  vaccineCode,
                        display : vaccineDis
                    }
                ]
            }
            l.subject = { 
                reference : 'Patient/' + patientRef,
                display : response.name[0].given[0] + ' ' + response.name[0].family
            }
            l.occurrence = occurrence;
            l.primarySource = primarySource;
            
            console.log(l)
            // parameters to connect for validation
            /*
            var urlFHIREndpoint = 'http://fhir.hl7fundamentals.org/r4';
            var ResourceClass = "Immunization";
            var OperationName = "$validate";
            var FullURL = urlFHIREndpoint + "/" + ResourceClass + "/" + OperationName;

            // validating...
            
            var response = await axios.post(
                FullURL, l, {
                    headers: {
                        "Content-Type": "application/fhir+json",
                        "Accept": "application/fhir+json"
                    }
                }
            )
            var data = response.data;
            console.log(data);
            */
            // posting data .... 
            data = await fhirClient.create({
                resourceType : 'Immunization',
                body : l
            })
            res.redirect('/');

        } catch(error){
            message = 'There was an error : (';
            console.log(error);
            res.render('add-immunization.ejs', {
                message : message,
                title : 'Add a new lab report'
            })
        }    
    }),

    editAthletePage: (req, res) => {

        let athleteId = req.params.id;
        let query = "SELECT * FROM `athlete` WHERE id = '" + athleteId + "' ";
        db.all(query, [], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('edit-athlete.ejs', {
                title: 'Edit athlete',
                athlete: result[0],
                message: ''
            });
        });
    },
    editAthlete: (req, res) => {
        console.log(req);
        let athleteId = req.params.id;
        let Given = req.body.Given;
        let Family = req.body.Family;
        let Identifier = req.body.Identifier;
        let Gender = req.body.Gender;
        let birthDate = req.body.birthDate;
        let Team = req.body.Team;
        let Position = req.body.Position;

        let query = "UPDATE `athlete` SET `Given` = '" + Given + "', `Family` = '" + Family + "', `Identifier` = '" + Identifier + "'" +
            ",`Gender` = '" + Gender + "', `birthDate` = '" + birthDate + "', `Team` = '" + Team + "', `Position` = '" + Position +
            "' WHERE `athlete`.`Id` = '" + athleteId + "'";
        console.log(query);
        db.all(query, [], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    deleteAthlete: (req, res) => {
        let athleteId = req.params.id;
        let deleteUserQuery = 'DELETE FROM athlete WHERE Id = "' + athleteId + '"';

        db.all(deleteUserQuery, [], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    reconAthlete: (req, res) => { 
        let athleteId =  req.params.id; 
        let athleteQuery = 'SELECT * FROM Athlete WHERE id = " ' + athleteId + '"';
        console.log(athleteQuery);

        db.all(athleteQuery, [], (err, result) => { 
            if (err) { 
                return res.status(500).send(err);
            }
            var databaseRec = result[0];
            var Identifier = result[0].Identifier;
            var fhirRec = {family: 'Pradhan'};
            fhirAthlete.GetPatientInfo(Identifier) 
            .then(fhirPatient => { 
                console.log(fhirPatient);
                fhirRec = fhirPatient
                res.render('reconciliation.ejs', {
                    title: 'Reconciliation Table', 
                    databaseRec: databaseRec, 
                    fhirRec: fhirRec
                });

            }) 
           
        })
    }
};