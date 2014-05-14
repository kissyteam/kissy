/**
 * @ignore
 * Process malformed html for kissy editor.
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add(function (S, require) {
    var HtmlParser = require('html-parser');
    var UA = require('ua');
    var OLD_IE = UA.ieMode < 11;
    var Node = require('node');
    var dtd = HtmlParser.DTD;
    var NodeType = Node.NodeType;
    var util = S;

    // <span></span> <span><span></span></span>
    function isEmptyElement(el) {
        if (!dtd.$removeEmpty[el.nodeName]) {
            return false;
        }
        var childNodes = el.childNodes,
            i, child,
            l = childNodes.length;
        if (l) {
            for (i = 0; i < l; i++) {
                child = childNodes[i];
                var nodeType = child.nodeType;
                if (!(nodeType === NodeType.TEXT_NODE && !child.nodeValue)) {
                    return false;
                }
                if (!isEmptyElement(child)) {
                    return false;
                }
            }
            return true;
        } else {
            return true;
        }
    }

    return {
        init: function (editor) {
            var htmlFilter = new HtmlParser.Filter(),
                dataFilter = new HtmlParser.Filter();

            // remove empty inline element
            function filterInline(element) {
                return !isEmptyElement(element);
            }

            (function () {
                function wrapAsComment(element) {
                    var html = HtmlParser.serialize(element);
                    return new HtmlParser.Comment(protectedSourceMarker +
                        encodeURIComponent(html).replace(/--/g, '%2D%2D'));
                }

                // 过滤外边来的 html
                var defaultDataFilterRules = {
                    tagNames: [
                        [/^\?xml.*$/i, ''],
                        [/^.*namespace.*$/i, '']
                    ],
                    attributeNames: [
                        // Event attributes (onXYZ) must not be directly set. They can become
                        // active in the editing area (IE|WebKit).
                        [/^on/, 'ke_on'],
                        [/^lang$/, '']
                    ],
                    tags: {
                        script: wrapAsComment,
                        noscript: wrapAsComment,
                        span: filterInline
                    }
                };

                // 将编辑区生成 html 最终化
                var defaultHTMLFilterRules = {
                    tagNames: [
                        // Remove the "ke:" namespace prefix.
                        [(/^ke:/), ''],
                        // Ignore <?xml:namespace> tags.
                        [(/^\?xml:namespace$/), '']
                    ],
                    tags: {
                        $: function (element) {
                            var attributes = element.attributes;

                            if (attributes.length) {
                                // 先把真正属性去掉，后面会把 _ke_saved 后缀去掉的！
                                // Remove duplicated attributes - #3789.
                                var attributeNames = ['name', 'href', 'src'],
                                    savedAttributeName;
                                for (var i = 0; i < attributeNames.length; i++) {
                                    savedAttributeName = '_keSaved_' + attributeNames[i];
                                    if (element.getAttribute(savedAttributeName)) {
                                        element.removeAttribute(attributeNames[i]);
                                    }
                                }
                            }

                            return element;
                        },
                        embed: function (element) {
                            var parent = element.parentNode;
                            // If the <embed> is child of a <object>, copy the width
                            // and height attributes from it.
                            if (parent && parent.nodeName === 'object') {
                                var parentWidth = parent.getAttribute('width'),
                                    parentHeight = parent.getAttribute('height');
                                if (parentWidth) {
                                    element.setAttribute('width', parentWidth);
                                }
                                if (parentHeight) {
                                    element.setAttribute('width', parentHeight);
                                }
                            }
                        },

                        // Remove empty link but not empty anchor.(#3829)
                        a: function (element) {
                            if (!(element.childNodes.length) && !(element.attributes.length)) {
                                return false;
                            }
                            return undefined;
                        },
                        span: filterInline,
                        strong: filterInline,
                        em: filterInline,
                        del: filterInline,
                        u: filterInline
                    },
                    attributes: {
                        // 清除空style
                        style: function (v) {
                            if (!util.trim(v)) {
                                return false;
                            }
                            return undefined;
                        }
                    },
                    attributeNames: [
                        // 把保存的作为真正的属性，替换掉原来的
                        // replace(/^_keSaved_/,"")
                        // _keSavedHref -> href
                        [(/^_keSaved_/), ''],
                        [(/^ke_on/), 'on'],
                        [(/^_ke.*/), ''],
                        [(/^ke:.*$/), ''],
                        // kissy 相关
                        [(/^_ks.*/), '']
                    ],
                    comment: function (contents) {
                        // If this is a comment for protected source.
                        if (contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker) {
                            contents = util.trim(util.urlDecode(contents.substr(protectedSourceMarker.length)));
                            return HtmlParser.parse(contents).childNodes[0];
                        }
                        return undefined;
                    }
                };
                if (OLD_IE) {
                    // IE outputs style attribute in capital letters. We should convert
                    // them back to lower case.
                    // bug: style='background:url(www.G.cn)' =>  style='background:url(www.g.cn)'
                    // 只对 propertyName 小写
                    defaultHTMLFilterRules.attributes.style = function (value) {
                        return value.replace(/(^|;)([^:]+)/g, function (match) {
                            return match.toLowerCase();
                        });
                    };
                }

                htmlFilter.addRules(defaultHTMLFilterRules);
                dataFilter.addRules(defaultDataFilterRules);
            })();

            /*
             去除firefox代码末尾自动添加的 <br/>
             以及ie下自动添加的 &nbsp;
             以及其他浏览器段落末尾添加的占位符
             */
            (function () {
                // Regex to scan for &nbsp; at the end of blocks,
                // which are actually placeholders.
                // Safari transforms the &nbsp; to \xa0. (#4172)
                // html will auto indent by kissy html-parser to add \r \n at the end of line
                var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;

                // Return the last non-space child node of the block (#4344).
                function lastNoneSpaceChild(block) {
                    var childNodes = block.childNodes,
                        lastIndex = childNodes.length,
                        last = childNodes[lastIndex - 1];
                    while (last &&
                        (last.nodeType === 3 && !util.trim(last.nodeValue) ||
                            last.nodeType === 1 && isEmptyElement(last))) {
                        last = childNodes[--lastIndex];
                    }
                    return last;
                }

                function trimFillers(block) {
                    var lastChild = lastNoneSpaceChild(block);
                    if (lastChild) {
                        if (lastChild.nodeType === 1 && lastChild.nodeName === 'br') {
                            block.removeChild(lastChild);
                        } else if (lastChild.nodeType === 3 && tailNbspRegex.test(lastChild.nodeValue)) {
                            block.removeChild(lastChild);
                        }
                    }
                }

                function blockNeedsExtension(block) {
                    var lastChild = lastNoneSpaceChild(block);
                    // empty block <p></p> <td></td>
                    return !lastChild ||
                        // Some of the controls in form needs extension too,
                        // to move cursor at the end of the form. (#4791)
                        block.nodeName === 'form' &&
                        lastChild.nodeName === 'input';
                }

                // 外部 html 到编辑器 html
                function extendBlockForDisplay(block) {
                    trimFillers(block);
                    if (blockNeedsExtension(block)) {
                        // non-ie need br for cursor and height
                        // ie does not need!
                        if (!OLD_IE) {
                            block.appendChild(new HtmlParser.Tag('br'));
                        }
                    }
                }

                // 编辑器 html 到外部 html
                function extendBlockForOutput(block) {
                    trimFillers(block);
                    if (blockNeedsExtension(block)) {
                        // allow browser need!
                        // <p></p> does not has height!
                        block.appendChild(new HtmlParser.Text('\xa0'));
                    }
                }

                // Find out the list of block-like tags that can contain <br>.
                var blockLikeTags = util.merge(
                    dtd.$block,
                    dtd.$listItem,
                    dtd.$tableContent), i;
                for (i in blockLikeTags) {
                    if (!('br' in dtd[i])) {
                        delete blockLikeTags[i];
                    }
                }

                // We just avoid filler in <pre> right now.
                // TODO: Support filler for <pre>, line break is also occupy line height.
                delete blockLikeTags.pre;
                var defaultDataBlockFilterRules = {tags: {}};
                var defaultHTMLBlockFilterRules = {tags: {}};

                for (i in blockLikeTags) {
                    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
                    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
                }

                dataFilter.addRules(defaultDataBlockFilterRules);
                htmlFilter.addRules(defaultHTMLBlockFilterRules);
            })();

            // html-parser fragment 中的 entities 处理
            // el.innerHTML="&nbsp;"
            // http://yiminghe.javaeye.com/blog/788929
            htmlFilter.addRules({
                text: function (text) {
                    return text
                        //.replace(/&nbsp;/g, "\xa0")
                        .replace(/\xa0/g, '&nbsp;');
                }
            });

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
                        if (attributes.indexOf('_keSaved_' + attrName) === -1) {
                            return ' _keSaved_' + fullAttr + ' ' + fullAttr;
                        }
                        return fullAttr;
                    }) + '>';
                });
            }

            var protectedSourceMarker = '{ke_protected}';

            var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi,
                encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;

            var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi,
                unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;

            var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;

            function protectSelfClosingElements(html) {
                return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
            }

            function protectElements(html) {
                return html.replace(protectElementsRegex, function (match) {
                    return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
                });
            }

            function unprotectElements(html) {
                return html.replace(encodedElementsRegex, function (match, encoded) {
                    return util.urlDecode(encoded);
                });
            }

            function protectElementsNames(html) {
                return html.replace(protectElementNamesRegex, '$1ke:$2');
            }

            function unprotectElementNames(html) {
                return html.replace(unprotectElementNamesRegex, '$1$2');
            }

            editor.htmlDataProcessor = {
                dataFilter: dataFilter,
                htmlFilter: htmlFilter,
                // 编辑器 html 到外部 html
                // fixForBody, <body>t</body> => <body><p>t</p></body>
                toHtml: function (html) {
                    if (UA.webkit) {
                        // remove filling char for webkit
                        html = html.replace(/\u200b/g, '');
                    }
                    // fixForBody = fixForBody || 'p';
                    // Now use our parser to make further fixes to the structure, as
                    // well as apply the filter.
                    //使用 htmlWriter 界面美观，加入额外文字节点\n,\t空白等
                    var writer = new HtmlParser.BeautifyWriter(),
                        n = new HtmlParser.Parser(html).parse();
                    n.writeHtml(writer, htmlFilter);
                    html = writer.getHtml();
                    return html;
                },
                // 外部html进入编辑器
                toDataFormat: function (html, _dataFilter) {
                    //可以传 wordFilter 或 dataFilter
                    _dataFilter = _dataFilter || dataFilter;

                    // Protect elements than can't be set inside a DIV. E.g. IE removes
                    // style tags from innerHTML. (#3710)
                    // and protect textarea, in case textarea has un-encoded html
                    // protect script too, in case script has un-encoded html
                    // https://github.com/kissyteam/kissy/issues/420
                    html = protectElements(html);

                    html = protectAttributes(html);

                    // Certain elements has problem to go through Dom operation, protect
                    // them by prefixing 'ke' namespace. (#3591)
                    html = protectElementsNames(html);

                    // All none-IE browsers ignore self-closed custom elements,
                    // protecting them into open-close. (#3591)
                    html = protectSelfClosingElements(html);

                    // 标签不合法可能 parser 出错，这里先用浏览器帮我们建立棵合法的 dom 树的 html
                    // Call the browser to help us fixing a possibly invalid HTML
                    // structure.
                    var div = new Node('<div>');
                    // Add fake character to workaround IE comments bug. (#3801)
                    div.html('a' + html);
                    html = div.html().substr(1);

                    // Unprotect "some" of the protected elements at this point.
                    html = unprotectElementNames(html);

                    html = unprotectElements(html);

                    // fixForBody = fixForBody || 'p';
                    // bug:qc #3710:使用 basicWriter ，去除无用的文字节点，标签间连续\n空白等

                    var writer = new HtmlParser.BasicWriter(),
                        n = new HtmlParser.Parser(html).parse();

                    n.writeHtml(writer, _dataFilter);

                    html = writer.getHtml();

                    return html;
                },
                /*
                 最精简html传送到server
                 */
                toServer: function (html) {
                    var writer = new HtmlParser.MinifyWriter(),
                        n = new HtmlParser.Parser(html).parse();
                    n.writeHtml(writer, htmlFilter);
                    return writer.getHtml();
                }
            };
        }
    };
});
