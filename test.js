const Extract = require('./index');
const extract = new Extract('../test_epubs');

extract.extractAllFiles()
    .then(data => {
        console.log("Successfully parsed:", data);
    })
    .catch(err => {
        console.log(`Error occured: ${err.message} for file: ${err.file}. Error details ${err.err}`);
    });