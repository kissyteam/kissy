/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:17
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/shim
*/

KISSY.add("component/extension/shim", [], function(S) {
  var ie6 = S.UA.ie === 6;
  var shimTpl = "<" + 'iframe style="position: absolute;' + "border: none;" + "width: " + (ie6 ? "expression(this.parentNode.clientWidth)" : "100%") + ";" + "top: 0;" + "opacity: 0;" + "filter: alpha(opacity=0);" + "left: 0;" + "z-index: -1;" + "height: " + (ie6 ? "expression(this.parentNode.clientHeight)" : "100%") + ";" + '"/>';
  function Shim() {
  }
  Shim.ATTRS = {shim:{value:ie6}};
  Shim.prototype.__createDom = function() {
    if(this.get("shim")) {
      this.get("el").prepend(shimTpl)
    }
  };
  return Shim
});

