const fhirAthlete = require('./athlete_fhir');

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