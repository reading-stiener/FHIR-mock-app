const Client = require('fhir-kit-client')

function GetClinicalInfo(fhirClient, ResourceType, LogicalServerId) {
    var clinicalinfo = [];
    var ErrorMessage = null;
    fhirClient
        .search({ resourceType: ResourceType, searchParams: { patient: LogicalServerId } })
        .then(searchResponse => {
            entries = searchResponse.entry;
            entries.forEach(entry => {
                var cli = entry.resource;
                clinicalinfo.push(cli);
            })
        })
        .catch(error => { ErrorMessage = error })

    return { clinicalinfo, ErrorMessage };

}

function GetPatientDemographics(fhirClient, OurIdentifier) {
    var ErrorMessage = null;
    var patient = null;
    fhirClient
        .search({ resourceType: 'Patient', searchParams: { identifier: OurIdentifier } })
        .then(result => {
            entries = searchResponse.entry;
            patient = entries[0].resource;
        })
        .catch(error => { message = error.message })

    return { patient, Errormessage };

}
module.exports = { GetPatientDemographics, GetClinicalInfo }