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

    (async() => {
      responseData.map((data, index) => {
        if (data.name === 'designation') {
          if (data.part[1].valueCoding.display === 'Fully specified name') {
            relationships.fsn = {code: data.part[1].valueCoding.code, valueString: data.part[2].valueString };
          }
          else if (data.part[1].valueCoding.display === 'Synonym') {
            relationships.synonym.push({code: data.part[1].valueCoding.code, valueString: data.part[2].valueString });
          }
        }
      })

      for (var i=0; i<responseData.length; i++) {
        if (responseData[i].name === 'property') {
          if (responseData[i].part[0].valueString === 'parent') {
            async function getString(code) {
              codeString = await GetString(code);
              relationships.parent.push({code: code, valueString: codeString});
            }
            await getString(responseData[i].part[1].valueCode);
        
          } 
          else if (responseData[i].part[0].valueString === 'child') {
            async function getString(code) {
              codeString = await GetString(code);
              relationships.child.push({code: code, valueString: codeString});
            }
            await getString(responseData[i].part[1].valueCode);
          }
        }
      }
      return relationships;
    })().then(relationships => console.log(relationships))
  
  } catch(error) {
    return error;
  }
  // console.log(relationships);
  // console.log(relationships);
  // return (relationships);

}

async function GetString(conceptCode) {
  var urlFHIREndpoint='https://snowstorm-alpha.ihtsdotools.org/fhir/';
  var ResourceClass  ='CodeSystem';
  var OperationName="$lookup"
  var code= conceptCode;
  var system= "http://snomed.info/sct";
  var Parameters="code="+code+"&"+"system="+system;
  var FullURL = urlFHIREndpoint+ResourceClass+"/"+OperationName+"?"+Parameters;
  
  var conceptString;

  try {
    var response = await axios.get(FullURL, mainConcept=false);
    var responseData = response.data.parameter;
    responseData.map((data, index) => {
      if (data.name === 'designation') {
        if (data.part[1].valueCoding.display === 'Fully specified name') {
          conceptString = data.part[2].valueString;
        }
      }
    })
  } catch(error) {
    return error;
  }
  return conceptString;
}

module.exports = { 
  GetRelationships, 
  GetString, 
  searchTerminologyPage : (req, res) => {
    res.render('search-terminology.ejs', { 
        title : "Search SNOMED Code", 
        message: ""
    })
  },

  searchTerminology: (async (req,  res) => {
    var code = req.body.SCTID;
    console.log(code)
    try { 
      (async () => {
        console.log('getting concept');
        var snomedRelationships = await GetRelationships(code);
        console.log(snomedRelationships);
                  // console.log(snomedRelationships);

                  // let codeString = await fhirTerminology.GetString(snomedRelationships.parent[0]);
                  
                  // console.log(codeString)
                  // snomedRelationships.parent.map(parent => {
                  //     let codeString = await fhirTerminology.GetString(parent);
                  // })
                  // let testCode = snomedRelationships && snomedRelationships;
                  // var result = await fhirTerminology.GetConcept(testCode);
                  // console.log(testCode);
      })();
      res.render('search-terminology.ejs', { 
          title : "Search SNOMED Code", 
          message: ""
      })
    }
    catch(error){
        console.log(error);
    }

  }),


};

