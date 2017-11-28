### Usage

You need to declare the module first, by requiring it:

`var Extract = require('../epubs');`

(or other relative path leading to this project);

Next, you need to create an instance of Extract class, by passing directory to the constructor:

`var extract = new Extract('../dir');`

Main method for the module is called `extractAllFiles`. It will process all the files in the directory with `.epub` extension file. Function returns a promise. It should always resolve to an array of information about process file with given structure:

````
{
    "file": "some/path/to.file"
    , "err": "Error: bad error"  // if error occured
    , "message": "friendly error info" // if error occured
}
````

*NOTE:* The script will NOT fail on single parsing failure and it's designed to work this way. After processing all the files, you retrieve the information about all the files. To know, if there was an error, there will be `err` and `message` property in the object related to faulty file.

### Test module

`test.js` file contains small script that will process all epub files in given directory. 

You can specify directory, by specifying it in the arguments, i.e. `node test.js ../somedir`.

Otherwise, it will try to read directory `../test_epubs`.

### Test coverage

To run all the tests, run `npm run test`.

To run all the test with coverage, run `npm run testcov`. It will create `coverage` folder with stats and print coverage summary after successful run.


````
=============================== Coverage summary ===============================
Statements   : 100% ( 45/45 )
Branches     : 100% ( 15/15 )
Functions    : 100% ( 7/7 )
Lines        : 100% ( 44/44 )
================================================================================
````