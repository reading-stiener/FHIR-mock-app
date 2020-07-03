const Client = require('fhir-kit-client');
const axios = require('axios');

// function optimizes patient data pull in one request
async function GetClinicalInfoOptimized(patientId){ 
    var urlFHIREndpoint='http://fhir.hl7fundamentals.org/r4/';
    var ResourceClass  ='Patient';
    var ResourceId = patientId;
    var Operation  = '$everything';
    var fullUrl = urlFHIREndpoint+ResourceClass+"/"+ResourceId+"/"+Operation; 
    
    var patientData = { 
        AllergyIntolerance : [],
        Condition : [],
        Immunization : [],
        MedicationRequest : []
    }
    

    try {
        // handling paging
        while(fullUrl){ 
            var response = await axios.get(fullUrl);
            var responseData = response.data;
            fullUrl = null; 
            var link = responseData.link;
            if (link){ 
                var nextUrl = link.find(page => { 
                    return page.relation === 'next'
                })
                if (nextUrl){
                    fullUrl = nextUrl.url;
                }
            }

            if (responseData.total > 0) { 
                entries = responseData.entry;
                entries.forEach(entry => {
                    var resourceType = entry.resource.resourceType;
                    if (patientData.hasOwnProperty(resourceType)) {
                        //deduping
                        if (!patientData[resourceType].includes(entry.resource)){
                            patientData[resourceType].push(entry.resource);
                        } 
                    }
                })
            }
        }
        //console.log(patientData);
        return patientData;
    }
    catch (error){ 
        return error;
    }

}

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
module.exports = { GetPatientInfo, GetClinicalInfo, GetProviderInfo, GetClinicalInfoOptimized }