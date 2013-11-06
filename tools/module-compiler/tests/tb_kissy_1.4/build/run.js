/*
 Combined processedModules by KISSY Module Compiler: 

 biz/x
 biz/y
 biz
*/

KISSY.add("biz/x", function(S, KISSY_1383746961171, KISSY_1383746961172, KISSY_1383746961173) {
  return"x + overlay +  node"
}, {requires:["overlay", "node", "./x.css"]});
KISSY.add("biz/y", function(S, x, KISSY_1383746961170) {
  return"y + " + x
}, {requires:["./x", "./y.css"]});
KISSY.add("biz", function(S, y) {
  return"run + " + y
}, {requires:["biz/y"]});

