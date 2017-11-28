const extract = require('./index');

// test
let dir = '../test_epubs';
extract.extractAllFiles(dir)
    .then(data => {
        console.log("Successfully parsed:", data);
    })
    .catch(err => {
        console.log(`Error occured: ${err.message} for file: ${err.file}. Error details ${err.err}`);
    });