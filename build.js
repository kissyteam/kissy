var path = require('path');
var bowerDir = path.resolve(process.cwd(), 'bower_components');
var buildDir = path.resolve(process.cwd(), 'build');
var aggregateBower = require('aggregate-bower');
aggregateBower(bowerDir,buildDir);
console.log('done');
