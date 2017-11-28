const EPub = require('epub'),
    fs = require('fs'),
    path = require('path');

class Extract {
    constructor(dir) {
        this.dir = dir;
    }

    saveMetadata(dir, file, metadata, cb) {
        let folderName = file.replace(/.epub$/i, ''),
            folderPath = path.resolve(dir, folderName);

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

    extractMetadata(dir, file) {
        return new Promise((resolve, reject) => {
            file = path.resolve(dir, file);
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

                    this.saveMetadata(dir, file, metadata, err => {
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

    mapDirectoryFiles(dir, files) {
        return files
            .filter(file => {
                return /.*\.epub$/i.test(file);
            })
            .map(file => {
                return this.extractMetadata(dir, file);
            });
    };

    extractAllFiles(dir) {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                let promises = this.mapDirectoryFiles(dir, files);

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