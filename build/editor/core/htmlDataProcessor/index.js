/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 17:43
*/
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:22
*/
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:17
*/
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 12:07
*/
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
/**
 * modified from ckeditor,process malformed html and ms-word copy for kissyeditor
 * @modifier yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/plugin/htmlDataProcessor/index", function (S) {

    return {
        init:function (editor) {
            var undefined = undefined,
                Editor = S.Editor,
                Node = S.Node,
                UA = S.UA,
                HtmlParser = S.require("htmlparser"),
                htmlFilter = new HtmlParser.Filter(),
                dataFilter = new HtmlParser.Filter(),
                wordFilter = new HtmlParser.Filter();

            /**
             * 常用的规则：
             * 1。过滤一些常见东西
             * 2。处理 word 复制过来的列表
             */
            (function () {
                var //equalsIgnoreCase = Editor.Utils.equalsIgnoreCase,
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

                                        if (name.match(namePattern) &&
                                            ( !valuePattern || value.match(valuePattern) )) {
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

                        for (var i = 0; i < rules.length; i++)
                            rules[ i ] = rules[ i ].join(':');

                        return rules.length ?
                            ( rules.join(';') + ';' ) : false;
                    };
                }


                //过滤外边来的 html
                var defaultDataFilterRules = {
                    tagNames:[
                        // Remove script,iframe style,link,meta
                        [  /^script$/i , '' ],
                        [  /^iframe$/i , '' ],
                        [  /^style$/i , '' ],
                        [  /^link$/i , '' ],
                        [  /^meta$/i , '' ],
                        [/^\?xml.*$/i, ''],
                        [/^.*namespace.*$/i, '']
                    ],
                    //根节点伪列表进行处理
                    root:function (element) {
                        element.filterChildren();
                    },
                    tags:{
                        /*
                         宝贝发布兼容性考虑，不要去除
                         font:function(el) {
                         delete el.name;
                         },
                         */
                        p:function (element) {
                            element.filterChildren();
                        },
                        $:function (el) {
                            var tagName = el.nodeName || "";
                            //ms world <o:p> 保留内容
                            if (tagName.indexOf(':') != -1 && !/^ke/.test(tagName)) {
                                //先处理子孙节点，防止delete el.name后，子孙得不到处理?
                                //el.filterChildren();

                                // 和 firefox 一样处理，把 imagedata 转换成 image 标签
                                // note : webkit 自己处理了
                                if (tagName == 'v:imagedata') {
                                    var href = el.getAttribute('o:href');
                                    if (href) {
                                        el.setAttribute("src", href);
                                        el.removeAttribute('o:href')
                                    }
                                    var title = el.getAttribute('o:title');
                                    if (title) {
                                        el.setAttribute("title", title);
                                        el.removeAttribute("o:title");
                                    }
                                    el.setTagName("img");
                                } else {
                                    el.setTagName("");
                                }
                            }
                        }
                    },

                    attributes:{
                        // 防止 word 的垃圾class，
                        // 全部杀掉算了，除了以 ke_ 开头的编辑器内置 class
                        // 不要全部杀掉，可能其他应用有需要
                        'class':function (value
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
                        'style':function (value) {
                            //去除<i style="mso-bidi-font-style: normal">微软垃圾
                            var re = filterStyle(value);
                            if (!re) {
                                return false;
                            }
                            return re;
                        }
                    },
                    attributeNames:[
                        // Event attributes (onXYZ) must not be directly set. They can become
                        // active in the editing area (IE|WebKit).
                        [ ( /^on/ ), 'ke_on' ],
                        [/^lang$/, '']
                    ]};

                // 将编辑区生成 html 最终化
                var defaultHtmlFilterRules = {
                    tagNames:[
                        // Remove the "ke:" namespace prefix.
                        [ ( /^ke:/ ), '' ],
                        // Ignore <?xml:namespace> tags.
                        [ ( /^\?xml:namespace$/ ), '' ]
                    ],
                    tags:{
                        $:function (element) {
                            var attribs = element.attributes;

                            if (attribs.length) {
                                // 先把真正属性去掉，后面会把 _ke_saved 后缀去掉的！
                                // Remove duplicated attributes - #3789.
                                var attributeNames = [ 'name', 'href', 'src' ],
                                    savedAttributeName;
                                for (var i = 0; i < attributeNames.length; i++) {
                                    savedAttributeName = '_ke_saved_' + attributeNames[ i ];
                                    if (element.getAttribute(savedAttributeName)) {
                                        element.removeAttribute(attributeNames[i]);
                                    }
                                }
                            }

                            return element;
                        },
                        embed:function (element) {
                            var parent = element.parentNode;
                            // If the <embed> is child of a <object>, copy the width
                            // and height attributes from it.
                            if (parent && parent.nodeName == 'object') {
                                var parentWidth = parent.getAttribute("width"),
                                    parentHeight = parent.getAttribute("height");
                                if (parentWidth) {
                                    element.setAttribute("width", parentWidth);
                                }
                                if (parentHeight) {
                                    element.setAttribute("width", parentHeight);
                                }
                            }
                        },

                        // Remove empty link but not empty anchor.(#3829)
                        a:function (element) {
                            if (!(element.childNodes.length) && !(element.attributes.length)) {
                                return false;
                            }
                        },
                        span:function (element) {
                            if (!(element.childNodes.length) && !(element.attributes.length)) {
                                return false;
                            }
                        }
                    },
                    attributes:{
                        // 清除空style
                        style:function (v) {
                            if (!S.trim(v)) {
                                return false;
                            }
                        }
                    },
                    attributeNames:[
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

                    comment:function (contents) {
                        // If this is a comment for protected source.
                        if (contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker) {
                            // Remove the extra marker for real comments from it.
                            if (contents.substr(protectedSourceMarker.length, 3) == '{C}')
                                contents = contents.substr(protectedSourceMarker.length + 3);
                            else
                                contents = contents.substr(protectedSourceMarker.length);

                            return new HtmlParser.CData(decodeURIComponent(contents));
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
                    var childNodes = block.childNodes,
                        lastIndex = childNodes.length,
                        last = childNodes[ lastIndex - 1 ];
                    while (last && last.nodeType == 3 && !S.trim(last.nodeValue))
                        last = childNodes[ --lastIndex ];
                    return last;
                }

                function trimFillers(block, fromSource) {
                    // If the current node is a block, and if we're converting from source or
                    // we're not in IE then search for and remove any tailing BR node.
                    // Also, any &nbsp; at the end of blocks are fillers, remove them as well.
                    // (#2886)
                    var lastChild = lastNoneSpaceChild(block);
                    if (lastChild) {
                        if (( fromSource || !UA['ie'] ) &&
                            lastChild.nodeType == 1 &&
                            lastChild.nodeName == 'br') {
                            block.removeChild(lastChild);
                        }
                        else if (lastChild.nodeType == 3 &&
                            tailNbspRegex.test(lastChild.nodeValue)) {
                            block.removeChild(lastChild);
                        }
                    }
                }

                function blockNeedsExtension(block) {
                    var lastChild = lastNoneSpaceChild(block);

                    return !lastChild
                        || lastChild.nodeType == 1 &&
                        lastChild.nodeName == 'br'
                        // Some of the controls in form needs extension too,
                        // to move cursor at the end of the form. (#4791)
                        || block.nodeName == 'form' &&
                        lastChild.nodeName == 'input';
                }

                function extendBlockForDisplay(block) {
                    trimFillers(block, true);

                    if (blockNeedsExtension(block)) {
                        // 任何浏览器都要加空格！否则空表格可能间隙太小，不能容下光标
                        if (UA['ie']) {
                            block.appendChild(new HtmlParser.Text('\xa0'));
                        } else {
                            //其他浏览器需要加空格??
                            block.appendChild(new HtmlParser.Text('&nbsp;'));
                            block.appendChild(new HtmlParser.Tag('br'));
                        }
                    }
                }

                function extendBlockForOutput(block) {
                    trimFillers(block, false);
                    if (blockNeedsExtension(block)) {
                        block.appendChild(new HtmlParser.Text('\xa0'));
                    }
                }

                // Find out the list of block-like tags that can contain <br>.
                var dtd = Editor.XHTML_DTD;
                var blockLikeTags = S.merge(
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
                var defaultDataBlockFilterRules = { tags:{} };
                var defaultHtmlBlockFilterRules = { tags:{} };

                for (i in blockLikeTags) {
                    if (blockLikeTags.hasOwnProperty(i)) {
                        defaultDataBlockFilterRules.tags[ i ] = extendBlockForDisplay;
                        defaultHtmlBlockFilterRules.tags[ i ] = extendBlockForOutput;
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
                    text:function (text) {
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

            function protectRealComments(html) {
                return html.replace(/<!--(?!{ke_protected})[\s\S]+?-->/g, function (match) {
                    return '<!--' + protectedSourceMarker +
                        '{C}' +
                        encodeURIComponent(match).replace(/--/g, '%2D%2D') +
                        '-->';
                });
            }

            function unprotectRealComments(html) {
                return html.replace(/<!--\{ke_protected\}\{C\}([\s\S]+?)-->/g, function (match, data) {
                    return decodeURIComponent(data);
                });
            }


            editor.htmlDataProcessor = {
                //过滤 ms-word
                wordFilter:wordFilter,
                dataFilter:dataFilter,
                htmlFilter:htmlFilter,
                //编辑器 html 到外部 html
                // fixForBody , <body>t</body> => <body><p>t</p></body>
                toHtml:function (html) {
                    //fixForBody = fixForBody || "p";
                    // Now use our parser to make further fixes to the structure, as
                    // well as apply the filter.
                    //使用htmlwriter界面美观，加入额外文字节点\n,\t空白等
                    var writer = new HtmlParser.BeautifyWriter(),
                        n = new HtmlParser.Parser(html).parse();
                    n.writeHtml(writer, htmlFilter);
                    return writer.getHtml();
                },
                //外部html进入编辑器
                toDataFormat:function (html, fixForBody, _dataFilter) {

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
                    html = unprotectRealComments(html);

                    // Certain elements has problem to go through DOM operation, protect
                    // them by prefixing 'ke' namespace. (#3591)
                    //html = html.replace(protectElementNamesRegex, '$1ke:$2');
                    //fixForBody = fixForBody || "p";
                    //bug:qc #3710:使用basicwriter，去除无用的文字节点，标签间连续\n空白等

                    var writer = new HtmlParser.BeautifyWriter(),
                        n = new HtmlParser.Parser(html).parse();
                    n.writeHtml(writer, _dataFilter);
                    html = writer.getHtml();
                    // Protect the real comments again.
                    html = protectRealComments(html);

                    return html;
                },
                /*
                 最精简html传送到server
                 */
                toServer:function (html) {
                    var writer = new HtmlParser.MinifyWriter(),
                        n = new HtmlParser.Parser(html).parse();
                    n.writeHtml(writer, htmlFilter);
                    return writer.getHtml();
                }
            };
        }
    };
}, {
    requires:['editor']
});
