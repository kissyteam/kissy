/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:16
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
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div id="ks-content-';
    var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '"\n           class="';
    var config2 = {};
    var params3 = [];
    params3.push("content");
    config2.params = params3;
    var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id1, true);
    buffer += '">';
    var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 2);
    buffer += renderOutputUtil(id4, false);
    buffer += "</div>";
    return buffer
  }
});

