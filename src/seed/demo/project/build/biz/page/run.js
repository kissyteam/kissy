/*
 Combined modules by KISSY Module Compiler: 

 biz/x
 biz/y
 biz/page/run
*/

KISSY.add("biz/x", function() {
  return"x + overlay"
}, {requires:["overlay", "./x.css"]});
KISSY.add("biz/y", function(S, x) {
  return"y + " + x
}, {requires:["./x", "./y.css"]});
KISSY.add("biz/page/run", function(S, y) {
  return"run + " + y
}, {requires:["../y"]});

