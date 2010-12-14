// set host type
this.hostType = 'console';

load('../../../tools/jasmine/jasmine-lite.js');

load('../kissy.js');
load('../lang.js');

load('kissy-spec.js');
load('lang-spec.js');


//============================>>
// prepare for scope-spec.js:

function get_script_text(url) {
    return readFile(url);
}

function bind_in_scope(obj) {
    return function(s) {
        return function() {
            with (obj) return eval(s);
        }.call(obj);
    };
}

function exec_in_global(url) {
    load(url);
}

load('seed-cases.js');
T.mix(T, {
    //echo: console.log,
    run: exec_in_global
});

load('scope-spec.js');
//=============================<<

// go
JasmineLite.excute();
'done';
