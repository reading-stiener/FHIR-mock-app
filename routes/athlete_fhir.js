const Client = require('fhir-kit-client')

async function GetClinicalInfo(ResourceType, LogicalServerId) {
    const fhirClient = new Client({
        baseUrl: 'http://fhir.hl7fundamentals.org/r4'
    });
    var ClinicalInfo = [];
    let searchResponse = await fhirClient
        .search({ resourceType: ResourceType, searchParams: { "patient": LogicalServerId } });

    if (searchResponse.total > 0) {
        entries = searchResponse.entry;
        entries.forEach(entry => {
            var cli = entry.resource;
            ClinicalInfo.push(cli);
        })
    }
    return ClinicalInfo;
}

async function GetPatientInfo(OurIdentifier) {
    const fhirClient = new Client({
        baseUrl: 'http://fhir.hl7fundamentals.org/r4'
    });

    var PatientInfo = null;
    let searchResponse = await fhirClient
        .search({ resourceType: 'Patient', searchParams: { identifier: OurIdentifier } });
    entries = searchResponse.entry;
    PatientInfo = entries[0].resource;
    return PatientInfo;
}

async function GetProviderInfo(providerType, locationCity) {
    const fhirClient = new Client({
        baseUrl: 'http://fhir.hl7fundamentals.org/r4'
    });

    var providerList = []; 
    let searchResponse = await fhirClient
        .search({ resourceType: providerType, searchParams: { address: locationCity } });
    
        if (searchResponse.total > 0) {
            entries = searchResponse.entry;
            entries.forEach(entry => {
                var provider = entry.resource;
                if (!providerList.includes(provider)){
                    providerList.push(provider);
                }
            })
        }
        return providerList;
  
}
module.exports = { GetPatientInfo, GetClinicalInfo, GetProviderInfo }