/************************************
 *          Jasmine Lite            *
 ************************************/
var JasmineLite = {
    Cases: [],
    Specs: []
};

function describe(name, fn) {
    JasmineLite.Cases.push({ name: name, fn: fn });
}

function it(desc, fn) {
    JasmineLite.Specs.push({ desc: desc, fn: fn });
}

function xit() {
}

function Expect(actual) {
    this.actual = actual;
}

Expect.prototype = {
    toBe: function(expected) {
        if (this.actual !== expected) {
            throw {
                type: 'Jasmine',
                msg: 'expected ' + this.actual + ' to be ' + expected
            };
        }
    }
};

function expect(actual) {
    return new Expect(actual);
}

function report(passed, desc, msg) {
    var pre = typeof passed === 'boolean' ?
        passed ? '  [passed] ' : '  [failed] '
        : passed || '';
    console.log(pre + (desc || '') + (msg ? ': ' + msg : ''));
}

JasmineLite.excute = function() {
    var JL = this;

    JL.Cases.forEach(function(c) {
        // populate specs
        c.fn();

        // start run specs
        report(c.name);
        JL.Specs.forEach(function(spec) {
            try {
                spec.fn();
                report(true, spec.desc);
            } catch(ex) {
                if (ex.type === 'Jasmine') {
                    report(false, spec.desc, ex.msg);
                } else {
                    throw ex;
                }
            }
        });

        // clear
        JL.Specs = [];
    });
};


// add name to host
this.name = 'BESENShell';

// load test files
load('../kissy.js');
//load('../lang.js');

//load('kissy-spec.js');
//load('lang-spec.js');

// go
JasmineLite.excute();
