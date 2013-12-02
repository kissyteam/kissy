/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:12
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/content-xtpl
*/

KISSY.add("component/extension/content-xtpl", [], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, getExpressionUtil = utils.getExpression, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div id="ks-content-';
    var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1, undefined, false);
    buffer += getExpressionUtil(id0, true);
    buffer += '"\n           class="';
    var config2 = {};
    var params3 = [];
    params3.push("content");
    config2.params = params3;
    var id1 = getPropertyOrRunCommandUtil(engine, scope, config2, "getBaseCssClasses", 0, 2, true, undefined);
    buffer += id1;
    buffer += '">';
    var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 2, undefined, false);
    buffer += getExpressionUtil(id4, false);
    buffer += "</div>";
    return buffer
  }
});

