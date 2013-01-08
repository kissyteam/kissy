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

//================================>>
// prepare for scope-spec.js:

function get_script_text(URI) {
    var F = File(URI);
    try {
        F.open('r');
        return F.read(F.length);
    }
    finally {
        F.close();
    }
}

function bind_in_scope(obj) {
    return function(s) {
        return function() {
            with (obj) return eval(s)
        }.call(obj)
    }
}

exec_in_global = function(host) {
    var F = bind_in_scope(host);
    return function(URI) {
        return F(get_script_text(URI));
    }
}(this);

$.evalFile(File('seed-cases.js'));
T.mix(T, {
    //echo: console.log,
    run: exec_in_global
});

$.evalFile(File('scope-spec.js'));
//=================================<<

// go
JasmineLite.excute();
'done';
