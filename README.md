# FHIR Clients Assignment

This repository is an example of mock app that uses the a test FHIR server and the `fhir-kit-client`
library as the FHIR client. Follow the instructions below to run the app on your machine. The application
is a simple express app running on a SQLite database locally and on the patient data hosted externally on
test FHIR server. The fhir-kit-client library makes it simple for us to pull and push patient data to the 
server.

## Setting up the project

- Git clone the repository.
- Move to working directory on the terminal
- Execute the following to install dependencies

```bash
npm install
```

## Running the app

- Execute the following on terminal to FHIR up the app!

```bash
node index.js
```
