// build a package
console.log(process.argv);
var dirname = __dirname;
var Path = require('path');
var root = Path.join(dirname, '../../');
var program = require(root + 'bin/lib/commander');
program
    .option('--packageName <packageName>')
    .option('--packageBase <packageBase>')
    .option('--destFile <destFile>')
    .option('--depFile <depFile>')
    .parse(process.argv);

var packageName = program.packageName;
var packageBase = program.packageBase;
var destFile = program.destFile;
var depFile = program.depFile;

packageBase = packageBase.replace(/\\/g, '/');

var kmc = require('kmc');

kmc.config({
    packages: [
        {
            // 'event/base'
            'name': packageName,
            'path': packageBase + Path.basename(packageName),
            ignorePackageNameInUri: true
        }
    ]
});

kmc.build({
    src: packageBase + Path.basename(packageName) + '.js',
    dest: destFile,
    depPath: depFile
});