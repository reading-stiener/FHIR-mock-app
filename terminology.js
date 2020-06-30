const Client = require('fhir-kit-client');
const axios   = require('axios');


async function GetRelationships(conceptCode) {
  var urlFHIREndpoint='https://snowstorm-alpha.ihtsdotools.org/fhir/';
  var ResourceClass  ='CodeSystem';
  var OperationName="$lookup"
  var code= conceptCode;
  var system= "http://snomed.info/sct";
  var Parameters="code="+code+"&"+"system="+system;
  var FullURL = urlFHIREndpoint+ResourceClass+"/"+OperationName+"?"+Parameters;

  let relationships = {
    parent: [], 
    child: [], 
    synonym: [], 
    fsn: {}
  }

  try {
    var response = await axios.get(FullURL);
    var responseData = response.data.parameter;
    responseData.map((data, index) => {
      if (data.name === 'designation') {
        if (data.part[1].valueCoding.display === 'Fully specified name') {
          relationships.fsn = {code: data.part[1].valueCoding.code, valueString: data.part[2].valueString };
        }
        else if (data.part[1].valueCoding.display === 'Synonym') {
          relationships.synonym.push({code: data.part[1].valueCoding.code, valueString: data.part[2].valueString });
        }
      }

      if (data.name === 'property') {
        if (data.part[0].valueString === 'parent') {
          // async function getString ((data) => {
          //   let code = data.part[1].valueCode;
          //   console.log(data.part[1].valueCode);
          //   let valueString = await GetString(code);
          //   return valueString;
          //   //relationships.parent.push({code: data.part[1].valueCode, valueString: valueString});
          // })

          relationships.parent.push(data.part[1].valueCode);

        } 
        else if (data.part[0].valueString === 'child') {
          relationships.child.push(data.part[1].valueCode);
        }
      }
    })
    console.log(relationships)
  
  } catch(error) {
    return error;
  }
}

async function GetString(conceptCode) {
  var urlFHIREndpoint='https://snowstorm-alpha.ihtsdotools.org/fhir/';
  var ResourceClass  ='CodeSystem';
  var OperationName="$lookup"
  var code= conceptCode;
  var system= "http://snomed.info/sct";
  var Parameters="code="+code+"&"+"system="+system;
  var FullURL = urlFHIREndpoint+ResourceClass+"/"+OperationName+"?"+Parameters;
  
    console.log(conceptCode);
  try {
    var response = await axios.get(FullURL, mainConcept=false);
    var responseData = response.data.parameter;
    responseData.map((data, index) => {
      if (data.name === 'designation') {
        if (data.part[1].valueCoding.display === 'Fully specified name') {
          return data.part[2].valueString;
        }
      }
    })
  } catch(error) {
    return error;
  }
}

module.exports = { GetRelationships, GetString };

