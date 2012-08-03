/**
 * fakeobjects for music ,video,flash
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("fakeobjects", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        Node = S.Node,
        KEN = KE.NODE,
        SPACER_GIF = KE['Config'].base + '../theme/spacer.gif',
        HtmlParser = KE.HtmlParser,
        Editor = S.Editor,
        dataProcessor = editor.htmlDataProcessor,
        htmlFilter = dataProcessor && dataProcessor.htmlFilter;

    var htmlFilterRules = {
        elements : {
            /**
             * 生成最终html时，从编辑器html转化把fake替换为真实，并将style的width,height搞到属性上去
             * @param element
             */
            $ : function(element) {
                var attributes = element.attributes,
                    realHtml = attributes && attributes._ke_realelement,
                    realFragment = realHtml && new HtmlParser.Fragment.FromHtml(decodeURIComponent(realHtml)),
                    realElement = realFragment && realFragment.children[ 0 ];

                // If we have width/height in the element, we must move it into
                // the real element.
                if (realElement && element.attributes._ke_resizable) {
                    var style = element.attributes.style;
                    if (style) {
                        // Get the width from the style.
                        var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style),
                            width = match && match[1];
                        // Get the height from the style.
                        match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
                        var height = match && match[1];

                        if (width)
                            realElement.attributes.width = width;

                        if (height)
                            realElement.attributes.height = height;
                    }
                }
                return realElement;
            }
        }
    };


    if (htmlFilter)
        htmlFilter.addRules(htmlFilterRules);


    if (dataProcessor) {
        S.mix(dataProcessor, {

            /**
             * 从外边真实的html，转为为编辑器代码支持的替换元素
             * @param realElement
             * @param className
             * @param realElementType
             * @param isResizable
             */
            createFakeParserElement:function(realElement, className, realElementType, isResizable, attrs) {
                var html,
                    writer = new HtmlParser.BasicWriter();
                realElement.writeHtml(writer);
                html = writer.getHtml();
                var style = realElement.attributes.style || '';
                if (realElement.attributes.width) {
                    style = "width:" + realElement.attributes.width + "px;" + style;
                }
                if (realElement.attributes.height) {
                    style = "height:" + realElement.attributes.height + "px;" + style;
                }
                // add current class to fake element
                var existClass = S.trim(realElement.attributes['class']),
                    attributes = {
                        'class' : className + " " + existClass,
                        src : SPACER_GIF,
                        _ke_realelement : encodeURIComponent(html),
                        _ke_real_node_type : realElement.type,
                        style:style,
                        align : realElement.attributes.align || ''
                    };
                attrs && delete attrs.width;
                attrs && delete attrs.height;

                attrs && S.mix(attributes, attrs, false);

                if (realElementType) {
                    attributes._ke_real_element_type = realElementType;
                }
                if (isResizable) {
                    attributes._ke_resizable = isResizable;
                }
                return new HtmlParser.Element('img', attributes);
            }
        });
    }
    if (!editor.createFakeElement) {
        S.augment(Editor, {
            //ie6 ,object outHTML error
            createFakeElement:function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
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
                        'class' : className + " " + existClass,
                        src : SPACER_GIF,
                        _ke_realelement : encodeURIComponent(outerHTML || realElement._4e_outerHtml()),
                        _ke_real_node_type : realElement[0].nodeType,
                        //align : realElement.attr("align") || '',
                        style:style
                    };
                attrs && delete attrs.width;
                attrs && delete attrs.height;

                attrs && S.mix(attributes, attrs, false);
                if (realElementType)
                    attributes._ke_real_element_type = realElementType;

                if (isResizable)
                    attributes._ke_resizable = isResizable;
                return new Node("<img/>", attributes, self.document);
            },

            restoreRealElement:function(fakeElement) {
                if (fakeElement.attr('_ke_real_node_type') != KEN.NODE_ELEMENT)
                    return null;
                var html = (decodeURIComponent(fakeElement.attr('_ke_realelement')));

                var temp = new Node('<div>', null, this.document);
                temp.html(html);
                // When returning the node, remove it from its parent to detach it.
                return temp._4e_first(
                    function(n) {
                        return n[0].nodeType == KEN.NODE_ELEMENT;
                    })._4e_remove();
            }
        });
    }

}, {
    attach:false,
    requires:["htmldataprocessor"]
});
