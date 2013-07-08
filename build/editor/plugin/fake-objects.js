﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:51
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/fake-objects
*/

/**
 * fakeObjects for music ,video,flash
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fake-objects", function (S, Editor, HtmlParser) {
    var Node = S.Node,
        Dom = S.DOM,
        Utils = Editor.Utils,
        SPACER_GIF = Utils.debugUrl('theme/spacer.gif');

    S.augment(Editor, {
        //ie6 ,object outHTML error
        createFakeElement: function (realElement, className, realElementType, isResizable, outerHTML, attrs) {
            var style = realElement.attr("style") || '';
            if (realElement.attr("width")) {
                style = "width:" + realElement.attr("width") + "px;" + style;
            }
            if (realElement.attr("height")) {
                style = "height:" + realElement.attr("height") + "px;" + style;
            }
            var self = this,
            // add current class to fake element
                existClass = S.trim(realElement.attr('class')),
                attributes = {
                    'class': className + " " + existClass,
                    src: SPACER_GIF,
                    _ke_realelement: encodeURIComponent(outerHTML || realElement.outerHtml()),
                    _ke_real_node_type: realElement[0].nodeType,
                    style: style
                };

            if (attrs) {
                delete attrs.width;
                delete attrs.height;
                S.mix(attributes, attrs, false);
            }

            if (realElementType)
                attributes._ke_real_element_type = realElementType;

            if (isResizable)
                attributes._ke_resizable = isResizable;
            return new Node("<img/>", attributes, self.get("document")[0]);
        },

        restoreRealElement: function (fakeElement) {
            if (fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE) {
                return null;
            }

            var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));

            var temp = new Node('<div>', null, this.get("document")[0]);
            temp.html(html);
            // When returning the node, remove it from its parent to detach it.
            return temp.first().remove();
        }
    });


    var htmlFilterRules = {
        tags: {
            /**
             * 生成最终html时，从编辑器html转化把fake替换为真实，并将style的width,height搞到属性上去
             * @param element
             */
            $: function (element) {
                var realHTML = element.getAttribute("_ke_realelement");

                var realFragment;

                if (realHTML) {
                    realFragment = new HtmlParser.Parser(S.urlDecode(realHTML)).parse();
                }

                var realElement = realFragment && realFragment.childNodes[ 0 ];

                // If we have width/height in the element, we must move it into
                // the real element.
                if (realElement) {
                    var style = element.getAttribute("style");
                    if (style) {
                        // Get the width from the style.
                        var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style),
                            width = match && match[1];

                        // Get the height from the style.
                        match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);

                        var height = match && match[1];

                        if (width) {
                            realElement.setAttribute("width", width);
                        }
                        if (height) {
                            realElement.setAttribute("height", height);
                        }
                    }
                    return realElement;
                }

            }
        }
    };


    return {
        init: function (editor) {
            var dataProcessor = editor.htmlDataProcessor,
                htmlFilter = dataProcessor && dataProcessor.htmlFilter;

            if (dataProcessor.createFakeParserElement) {
                return;
            }

            if (htmlFilter) {
                htmlFilter.addRules(htmlFilterRules);
            }

            S.mix(dataProcessor, {

                restoreRealElement: function (fakeElement) {
                    if (fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE) {
                        return null;
                    }

                    var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));

                    var temp = new Node('<div>', null, editor.get("document")[0]);
                    temp.html(html);
                    // When returning the node, remove it from its parent to detach it.
                    return temp.first().remove();
                },

                /**
                 * 从外边真实的html，转为为编辑器代码支持的替换元素
                 * @param realElement
                 * @param className
                 * @param realElementType
                 * @param [isResizable]
                 */
                createFakeParserElement: function (realElement, className, realElementType, isResizable, attrs) {
                    var html = HtmlParser.serialize(realElement);
                    var style = realElement.getAttribute("style") || '';
                    if (realElement.getAttribute("width")) {
                        style = "width:" + realElement.getAttribute("width") + "px;" + style;
                    }
                    if (realElement.getAttribute("height")) {
                        style = "height:" + realElement.getAttribute("height") + "px;" + style;
                    }
                    // add current class to fake element
                    var existClass = S.trim(realElement.getAttribute("class")),
                        attributes = {
                            'class': className + " " + existClass,
                            src: SPACER_GIF,
                            _ke_realelement: encodeURIComponent(html),
                            _ke_real_node_type: realElement.nodeType + "",
                            style: style,
                            align: realElement.getAttribute("align") || ''
                        };

                    if (attrs) {
                        delete attrs.width;
                        delete attrs.height;
                        S.mix(attributes, attrs, false);
                    }

                    if (realElementType) {
                        attributes._ke_real_element_type = realElementType;
                    }
                    if (isResizable) {
                        attributes._ke_resizable = "_ke_resizable";
                    }
                    return new HtmlParser.Tag('img', attributes);
                }
            });
        }
    };
}, {
    requires: ["editor", 'html-parser']
});

