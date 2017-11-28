const EPub = require('epub'),
    fs = require('fs'),
    path = require('path');

class Extract {
    constructor(dir) {
        this.dir = dir;
    }

    /**
     * Formats metadata (title and contributors)
     * @param {Object} metadata 
     */
    formatMetadata(metadata) {
        if (!metadata || !metadata.title || !metadata.creator) {
            return undefined;
        }

        return {
            title: `${metadata.creator}: ${metadata.title}`,
            contributors: [metadata.creator]
        };
    }

    /**
     * Saves metadata file. Creates index.json file in a folder matching name of the epub file
     * @param {String} file 
     * @param {Object} metadata 
     * @param {Function} cb 
     */
    writeMetadata(file, metadata, cb) {
        const folderName = file.replace(/\.epub$/i, ''),
            folderPath = path.resolve(this.dir, folderName);

        fs.mkdir(folderPath, err => {
            if (err) {
                return cb(err);
            }
            const indexPath = path.resolve(folderPath, 'index.json');
            fs.writeFile(indexPath, JSON.stringify(metadata, null, 2), err => {
                if (err) {
                    return cb(err);
                }
                return cb(null);
            });
        });
    }

    /**
     * Reads the parsed epub metadata, formats it and saves it
     * @param {Object} epub 
     * @param {String} file 
     * @param {Function} resolve 
     * @param {Function} reject 
     */
    saveMetadata(epub, file, resolve, reject) {
        const metadata = this.formatMetadata(epub.metadata);
        
        if (!metadata) {
            const message  = 'No metadata to be saved'
                , err = message;
            return reject({
                file,
                err,
                message
            });
        }

        this.writeMetadata(file, metadata, err => {
            if (err) {
                const message = 'Error saving metadata';
                return reject({
                    file,
                    err,
                    message
                });
            }
            return resolve({
                file
            });
        });
    }

    /**
     * Parses epub with a given path and saves its metadata 
     * @param {String} file 
     */
    extractMetadata(file) {
        return new Promise((resolve, reject) => {
            file = path.resolve(this.dir, file);
            const epub = new EPub(file);

            epub
                .on('end', () => { 
                    // epub was parsed successfully                  
                    return this.saveMetadata(epub, file, resolve, reject);
                })
                .on('error', err => {
                    const message = 'Error while parsing ePub file';
                    return reject({
                        file,
                        err,
                        message
                    });
                });

            epub.parse();
        });
    }
    /**
     * Maps array of files to array of Promises that resolve to extract file's metadata
     * @param {Array<String>} files 
     */
    getAllMetadata(files) {
        return files
            .filter(file => {
                return /.+\.epub$/i.test(file);
            })
            .map(file => {
                // catches the error so that single file processing won't stop all files execution
                return this.extractMetadata(file).catch(e => e);
            });
    }

    /**
     * Processes all epub files in a given directory 
     * and saves their metadata in a created folder with name of the book
     */
    extractAllFiles() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.dir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                const promises = this.getAllMetadata(files);
                // return when all files have been processed
                return Promise.all(promises)
                    .then(data => {
                        resolve(data);
                    }, err => {
                        reject(err);
                    });
            });
        });
    }
}

module.exports = Extract;
