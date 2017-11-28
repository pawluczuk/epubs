const EPub = require('epub'),
    fs = require('fs'),
    path = require('path');

class Extract {
    constructor(dir) {
        this.dir = dir;
    }

    formatMetadata(metadata) {
        if (!metadata || !metadata.title || !metadata.creator) {
            return undefined;
        }

        return {
            title: `${metadata.creator}: ${metadata.title}`,
            contributors: [metadata.creator]
        };
    }

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

    saveMetadata(epub, file, resolve, reject) {
        const metadata = this.formatMetadata(epub.metadata);
        
        if (!metadata) {
            const message = 'No metadata to be saved';
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

    extractMetadata(file) {
        return new Promise((resolve, reject) => {
            file = path.resolve(this.dir, file);
            const epub = new EPub(file);

            epub
                .on('end', () => {                   
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

    getAllMetadata(files) {
        return files
            .filter(file => {
                return /.+\.epub$/i.test(file);
            })
            .map(file => {
                console.log(file)
                let promise =  this.extractMetadata(file);
                console.log(promise);
                return promise.catch(e => e);
            });
    }

    extractAllFiles() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.dir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                const promises = this.getAllMetadata(files);

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
