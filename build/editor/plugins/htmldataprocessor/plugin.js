/**
 * modified from ckeditor,process malform html and ms-word copy for kissyeditor
 * @modifier yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmldataprocessor", function (editor) {
    var undefined = undefined,
        S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        UA = S.UA,
        KEN = KE.NODE,
        HtmlParser = KE.HtmlParser,
        htmlFilter = new HtmlParser.Filter(),
        dataFilter = new HtmlParser.Filter(),
        wordFilter = new HtmlParser.Filter(),
        dtd = KE.XHTML_DTD;
    //每个编辑器的规则独立
    if (editor.htmlDataProcessor) return;

    /**
     * 给 fragment,Element,Dtd 加一些常用功能
     */
    (function () {

        var fragmentPrototype = KE.HtmlParser.Fragment.prototype,
            elementPrototype = KE.HtmlParser.Element.prototype;

        fragmentPrototype['onlyChild'] =
            elementPrototype.onlyChild = function () {
                var children = this.children,
                    count = children.length,
                    firstChild = ( count == 1 ) && children[ 0 ];
                return firstChild || null;
            };

        elementPrototype.removeAnyChildWithName = function (tagName) {
            var children = this.children,
                childs = [],
                child;

            for (var i = 0; i < children.length; i++) {
                child = children[ i ];
                if (!child.name)
                    continue;

                if (child.name == tagName) {
                    childs.push(child);
                    children.splice(i--, 1);
                }
                childs = childs.concat(child.removeAnyChildWithName(tagName));
            }
            return childs;
        };

        elementPrototype['getAncestor'] = function (tagNameRegex) {
            var parent = this.parent;
            while (parent && !( parent.name && parent.name.match(tagNameRegex) )) {
                parent = parent.parent;
            }
            return parent;
        };

        fragmentPrototype.firstChild = elementPrototype.firstChild = function (evaluator) {
            var child;

            for (var i = 0; i < this.children.length; i++) {
                child = this.children[ i ];
                if (evaluator(child))
                    return child;
                else if (child.name) {
                    child = child.firstChild(evaluator);
                    if (child)
                        return child;
                }
            }

            return null;
        };

        // Adding a (set) of styles to the element's 'style' attributes.
        elementPrototype.addStyle = function (name, value, isPrepend) {
            var styleText, addingStyleText = '';
            // name/value pair.
            if (typeof value == 'string')
                addingStyleText += name + ':' + value + ';';
            else {
                // style literal.
                if (typeof name == 'object') {
                    for (var style in name) {
                        if (name.hasOwnProperty(style))
                            addingStyleText += style + ':' + name[ style ] + ';';
                    }
                }
                // raw style text form.
                else
                    addingStyleText += name;

                isPrepend = value;
            }

            if (!this.attributes)
                this.attributes = {};

            styleText = this.attributes.style || '';

            styleText = ( isPrepend ?
                [ addingStyleText, styleText ]
                : [ styleText, addingStyleText ] ).join(';');

            this.attributes.style = styleText.replace(/^;|;(?=;)/, '');
        };

        /**
         * Return the DTD-valid parent tag names of the specified one.
         * @param tagName
         */
        dtd.parentOf = function (tagName) {
            var result = {};
            for (var tag in this) {
                if (this.hasOwnProperty(tag)) {
                    if (tag.indexOf('$') == -1 && this[ tag ][ tagName ])
                        result[ tag ] = 1;
                }
            }
            return result;
        };
    })();

    /**
     * 常用的规则：
     * 1。过滤一些常见东西
     * 2。处理 word 复制过来的列表
     */
    (function () {
        var //equalsIgnoreCase = KE.Utils.equalsIgnoreCase,
            filterStyle = stylesFilter([
                // word 自有属性名去除
                [/mso/i],
                [/w:WordDocument/i],
                // ie 自有属性名[/mso/i],
                [/^-ms/i],
                // firefox 自有属性名
                [/^-moz/i],
                // webkit 自有属性名
                [/^-webkit/i]//,
                //qc 3711，只能出现我们规定的字体
                /*
                 [ /font-size/i,'',function(v) {
                 var fontSizes = editor.cfg.pluginConfig["font-size"],
                 fonts = fontSizes.items;
                 for (var i = 0; i < fonts.length; i++) {
                 if (equalsIgnoreCase(v, fonts[i].value)) return v;
                 }
                 return false;
                 },'font-size'],
                 */

                //限制字体
                /*
                 [ /font-family/i,'',function(v) {
                 var fontFamilies = editor.cfg.pluginConfig["font-family"],
                 fams = fontFamilies.items;
                 for (var i = 0; i < fams.length; i++) {
                 var v2 = fams[i].value.toLowerCase();
                 if (equalsIgnoreCase(v, v2)
                 ||
                 equalsIgnoreCase(v, fams[i].name))
                 return v2;
                 }
                 return false;
                 } ,'font-family'],
                 */

                // qc 3701，去除行高，防止乱掉
                // beily_cn 报告需要去掉
                // [/line-height/i],

                // 旺铺编辑 html ，幻灯片切换 html
                // [/display/i,/none/i]
            ], undefined);

        function isListBulletIndicator(element) {
            var styleText = element.attributes && element.attributes.style || "";
            if (/mso-list\s*:\s*Ignore/i.test(styleText))
                return true;
            return undefined;
        }

        // Create a <ke:listbullet> which indicate an list item type.
        function createListBulletMarker(bulletStyle, bulletText) {
            var marker = new KE.HtmlParser.Element('ke:listbullet'),
                listType;

            // TODO: Support more list style type from MS-Word.
            if (!bulletStyle) {
                bulletStyle = 'decimal';
                listType = 'ol';
            } else if (bulletStyle[ 2 ]) {
                if (!isNaN(bulletStyle[ 1 ]))
                    bulletStyle = 'decimal';
                // No way to distinguish between Roman numerals and Alphas,
                // detect them as a whole.
                else if (/^[a-z]+$/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'lower-alpha';
                else if (/^[A-Z]+$/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'upper-alpha';
                // Simply use decimal for the rest forms of unrepresentable
                // numerals, e.g. Chinese...
                else
                    bulletStyle = 'decimal';

                listType = 'ol';
            } else {
                if (/[l\u00B7\u2002]/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'disc';
                else if (/[\u006F\u00D8]/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'circle';
                else if (/[\u006E\u25C6]/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'square';
                else
                    bulletStyle = 'disc';

                listType = 'ul';
            }

            // Represent list type as CSS style.
            marker.attributes = {
                'ke:listtype': listType,
                'style': 'list-style-type:' + bulletStyle + ';'
            };
            marker.add(new KE.HtmlParser.Text(bulletText));
            return marker;
        }

        function resolveList(element) {
            // <ke:listbullet> indicate a list item.
            var attrs = element.attributes,
                listMarker;

            if (( listMarker = element.removeAnyChildWithName('ke:listbullet') )
                && listMarker.length
                && ( listMarker = listMarker[ 0 ] )) {
                element.name = 'ke:li';

                if (attrs.style) {
                    attrs.style = stylesFilter(
                        [
                            // Text-indent is not representing list item level any more.
                            [ 'text-indent' ],
                            [ 'line-height' ],
                            // Resolve indent level from 'margin-left' value.
                            [ ( /^margin(:?-left)?$/ ), null, function (margin) {
                                // Be able to deal with component/short-hand form style.
                                var values = margin.split(' ');
                                margin = values[ 3 ] || values[ 1 ] || values [ 0 ];
                                margin = parseInt(margin, 10);

                                // Figure out the indent unit by looking at the first increament.
                                if (!listBaseIndent && previousListItemMargin && margin > previousListItemMargin)
                                    listBaseIndent = margin - previousListItemMargin;

                                attrs[ 'ke:margin' ] = previousListItemMargin = margin;
                            } ]
                        ], undefined)(attrs.style, element) || '';
                }

                // Inherit list-type-style from bullet.
                var listBulletAttrs = listMarker.attributes,
                    listBulletStyle = listBulletAttrs.style;
                element.addStyle(listBulletStyle);
                S.mix(attrs, listBulletAttrs);
                return true;
            }

            return false;
        }

        function stylesFilter(styles, whitelist) {
            return function (styleText, element) {
                var rules = [];
                // html-encoded quote might be introduced by 'font-family'
                // from MS-Word which confused the following regexp. e.g.
                //'font-family: &quot;Lucida, Console&quot;'
                String(styleText)
                    .replace(/&quot;/g, '"')
                    .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
                    function (match, name, value) {
                        name = name.toLowerCase();
                        name == 'font-family' && ( value = value.replace(/["']/g, '') );

                        var namePattern,
                            valuePattern,
                            newValue,
                            newName;
                        for (var i = 0; i < styles.length; i++) {
                            if (styles[ i ]) {
                                namePattern = styles[ i ][ 0 ];
                                valuePattern = styles[ i ][ 1 ];
                                newValue = styles[ i ][ 2 ];
                                newName = styles[ i ][ 3 ];

                                if (name.match(namePattern)
                                    && ( !valuePattern || value.match(valuePattern) )) {
                                    name = newName || name;
                                    whitelist && ( newValue = newValue || value );

                                    if (typeof newValue == 'function')
                                        newValue = newValue(value, element, name);

                                    // Return an couple indicate both name and value
                                    // changed.
                                    if (newValue && newValue.push) {
                                        name = newValue[ 0 ];
                                        newValue = newValue[ 1 ];
                                    }

                                    if (typeof newValue == 'string')
                                        rules.push([ name, newValue ]);
                                    return;
                                }
                            }
                        }

                        !whitelist && rules.push([ name, value ]);

                    });

                for (var i = 0; i < rules.length; i++) {
                    rules[ i ] = rules[ i ].join(':');
                }

                return rules.length ?
                    ( rules.join(';') + ';' ) : false;
            };
        }

        function assembleList(element) {
            var children = element.children, child,
                listItem, // The current processing ke:li element.
                listItemAttrs,
                listType, // Determine the root type of the list.
                listItemIndent, // Indent level of current list item.
                lastListItem, // The previous one just been added to the list.
                list,
            //parentList, // Current staging list and it's parent list if any.
                indent;

            for (var i = 0; i < children.length; i++) {
                child = children[ i ];

                if ('ke:li' == child.name) {
                    child.name = 'li';
                    listItem = child;
                    listItemAttrs = listItem.attributes;
                    listType = listItem.attributes[ 'ke:listtype' ];

                    // List item indent level might come from a real list indentation or
                    // been resolved from a pseudo list item's margin value, even get
                    // no indentation at all.
                    listItemIndent = parseInt(listItemAttrs[ 'ke:indent' ], 10)
                        || listBaseIndent && ( Math.ceil(listItemAttrs[ 'ke:margin' ] / listBaseIndent) )
                        || 1;

                    // Ignore the 'list-style-type' attribute if it's matched with
                    // the list root element's default style type.
                    listItemAttrs.style && ( listItemAttrs.style =
                        stylesFilter([
                            [ 'list-style-type', listType == 'ol' ? 'decimal' : 'disc' ]
                        ], undefined)(listItemAttrs.style)
                            || '' );

                    if (!list) {
                        list = new KE.HtmlParser.Element(listType);
                        list.add(listItem);
                        children[ i ] = list;
                    }
                    else {
                        if (listItemIndent > indent) {
                            list = new KE.HtmlParser.Element(listType);
                            list.add(listItem);
                            lastListItem.add(list);
                        }
                        else if (listItemIndent < indent) {
                            // There might be a negative gap between two list levels. (#4944)
                            var diff = indent - listItemIndent,
                                parent;
                            while (diff-- && ( parent = list.parent )) {
                                list = parent.parent;
                            }

                            list.add(listItem);
                        }
                        else
                            list.add(listItem);

                        children.splice(i--, 1);
                    }

                    lastListItem = listItem;
                    indent = listItemIndent;
                }
                else
                    list = null;
            }

            listBaseIndent = 0;
        }

        var listBaseIndent,
            previousListItemMargin = 0,
        //protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title)[^>]*>)/gi,
            listDtdParents = dtd.parentOf('ol');

        //过滤外边来的 html
        var defaultDataFilterRules = {
            elementNames: [
                // Remove script,iframe style,link,meta
                [  /^script$/i , '' ],
                [  /^bgsound/i , '' ],
                [  /^iframe$/i , '' ],
                [  /^style$/i , '' ],
                [  /^link$/i , '' ],
                [  /^meta$/i , '' ],
                [/^\?xml.*$/i, ''],
                [/^.*namespace.*$/i, '']
            ],
            //根节点伪列表进行处理
            root: function (element) {
                element.filterChildren();
                assembleList(element);
            },
            elements: {
                /*
                 宝贝发布兼容性考虑，不要去除
                 font:function(el) {
                 delete el.name;
                 },
                 */
                p: function (element) {
                    element.filterChildren();
                    // Is the paragraph actually a list item?
                    if (resolveList(element))
                        return undefined;
                },
                $: function (el) {
                    var tagName = el.name || "";
                    //ms world <o:p> 保留内容
                    if (tagName.indexOf(':') != -1 && !/^ke/.test(tagName)) {
                        //先处理子孙节点，防止delete el.name后，子孙得不到处理?
                        //el.filterChildren();

                        // 和 firefox 一样处理，把 imagedata 转换成 image 标签
                        // note : webkit 自己处理了
                        if (tagName == 'v:imagedata') {
                            var href = el.attributes[ 'o:href' ];
                            if (href) {
                                el.attributes.src = el.attributes[ 'o:href' ];
                                delete el.attributes[ 'o:href' ];
                            }
                            var title = el.attributes[ 'o:title' ];
                            if (title) {
                                el.attributes.title = title;
                                delete el.attributes[ 'o:title' ];
                            }
                            el.name = 'img';
                            return;
                        }

                        delete el.name;
                    }

                    /*
                     太激进，只做span*/
                    //span也不做了，可能设置class，模板用来占位展示
//                    var style = el.attributes.style;
//                    //没有属性的inline去掉了
//                    if (//tagName in dtd.$inline
//                        tagName == "span"
//                            && (!style || !filterStyle(style))
//                        ) {
//                        //el.filterChildren();
//                        delete el.name;
//                    }

                    // Assembling list items into a whole list.
                    if (tagName in listDtdParents) {
                        el.filterChildren();
                        assembleList(el);
                    }
                },
                /**
                 * ul,li 从 ms word 重建
                 * @param element
                 */
                span: function (element) {
                    // IE/Safari: remove the span if it comes from list bullet text.
                    if (!UA.gecko &&
                        isListBulletIndicator(element.parent)
                        )
                        return false;

                    // For IE/Safari: List item bullet type is supposed to be indicated by
                    // the text of a span with style 'mso-list : Ignore' or an image.
                    if (!UA.gecko &&
                        isListBulletIndicator(element)) {
                        var listSymbolNode = element.firstChild(function (node) {
                            return node.value || node.name == 'img';
                        });
                        var listSymbol = listSymbolNode && ( listSymbolNode.value || 'l.' ),
                            listType = listSymbol && listSymbol.match(/^([^\s]+?)([.)]?)$/);
                        if (listType) {
                            return createListBulletMarker(listType, listSymbol);
                        }
                    }
                }
            },

            attributes: {
                //防止word的垃圾class，
                //全部杀掉算了，除了以ke_开头的编辑器内置class
                //不要全部杀掉，可能其他应用有需要
                'class': function (value
                                   // , element
                    ) {
                    if (
                        !value ||
                            /(^|\s+)Mso/.test(value)
                        ) {
                        return false;
                    }
                    return value;
                },
                'style': function (value) {
                    //去除<i style="mso-bidi-font-style: normal">微软垃圾
                    var re = filterStyle(value);
                    if (!re) {
                        return false;
                    }
                    return re;
                }
            },
            attributeNames: [
                // Event attributes (onXYZ) must not be directly set. They can become
                // active in the editing area (IE|WebKit).
                [ ( /^on/ ), 'ke_on' ],
                [/^lang$/, '']
            ]};


        /**
         * word 的注释对非 ie 浏览器很特殊
         */
        var wordRules = {
            comment: !UA['ie'] ?
                function (value, node) {
                    var imageInfo = value.match(/<img.*?>/),
                        listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);
                    // Seek for list bullet indicator.
                    if (listInfo) {
                        // Bullet symbol could be either text or an image.
                        var listSymbol = listInfo[ 1 ] || ( imageInfo && 'l.' ),
                            listType = listSymbol && listSymbol.match(/>([^\s]+?)([.)]?)</);
                        return createListBulletMarker(listType, listSymbol);
                    }

                    // Reveal the <img> element in conditional comments for Firefox.
                    if (UA.gecko && imageInfo) {
                        var img = KE.HtmlParser.Fragment.FromHtml(imageInfo[0]).children[ 0 ],
                            previousComment = node.previous,
                        // Try to dig the real image link from vml markup from previous comment text.
                            imgSrcInfo = previousComment && previousComment.value.match(/<v:imagedata[^>]*o:href=['"](.*?)['"]/),
                            imgSrc = imgSrcInfo && imgSrcInfo[ 1 ];
                        // Is there a real 'src' url to be used?
                        imgSrc && ( img.attributes.src = imgSrc );
                        return img;
                    }
                    return false;
                } :
                function () {
                    return false;
                }
        };
        // 将编辑区生成 html 最终化
        var defaultHtmlFilterRules = {
            elementNames: [
                // Remove the "ke:" namespace prefix.
                [ ( /^ke:/ ), '' ],
                // Ignore <?xml:namespace> tags.
                [ ( /^\?xml:namespace$/ ), '' ]
            ],
            elements: {
                $: function (element) {
                    var attribs = element.attributes;

                    if (attribs) {
                        // 先把真正属性去掉，后面会把_ke_saved后缀去掉的！
                        // Remove duplicated attributes - #3789.
                        var attributeNames = [ 'name', 'href', 'src' ],
                            savedAttributeName;
                        for (var i = 0; i < attributeNames.length; i++) {
                            savedAttributeName = '_ke_saved_' + attributeNames[ i ];
                            savedAttributeName in attribs && ( delete attribs[ attributeNames[ i ] ] );
                        }
                    }

                    return element;
                },
                embed: function (element) {
                    var parent = element.parent;
                    // If the <embed> is child of a <object>, copy the width
                    // and height attributes from it.
                    if (parent && parent.name == 'object') {
                        var parentWidth = parent.attributes.width,
                            parentHeight = parent.attributes.height;
                        parentWidth && ( element.attributes.width = parentWidth );
                        parentHeight && ( element.attributes.height = parentHeight );
                    }
                },
                // Restore param elements into self-closing.
                param: function (param) {
                    param.children = [];
                    param.isEmpty = true;
                    return param;
                },
                // Remove empty link but not empty anchor.(#3829)
                a: function (element) {
                    if (!element.children.length && S.isEmptyObject(element.attributes)) {
                        return false;
                    }
                },
                span: function (element) {
                    if (!element.children.length && S.isEmptyObject(element.attributes)) {
                        return false;
                    }
                }
            },
            attributes: {
                // 清除空style
                style: function (v) {
                    if (!S.trim(v)) {
                        return false;
                    }
                }
            },
            attributeNames: [
                // 把保存的作为真正的属性，替换掉原来的
                // replace(/^_ke_saved_/,"")
                // _ke_saved_href -> href
                [ ( /^_ke_saved_/ ), '' ],
                [ ( /^ke_on/ ), 'on' ],
                [ ( /^_ke.*/ ), '' ],
                //!TODO 不知道怎么回事会引入
                [ ( /^_ks.*/ ), '' ],
                [ ( /^ke:.*$/ ), '' ]
            ],

            comment: function (contents) {
                // If this is a comment for protected source.
                if (contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker) {
                    // Remove the extra marker for real comments from it.
                    if (contents.substr(protectedSourceMarker.length, 3) == '{C}')
                        contents = contents.substr(protectedSourceMarker.length + 3);
                    else
                        contents = contents.substr(protectedSourceMarker.length);

                    return new KE.HtmlParser.cdata(decodeURIComponent(contents));
                }

                return contents;
            }
        };
        if (UA['ie']) {
            // IE outputs style attribute in capital letters. We should convert
            // them back to lower case.
            // bug: style='background:url(www.G.cn)' =>  style='background:url(www.g.cn)'
            // 只对 propertyName 小写
            defaultHtmlFilterRules.attributes.style = function (value // , element
                ) {
                return value.replace(/(^|;)([^:]+)/g, function (match) {
                    return match.toLowerCase();
                });
            };
        }

        htmlFilter.addRules(defaultHtmlFilterRules);
        dataFilter.addRules(defaultDataFilterRules);
        wordFilter.addRules(defaultDataFilterRules);
        wordFilter.addRules(wordRules);
    })();


    /**
     * 去除firefox代码末尾自动添加的 <br/>
     * 以及ie下自动添加的 &nbsp;
     * 以及其他浏览器段落末尾添加的占位符
     */
    (function () {
        // Regex to scan for &nbsp; at the end of blocks, which are actually placeholders.
        // Safari transforms the &nbsp; to \xa0. (#4172)
        var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/;

        // Return the last non-space child node of the block (#4344).
        function lastNoneSpaceChild(block) {
            var lastIndex = block.children.length,
                last = block.children[ lastIndex - 1 ];
            while (last && last.type == KEN.NODE_TEXT &&
                !S.trim(last.value)) {
                last = block.children[ --lastIndex ];
            }
            return last;
        }

        function blockNeedsExtension(block) {
            var lastChild = lastNoneSpaceChild(block);

            return !lastChild
                || lastChild.type == KEN.NODE_ELEMENT &&
                lastChild.name == 'br'
                // Some of the controls in form needs extension too,
                // to move cursor at the end of the form. (#4791)
                || block.name == 'form' &&
                lastChild.name == 'input';
        }

        /**
         *
         * @param block
         * @param {boolean=} fromSource
         */
        function trimFillers(block, fromSource) {
            // If the current node is a block, and if we're converting from source or
            // we're not in IE then search for and remove any tailing BR node.
            // Also, any &nbsp; at the end of blocks are fillers, remove them as well.
            // (#2886)
            var children = block.children,
                lastChild = lastNoneSpaceChild(block);
            if (lastChild) {
                if (( fromSource || !UA['ie'] ) &&
                    lastChild.type == KEN.NODE_ELEMENT &&
                    lastChild.name == 'br') {
                    children.pop();
                }
                if (lastChild.type == KEN.NODE_TEXT &&
                    tailNbspRegex.test(lastChild.value)) {
                    children.pop();
                }
            }
        }

        function extendBlockForDisplay(block) {
            trimFillers(block, true);

            if (blockNeedsExtension(block)) {
                //任何浏览器都要加空格！，否则空表格可能间隙太小，不能容下光标
                if (UA['ie']) {
                    block.add(new KE.HtmlParser.Text('\xa0'));
                } else {
                    //其他浏览器需要加空格??
                    block.add(new KE.HtmlParser.Text('&nbsp;'));
                    block.add(new KE.HtmlParser.Element('br', {}));
                }

            }
        }

        function extendBlockForOutput(block) {
            trimFillers(block, false);
            if (blockNeedsExtension(block)) {
                block.add(new KE.HtmlParser.Text('\xa0'));
            }
        }

        // Find out the list of block-like tags that can contain <br>.
        var dtd = KE.XHTML_DTD;
        var blockLikeTags = KE.Utils.mix({},
            dtd.$block,
            dtd.$listItem,
            dtd.$tableContent), i;
        for (i in blockLikeTags) {
            if (blockLikeTags.hasOwnProperty(i)) {
                if (!( 'br' in dtd[i] )) {
                    delete blockLikeTags[i];
                }
            }
        }

        // table 布局需要，不要自动往 td 中加东西
        delete blockLikeTags.td;

        // We just avoid filler in <pre> right now.
        // TODO: Support filler for <pre>, line break is also occupy line height.
        delete blockLikeTags.pre;
        var defaultDataBlockFilterRules = { elements: {} };
        var defaultHtmlBlockFilterRules = { elements: {} };
        for (i in blockLikeTags) {
            if (blockLikeTags.hasOwnProperty(i)) {
                defaultDataBlockFilterRules.elements[ i ] = extendBlockForDisplay;
                defaultHtmlBlockFilterRules.elements[ i ] = extendBlockForOutput;
            }
        }
        dataFilter.addRules(defaultDataBlockFilterRules);
        htmlFilter.addRules(defaultHtmlBlockFilterRules);
        wordFilter.addRules(defaultDataBlockFilterRules);
    })();


    // htmlparser fragment 中的 entities 处理
    // el.innerHTML="&nbsp;"
    // http://yiminghe.javaeye.com/blog/788929
    (function () {
        htmlFilter.addRules({
            text: function (text) {
                return text
                    //.replace(/&nbsp;/g, "\xa0")
                    .replace(/\xa0/g, "&nbsp;");
            }
        });
    })();


    var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi,
        protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
    // ie 6-7 会将 关于 url 的 content value 替换为 dom value
    // #a -> http://xxx/#a
    // ../x.html -> http://xx/x.html
    function protectAttributes(html) {
        return html.replace(protectElementRegex, function (element, tag, attributes) {
            return '<' + tag + attributes.replace(protectAttributeRegex, function (fullAttr, attrName) {
                // We should not rewrite the existed protected attributes,
                // e.g. clipboard content from editor. (#5218)
                if (attributes.indexOf('_ke_saved_' + attrName) == -1)
                    return ' _ke_saved_' + fullAttr + ' ' + fullAttr;

                return fullAttr;
            }) + '>';
        });
    }

    var protectedSourceMarker = '{ke_protected}';

//    function protectRealComments(html) {
//        return html.replace(/<!--(?!{ke_protected})[\s\S]+?-->/g, function(match) {
//            return '<!--' + protectedSourceMarker +
//                '{C}' +
//                encodeURIComponent(match).replace(/--/g, '%2D%2D') +
//                '-->';
//        });
//    }
//
//    function unprotectRealComments(html) {
//        return html.replace(/<!--\{ke_protected\}\{C\}([\s\S]+?)-->/g, function(match, data) {
//            return decodeURIComponent(data);
//        });
//    }


    editor.htmlDataProcessor = {
        //过滤 ms-word
        wordFilter: wordFilter,
        dataFilter: dataFilter,
        htmlFilter: htmlFilter,
        //编辑器 html 到外部 html
        toHtml: function (html, fixForBody) {

            //fixForBody = fixForBody || "p";
            // Now use our parser to make further fixes to the structure, as
            // well as apply the filter.
            //使用htmlwriter界面美观，加入额外文字节点\n,\t空白等

            var writer = new HtmlParser.HtmlWriter(),
                fragment = HtmlParser.Fragment.FromHtml(html, fixForBody);

            fragment.writeHtml(writer, htmlFilter);
            return writer.getHtml(true);
        },
        //外部html进入编辑器
        toDataFormat: function (html, fixForBody, _dataFilter) {

            //可以传 wordFilter 或 dataFilter
            _dataFilter = _dataFilter || dataFilter;
            // Firefox will be confused by those downlevel-revealed IE conditional
            // comments, fixing them first( convert it to upperlevel-revealed one ).
            // e.g. <![if !vml]>...<![endif]>
            //<!--[if !supportLists]-->
            // <span style=\"font-family: Wingdings;\" lang=\"EN-US\">
            // <span style=\"\">l<span style=\"font: 7pt &quot;Times New Roman&quot;;\">&nbsp;
            // </span></span></span>
            // <!--[endif]-->

            //变成：

            //<!--[if !supportLists]
            // <span style=\"font-family: Wingdings;\" lang=\"EN-US\">
            // <span style=\"\">l<span style=\"font: 7pt &quot;Times New Roman&quot;;\">&nbsp;
            // </span></span></span>
            // [endif]-->
            if (UA.gecko) {
                html = html.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi,
                    '$1$2$3');
            }

            html = protectAttributes(html);

            //标签不合法可能parser出错，这里先用浏览器帮我们建立棵合法的dom树的html
            // Call the browser to help us fixing a possibly invalid HTML
            // structure.
            var div = new Node("<div>");
            // Add fake character to workaround IE comments bug. (#3801)
            div.html('a' + html);
            html = div.html().substr(1);

            // Restore the comments that have been protected, in this way they
            // can be properly filtered.
            //html = unprotectRealComments(html);

            // Certain elements has problem to go through DOM operation, protect
            // them by prefixing 'ke' namespace. (#3591)
            //html = html.replace(protectElementNamesRegex, '$1ke:$2');
            //fixForBody = fixForBody || "p";
            //bug:qc #3710:使用basicwriter，去除无用的文字节点，标签间连续\n空白等

            var writer = new HtmlParser.BasicWriter(),
                fragment = HtmlParser.Fragment.FromHtml(html, fixForBody);

            writer.reset();
            fragment.writeHtml(writer, _dataFilter);
            html = writer.getHtml(true);
            // Protect the real comments again.
            //html = protectRealComments(html);

            return html;
        },
        /*
         最精简html传送到server
         */
        toServer: function (html, fixForBody) {
            var writer = new HtmlParser.BasicWriter(),
                fragment = HtmlParser.Fragment.FromHtml(html, fixForBody);
            fragment.writeHtml(writer, htmlFilter);
            return writer.getHtml(true);
        }
    };
}, {
    attach: false
});
