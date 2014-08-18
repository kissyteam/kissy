/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:31
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 stylesheet
*/

KISSY.add("stylesheet", ["dom"], function(S, require) {
  var Dom = require("dom");
  function StyleSheet(el) {
    if(el.el) {
      el = el.el
    }
    el = this.el = Dom.get(el);
    var sheet = el.sheet || el.styleSheet;
    this.sheet = sheet;
    var cssRules = {};
    this.cssRules = cssRules;
    var rulesName = sheet && "cssRules" in sheet ? "cssRules" : "rules";
    this.rulesName = rulesName;
    var domCssRules = sheet[rulesName];
    var i, rule, selectorText, styleDeclaration;
    for(i = domCssRules.length - 1;i >= 0;i--) {
      rule = domCssRules[i];
      selectorText = rule.selectorText;
      if(styleDeclaration = cssRules[selectorText]) {
        styleDeclaration.style.cssText += ";" + styleDeclaration.style.cssText;
        deleteRule(sheet, i)
      }else {
        cssRules[selectorText] = rule
      }
    }
  }
  StyleSheet.prototype = {constructor:StyleSheet, enable:function() {
    this.sheet.disabled = false;
    return this
  }, disable:function() {
    this.sheet.disabled = true;
    return this
  }, isEnabled:function() {
    return!this.sheet.disabled
  }, set:function(selectorText, css) {
    var sheet = this.sheet;
    var rulesName = this.rulesName;
    var cssRules = this.cssRules;
    var rule = cssRules[selectorText];
    var multiSelector = selectorText.split(/\s*,\s*/);
    var i;
    if(multiSelector.length > 1) {
      for(i = 0;i < multiSelector.length - 1;i++) {
        this.set(multiSelector[i], css)
      }
      return this
    }
    if(rule) {
      css = toCssText(css, rule.style.cssText);
      if(css) {
        rule.style.cssText = css
      }else {
        delete cssRules[selectorText];
        for(i = sheet[rulesName].length - 1;i >= 0;i--) {
          if(sheet[rulesName][i] === rule) {
            deleteRule(sheet, i);
            break
          }
        }
      }
    }else {
      var len = sheet[rulesName].length;
      css = toCssText(css);
      if(css) {
        insertRule(sheet, selectorText, css, len);
        cssRules[selectorText] = sheet[rulesName][len]
      }
    }
    return this
  }, get:function(selectorText) {
    var rule, css, selector, cssRules = this.cssRules;
    if(selectorText) {
      rule = cssRules[selectorText];
      return rule ? rule.style.cssText : null
    }else {
      css = [];
      for(selector in cssRules) {
        rule = cssRules[selector];
        css.push(rule.selectorText + " {" + rule.style.cssText + "}")
      }
      return css.join("\n")
    }
  }};
  var workerElement = document.createElement("p");
  function toCssText(css, base) {
    workerElement.style.cssText = base || "";
    Dom.css(workerElement, css);
    return workerElement.style.cssText
  }
  function deleteRule(sheet, i) {
    if(sheet.deleteRule) {
      sheet.deleteRule(i)
    }else {
      if(sheet.removeRule) {
        sheet.removeRule(i)
      }
    }
  }
  function insertRule(sheet, sel, css, i) {
    if(sheet.insertRule) {
      sheet.insertRule(sel + " {" + css + "}", i)
    }else {
      if(sheet.addRule) {
        sheet.addRule(sel, css, i)
      }
    }
  }
  return StyleSheet
});

