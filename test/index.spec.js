const sinon = require('sinon')
    , assert = require('assert');

describe('extract epubs module', () => {
    const path = require('path')
        , fs = require('fs')
        , Extract = require('..')
        , extractModule = new Extract(path.resolve('test/testData'));

    describe('writeMetadata', () => { 
        let writeFile, mkdir;
        before(() => {
            writeFile = sinon.stub(fs, 'writeFile');
            mkdir = sinon.stub(fs, 'mkdir');
        });
        afterEach(() => {
            writeFile.reset();
            mkdir.reset();
        });
        after(() => {
            writeFile.restore();
            mkdir.restore();
        });
        it('should work', function(done) {
            mkdir.yields(null);
            writeFile.yields(null);
            let expectedDir = path.resolve('test/testData/some_file')
                , expectedFilePath = path.resolve('test/testData/some_file/index.json')
                , expectedMetadata = JSON.stringify({meta:'data'},null,2)
                ;
            extractModule.writeMetadata('some_file.epub', {meta:'data'}, err => {
                assert(!err, 'err');
                assert(mkdir.calledWith(expectedDir), 'writeFile called with bad args');
                assert(writeFile.calledWith(expectedFilePath, expectedMetadata), 'writeFile called with bad args');
                done();
            });
        });

        it('should fail on mkdir fail', function(done) {
            mkdir.yields('mkdir err');
            extractModule.writeMetadata('some_file.epub', {meta:'data'}, err => {
                assert.equal(err, 'mkdir err', 'err not passed');
                assert(writeFile.notCalled, 'writeFile called');
                done();
            });
        });

        it('should fail on writeFile fail', function(done) {
            mkdir.yields(null);
            writeFile.yields('writeFile err');
            extractModule.writeMetadata('some_file.epub', {meta:'data'}, err => {
                assert.equal(err, 'writeFile err', 'err not passed');
                assert(mkdir.called, 'mkdir not called');
                done();
            });
        });
    });

    describe('formatMetadata', () => {
        it('should work', () => {
            let data = {
                creator: 'creator'
                , title: 'title'
            };
            let expectedData = {
                title: 'creator: title'
                , contributors: ['creator']
            };
            assert.deepEqual(extractModule.formatMetadata(data), expectedData, 'bad formatted');
        });

        it('should return undefined if no data passed', () => {
            assert(!extractModule.formatMetadata());
        });

        it('should return undefined if no author', () => {
            assert(!extractModule.formatMetadata({title: 'title'}));
        });

        it('should return undefined if no title', () => {
            assert(!extractModule.formatMetadata({creator: 'creator'}));
        });
    });

    describe('getAllMetadata', () => {
        let extractMetadata;
        before(() => {
            extractMetadata = sinon.stub(extractModule, 'extractMetadata').resolves('abc');
        });
        after(() => {
            extractMetadata.restore();
        });
        it('should work and filter files without .epub extension', () => {
            let data = ['some_book.epub', '1.epub', 'system_file', 'file.epub.old', 'bookepub', '.epub']
                , promises = extractModule.getAllMetadata(data);
            assert.equal(promises.length, 2);
            assert(promises[0] instanceof Promise);
            assert.equal(extractMetadata.callCount, 2);
        });
        it('should work with empty array', () => {
            assert.deepEqual(extractModule.getAllMetadata([]), []);
        });
    });

    describe('extractMetadata', () => {
        let writeMetadata;
        before(() => {
            writeMetadata = sinon.stub(extractModule, 'writeMetadata');
        });
        afterEach(() => {
            writeMetadata.reset();
        });
        after(() => {
            writeMetadata.restore();
        });
        it('should work', done => {
            writeMetadata.yields(null);
            let promise = extractModule.extractMetadata('1.epub');
            promise.then(file => {
                assert.deepEqual(file, {file: path.join(path.resolve('test/testData'), '1.epub')});
                done();
            }, err => {});
        });
    });

    describe('extractAllFiles', () => {
        let writeMetadata;
        before(() => {
            writeMetadata = sinon.stub(extractModule, 'writeMetadata');
        });
        afterEach(() => {
            writeMetadata.reset();
        });
        after(() => {
            writeMetadata.restore();
        });
        it('should work and get info on fails', done => {
            writeMetadata.yields(null);
            let promise = extractModule.extractAllFiles();
            promise.then(files => {
                assert.equal(files.length, 2);
                assert.deepEqual(files[0], {file: path.join(path.resolve('test/testData'), '1.epub')});
                assert.deepEqual(files[1].file, path.join(path.resolve('test/testData'), '2.epub'));
                assert.equal(files[1].message, 'Error while parsing ePub file');
                assert.equal(files[1].err, 'Error: Invalid/missing file');
                done();
            }, err => {});
        });
        it('should fail on bad dir', done => {
            let readdir = sinon.stub(fs, 'readdir');
            readdir.yields('readdir err');
            let promise = extractModule.extractAllFiles();
            promise.then(files => {
            }, err => {
                assert.equal(err, 'readdir err');
                readdir.restore();
                done();
            });
        });
    });
});
