KISSY.use("htmlparser,ua", function (S, HtmlParser,UA) {

    function getTextSync(path, callback) {
        if (S.Env.nodejs) {
            path=require('path').resolve(__dirname,path);
            var fs = require('fs');
            callback(fs.readFileSync(path, 'utf-8'));
        } else {
            S.io({
                url: path,
                dataType: 'text',
                async: false,
                success: callback
            });
        }
    }

    describe("htmlparser_for_editor", function () {
        it("can filter elementNames", function () {
            var dataFilterRules = {
                tagNames: [
                    [  /^script$/i , '' ],
                    [  /^iframe$/i , '' ],
                    [  /^style$/i , '' ],
                    [  /^link$/i , '' ],
                    [  /^meta$/i , '' ],
                    [/^\?xml.*$/i, ''],
                    [/^.*namespace.*$/i, '']
                ]
            };

            var filter = new HtmlParser.Filter();
            filter.addRules(dataFilterRules);

            var writer = new HtmlParser.BasicWriter(),
                before = '<script>alert(1);</script>x<link/>' +
                    '<?xml:namespace prefix = v ns = "urn:schemas-microsoft-com:vml" />' +
                    'y';

            var n = new HtmlParser.Parser(before).parse();

            n.writeHtml(writer, filter);

            expect(writer.getHtml()).toBe("xy");
        });


        it("can filter imagedata in vml@ie", function () {
            var dataFilterRules = {
                tagNames: [
                    [/^\?xml.*$/i, '']
                ],
                tags: {
                    $: function (el) {
                        var tagName = el.tagName || "";
                        if (tagName.indexOf(':') != -1 && !/^ke/.test(tagName)) {
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
                }
            };

            var filter = new HtmlParser.Filter();
            filter.addRules(dataFilterRules);

            var writer = new HtmlParser.BasicWriter();

            var before = "";

            getTextSync("../others/editor/vml_img.html", function (d) {
                before = d;
            });

            var n = new HtmlParser.Parser(before).parse();
            n.writeHtml(writer, filter);
            // S.log(writer.getHtml());
            expect(writer.getHtml().indexOf('<img src="xx.jpg" title="me" />') != -1).toBe(true);
        });

        it("can filter attribute", function () {
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

            var filterStyle = stylesFilter([
                // word 自有属性名去除
                [/mso/i],
                [/w:WordDocument/i],
                // ie 自有属性名[/mso/i],
                [/^-ms/i],
                // firefox 自有属性名
                [/^-moz/i],
                // webkit 自有属性名
                [/^-webkit/i]//
            ]);

            var dataFilterRules = {
                attributes: {
                    // word
                    "class": function (value) {

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
                }
            };

            var filter = new HtmlParser.Filter();
            filter.addRules(dataFilterRules);

            var writer = new HtmlParser.BasicWriter(),
                before = '<div class="Mso-list">1</div>' +
                    '<b class="">2</b>' +
                    '<span style="mso-bidi-font-style: normal;-ms-k:1;">3</span>';

            var n = new HtmlParser.Parser(before).parse();

            n.writeHtml(writer, filter);

            expect(writer.getHtml()).toBe("<div>1</div><" + "b>2</b><span>3</span>");
        });

        it("can modify html structure on fly", function () {
            var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/;

            // Return the last non-space child node of the block (#4344).
            function lastNoneSpaceChild(block) {
                var childNodes = block.childNodes,
                    lastIndex = childNodes.length,
                    last = childNodes[ lastIndex - 1 ];
                while (last && last.nodeType == 3 && !S.trim(last.nodeValue)) {
                    last = childNodes[ --lastIndex ];
                }
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
                    //任何浏览器都要加空格！，否则空表格可能间隙太小，不能容下光标
                    if (UA['ie']) {
                        block.appendChild(new HtmlParser.Text('\xa0'));
                    } else {
                        //其他浏览器需要加空格??
                        block.appendChild(new HtmlParser.Text('&nbsp;'));
                        block.appendChild(new HtmlParser.Tag('br'));
                    }

                }
            }


            var dataFilterRules = {
                tags: {
                    p: extendBlockForDisplay
                }
            };

            var filter = new HtmlParser.Filter();

            filter.addRules(dataFilterRules);

            var writer = new HtmlParser.BasicWriter();

            var before = "<p></p><p>1</p>";

            var n = new HtmlParser.Parser(before).parse();

            n.writeHtml(writer, filter);
            if (UA['ie']) {
                expect(writer.getHtml()).toBe("<p>\xa0</p><p>1</p>");
            } else {
                expect(writer.getHtml()).toBe("<p>&nbsp;<br /></p><p>1</p>");
            }
        });

        it("filter children works while modify html", function () {
            var rules = {
                tags: {

                    p: function (el) {
                        el.filterChildren();
                    }
                }
            };

            var rules2 = {
                tags: {
                    p: function (el) {
                        el.appendChild(new HtmlParser.Text("&nbsp;"));
                    }
                }
            };

            var filter = new HtmlParser.Filter();
            filter.addRules(rules);
            filter.addRules(rules2);

            var writer = new HtmlParser.BasicWriter();

            var before = "<p></p>";

            var n = new HtmlParser.Parser(before).parse();

            n.writeHtml(writer, filter);
            expect(writer.getHtml()).toBe("<p>&nbsp;</p>");

        });


        it("filter will run only once", function () {
            var count = 0;
            var rules = {
                tags: {
                    p: function (el) {
                        el.filterChildren();
                    },
                    span: function () {
                        count++;
                    }
                }
            };

            var filter = new HtmlParser.Filter();
            filter.addRules(rules);

            var writer = new HtmlParser.BasicWriter();

            var before = "<p><span></span></p>";

            var n = new HtmlParser.Parser(before).parse();

            n.writeHtml(writer, filter);
            expect(writer.getHtml()).toBe("<p><span></span></p>");
            expect(count).toBe(1);
        });

        it("can filter attributeNames", function () {
            var rules = {
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
                ]
            };

            var filter = new HtmlParser.Filter();
            filter.addRules(rules);

            var writer = new HtmlParser.BasicWriter();

            var before = "<p _ke_saved_src='y'>x</p>";

            var n = new HtmlParser.Parser(before).parse();

            n.writeHtml(writer, filter);
            expect(writer.getHtml()).toBe("<p src=\"y\">x</p>");
        });

    });
});