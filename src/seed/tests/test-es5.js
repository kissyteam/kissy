'use strict';

// set host type
this.hostType = 'console';

load('../../../tools/jasmine/jasmine-lite.js');

load('../kissy.js');
load('../lang.js');

load('kissy-spec.js');
load('lang-spec.js');

// go
JasmineLite.excute();

'done';
