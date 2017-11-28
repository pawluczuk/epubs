const Extract = require('./index');
const epubDir = process.argv.length > 2 ? process.argv[2] : '../test_epubs';
const extract = new Extract(epubDir);

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
