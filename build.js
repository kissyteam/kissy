var fs = require('fs');
var path = require('path');
var bowerDir = path.resolve(process.cwd(), 'bower_components');
var buildDir = path.resolve(process.cwd(), 'build');
var aggregateBower = require('aggregate-bower');
var inferBaseCode = '\nmodulex.init({name:"seed"});';

function generateSeedJs() {
    var seedDebugJsContent = '',
        seedJsContent = '',
        filesList = ['modulex', 'feature', 'ua', 'meta'];
    for (var i = 0; i < filesList.length; i++) {
        var debugFilePath = path.join(buildDir, filesList[i] + '-debug.js'),
            miniFilePath = path.join(buildDir, filesList[i] + '.js');
        seedDebugJsContent += fs.readFileSync(debugFilePath).toString();
        seedJsContent += fs.readFileSync(miniFilePath).toString();
    }

    seedDebugJsContent += getExtraContent();
    seedJsContent += getExtraContent();

    fs.writeFileSync(path.join(buildDir, 'seed-debug.js'), seedDebugJsContent + inferBaseCode);
    fs.writeFileSync(path.join(buildDir, 'seed.js'), seedJsContent + inferBaseCode);
}

function getExtraContent(){
    var kgConfigContent = '\nif( location !== undefined ){ modulex.config({ packages : { kg : { base : "//g.alicdn.com/kg/" } } }) }';
    return kgConfigContent;
}

aggregateBower(bowerDir, buildDir);
generateSeedJs();

console.log('done...');


