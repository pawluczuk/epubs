const Extract = require('./index');
const extract = new Extract('../test_epubs');

extract.extractAllFiles()
    .then(data => {
        const faultFiles = data.filter(d => {
            return !!d.err; 
        });
        console.log(`Successfully parsed ${data.length - faultFiles.length} out of ${data.length} files.`);
        console.log('Faulty files information:');
        faultFiles.forEach(file => {
            console.log(`${file.file}: ${file.message}\n\t${file.err}`)
        });
    })
    .catch(err => {
        if (err) {
            console.error(`Unhandled error occured: ${JSON.stringify(err)}`);
        }
    });
