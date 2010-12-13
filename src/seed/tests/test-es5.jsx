var TheTest = File.openDialog('Select file', 'test-es5.js');
Folder.current = TheTest.path;

console = {
    log: function(msg) {
        $.writeln(msg);
    }
};

$.evalFile(File('../../../tools/jasmine/jasmine-lite.js'));

$.evalFile(File('../kissy.js'));
$.evalFile(File('../lang.js'));

$.evalFile(File('kissy-spec.js'));
$.evalFile(File('lang-spec.js'));

JasmineLite.excute();
'done';