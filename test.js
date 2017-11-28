const Extract = require('./index');
const extract = new Extract('../test_epubs');
console.log(extract)
// test
let dir = '../test_epubs';
extract.extractAllFiles(dir)
    .then(data => {
        console.log("Successfully parsed:", data);
    })
    .catch(err => {
        console.log(`Error occured: ${err.message} for file: ${err.file}. Error details ${err.err}`);
    });