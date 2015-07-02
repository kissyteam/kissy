var fs = require('fs');
var path = require('path');
var bowerDir = path.resolve(process.cwd(), 'bower_components');
var buildDir = path.resolve(process.cwd(), 'build');
var aggregateBower = require('aggregate-bower');
var inferBaseCode = 'modulex.init({name:"seed"});';
var kgConfigContent = 'modulex.config({ packages : { kg : { base : "//g.alicdn.com/kg/" }}});';
var extraContent = ['', inferBaseCode, kgConfigContent].join('\n');

function generateSeedJs() {
    var seedDebugJsContent = '',
        seedJsContent = '',
        filesList = ['modulex', 'feature', 'ua', 'meta'];
    for (var i = 0; i < filesList.length; i++) {
        var debugFilePath = path.join(buildDir, filesList[i] + '-debug.js'),
            miniFilePath = path.join(buildDir, filesList[i] + '.js');
        if (fs.existsSync(debugFilePath)) {
            seedDebugJsContent += fs.readFileSync(debugFilePath).toString();
            seedJsContent += fs.readFileSync(miniFilePath).toString();
        }
    }
    fs.writeFileSync(path.join(buildDir, 'seed-debug.js'), seedDebugJsContent + extraContent);
    fs.writeFileSync(path.join(buildDir, 'seed.js'), seedJsContent + extraContent);
}

aggregateBower(bowerDir, buildDir);
generateSeedJs();

console.log('done...');


