/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 10 10:12
*/
/**
 * Normalize operation about stylesheet
 * @author yiminghe@gmail.com
 */
KISSY.add("stylesheet", function (S, DOM) {

    /**
     * @name StyleSheet
     * @class
     * Normalize operation about stylesheet
     * @param ownerNode {HTMLElement} style/link element
     */
    function StyleSheet(ownerNode) {
        this['ownerNode'] = DOM.get(ownerNode);
        // http://msdn.microsoft.com/en-us/library/ie/ms535871(v=vs.85).aspx
        // firefox 跨域时抛出异常
        var sheet = ownerNode.sheet || ownerNode.styleSheet;

        this.sheet = sheet;

        var cssRules = {};

        this.cssRules = cssRules;

        var rulesName = sheet && ('cssRules' in sheet) ? 'cssRules' : 'rules';

        this.rulesName = rulesName;

        var domCssRules = sheet[rulesName];

        var i, rule, selectorText, styleDeclaration;

        for (i = domCssRules.length - 1; i >= 0; i--) {
            rule = domCssRules[i];
            selectorText = rule.selectorText;
            // 去重
            if (styleDeclaration = cssRules[selectorText]) {
                styleDeclaration.style.cssText += ";" + styleDeclaration.style.cssText;
                deleteRule(sheet, i);
            } else {
                cssRules[selectorText] = rule;
            }
        }
    }

    StyleSheet.prototype = {

        constructor:StyleSheet,

        /**
         * Make current stylesheet enabled.
         * @return {StyleSheet} current StyleSheet instance.
         */
        enable:function () {
            this.sheet.disabled = false;
            return this;
        },

        /**
         * Make current stylesheet disabled.
         * @return {StyleSheet} current StyleSheet instance.
         */
        disable:function () {
            this.sheet.disabled = true;
            return this;
        },

        /**
         * Whether current stylesheet is enabled.
         * @return {Boolean}
         */
        isEnabled:function () {
            return !this.sheet.disabled;
        },

        /**
         * Set sheet's rule by selectorText and css.
         * @param {String} selectorText selector text separated by ,
         * @param {Object} css style declaration object. set value to "" to unset
         * @example
         * <code>
         *      // set
         *      set("p",{color:'red'})
         *      // unset
         *      set("p",{color:''})
         * </code>
         * @return {StyleSheet} current StyleSheet instance.
         */
        set:function (selectorText, css) {
            var sheet = this.sheet;
            var rulesName = this.rulesName;
            var cssRules = this.cssRules;
            var rule = cssRules[selectorText];
            var multiSelector = selectorText.split(/\s*,\s*/);
            var i;

            if (multiSelector.length > 1) {
                for (i = 0; i < multiSelector.length - 1; i++) {
                    this.set(multiSelector[i], css);
                }
                return this;
            }

            if (rule) {
                css = toCssText(css, rule.style.cssText);
                if (css) {
                    rule.style.cssText = css;
                } else {
                    // unset remove this rule
                    delete cssRules[selectorText];
                    for (i = sheet[rulesName].length - 1; i >= 0; i--) {
                        if (sheet[rulesName][i] == rule) {
                            deleteRule(sheet, i);
                            break;
                        }
                    }
                }
            } else {
                var len = sheet[rulesName].length;
                css = toCssText(css);
                if (css) {
                    insertRule(sheet, selectorText, css, len);
                    cssRules[selectorText] = sheet[rulesName][len];
                }
            }

            return this;
        },

        /**
         * Get cssText corresponding to specified selectorText
         * @param {String} selectorText specified selector as string
         * @return {String} CssText corresponding to specified selectorText
         */
        get:function (selectorText) {
            var rule, css, selector, cssRules = this.cssRules;

            if (selectorText) {
                rule = cssRules[selectorText];

                return rule ? rule.style.cssText : null;
            } else {
                css = [];
                for (selector in cssRules) {
                    if (cssRules.hasOwnProperty(selector)) {
                        rule = cssRules[selector];
                        css.push(rule.selectorText + " {" + rule.style.cssText + "}");
                    }
                }
                return css.join("\n");
            }
        }

    };


    // # ------------------ private start

    var workerElement = document.createElement("p"),
        workerStyle = workerElement.style;

    function toCssText(css, base) {
        workerStyle.cssText = base || "";
        DOM.css(workerElement, css);
        return workerStyle.cssText;
    }

    function deleteRule(sheet, i) {
        if (sheet.deleteRule) {
            sheet.deleteRule(i);
        } else if (sheet.removeRule) {
            sheet.removeRule(i);
        }
    }

    function insertRule(sheet, sel, css, i) {
        if (sheet.insertRule) {
            sheet.insertRule(sel + ' {' + css + '}', i);
        } else if (sheet.addRule) {
            sheet.addRule(sel, css, i);
        }
    }

    // # ------------------ private end

    return StyleSheet;

}, {
    requires:['dom']
});
/**
 * Refer
 *  - http://www.w3.org/TR/DOM-Level-2-Style/css.html
 *  - rule.style.cssText 和 el.style.cssText 效果一样，同属于 CSSStyleDeclare
 **/
