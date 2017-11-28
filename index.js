const EPub = require('epub'),
    fs = require('fs'),
    path = require('path');

class Extract {
    constructor(dir) {
        this.dir = dir;
    }

    saveMetadata(file, metadata, cb) {
        let folderName = file.replace(/.epub$/i, ''),
            folderPath = path.resolve(this.dir, folderName);

        fs.mkdir(folderPath, err => {
            if (err) {
                return cb(err);
            }
            let indexPath = path.resolve(folderPath, 'index.json');
            fs.writeFile(indexPath, JSON.stringify(metadata, null, 2), err => {
                if (err) {
                    return cb(err);
                }
                cb(null);
            });
        });
    }

    formatMetadata(metadata) {
        if (!metadata || !metadata.title || !metadata.creator) {
            return undefined;
        }
        let formattedMetada = {};
        formattedMetada.title = `${metadata.creator}: ${metadata.title}`;
        formattedMetada.contributors = [metadata.creator];
        return formattedMetada;
    };

    extractMetadata(file) {
        return new Promise((resolve, reject) => {
            file = path.resolve(this.dir, file);
            let epub = new EPub(file);

            epub
                .on('end', (err) => {
                    if (err) {
                        let message = 'Error parsing ePub file';
                        return reject({
                            file,
                            err,
                            message
                        });
                    }

                    let metadata = this.formatMetadata(epub.metadata);

                    if (!metadata) {
                        let message = 'No metadata to be saved';
                        return reject({
                            file,
                            err,
                            message
                        });
                    }

                    this.saveMetadata(file, metadata, err => {
                        if (err) {
                            let message = 'Error saving metadata';
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
                })
                .on('error', (err) => {
                    let message = 'Error while parsing ePub file';
                    return reject({
                        file,
                        err,
                        message
                    });
                });

            epub.parse();
        });
    };

    mapDirectoryFiles(files) {
        return files
            .filter(file => {
                return /.*\.epub$/i.test(file);
            })
            .map(file => {
                return this.extractMetadata(file);
            });
    };

    extractAllFiles() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.dir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                let promises = this.mapDirectoryFiles(files);

                return Promise.all(promises)
                    .then(data => {
                        resolve(data);
                    }, err => {
                        reject(err);
                    });
            });
        });
    }
};

module.exports = Extract;