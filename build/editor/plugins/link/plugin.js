/**
 * link editor support for kissy editor ,innovation from google doc and ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("link", function (editor) {
    editor.addPlugin("link", function () {
        var S = KISSY,
            UA = S.UA,
            KE = S.Editor,
            DTD = KE.XHTML_DTD,
            Node = S.Node,
            KEStyle = KE.Style,
            _ke_saved_href = "_ke_saved_href",
            link_Style = {
                element:'a',
                attributes:{
                    "href":"#(href)",
                    "title":"#(title)",
                    // ie < 8 会把锚点地址修改，以及相对地址改为绝对地址
                    // 1. 编辑器位于 http://x.com/edit.htm
                    // 2. 用户输入 ./a.htm
                    // 3. 生成为 <a href='http://x.com/a.htm'>
                    // 另一个问题 refer: http://stackoverflow.com/questions/687552/prevent-tinymce-internet-explorer-from-converting-urls-to-links
                    "_ke_saved_href":"#(_ke_saved_href)",
                    target:"#(target)"
                }
            },
            /**
             * bubbleview/tip 初始化，所有共享一个 tip
             */
                tipHtml = '<a ' +
                'href="" '
                + ' target="_blank" ' +
                'class="ke-bubbleview-url">' +
                '在新窗口查看' +
                '</a>  –  '
                + ' <span ' +
                'class="ke-bubbleview-link ke-bubbleview-change">' +
                '编辑' +
                '</span>   |   '
                + ' <span ' +
                'class="ke-bubbleview-link ke-bubbleview-remove">' +
                '去除' +
                '</span>';

        function checkLink(lastElement) {
            return lastElement._4e_ascendant(function (node) {
                return node._4e_name() === 'a';
                // <a><img></a> 不能嵌套 a
                // && (!!node.attr("href"));
            }, true);
        }

        function getAttributes(el) {
            var attributes = el.attributes, re = {};
            for (var i = 0; i < attributes.length; i++) {
                var a = attributes[i];
                if (a.specified) {
                    re[a.name] = a.value;
                }
            }
            if (el.style.cssText) {
                re.style = el.style.cssText;
            }
            return re;
        }

        var controls = {}, addRes = KE.Utils.addRes,
            destroyRes = KE.Utils.destroyRes;


        var context = editor.addButton("link", {
            contentCls:"ke-toolbar-link",
            title:"插入链接",
            mode:KE.WYSIWYG_MODE,
            //得到当前选中的 link a
            _getSelectedLink:function () {
                var self = this,
                    editor = self.editor,
                    //ie焦点很容易丢失,tipwin没了
                    selection = editor.getSelection(),
                    common = selection && selection.getStartElement();
                if (common) {
                    common = checkLink(common);
                }
                return common;
            },
            _getSelectionLinkUrl:function () {
                var self = this, cfg = self.cfg, link = cfg._getSelectedLink.call(self);
                if (link) return link.attr(_ke_saved_href) || link.attr("href");
            },
            _removeLink:function (a) {
                var self = this,
                    editor = self.editor;
                editor.fire("save");
                var sel = editor.getSelection(),
                    range = sel.getRanges()[0];
                if (range && range.collapsed) {
                    var bs = sel.createBookmarks();
                    //不使用核心 styles ，直接清除元素标记即可。
                    a._4e_remove(true);
                    sel.selectBookmarks(bs);
                } else if (range) {
                    var attrs = getAttributes(a[0]);
                    new KEStyle(link_Style, attrs).remove(editor.document);
                }
                editor.fire("save");
                editor.notifySelectionChange();
            },
            _link:function (attr, _selectedEl) {
                var self = this,
                    link,
                    p,
                    editor = self.editor;
                //注意同步，取的话要从 _ke_saved_href 取原始值的
                attr[_ke_saved_href] = attr.href;
                //是修改行为
                if (_selectedEl) {
                    editor.fire("save");
                    _selectedEl.attr(attr);
                    link = _selectedEl;
                } else {
                    var sel = editor.getSelection(),
                        range = sel && sel.getRanges()[0];
                    //编辑器没有焦点或没有选择区域时直接插入链接地址
                    if (!range || range.collapsed) {

                        var a = new Node("<a>" + attr.href + "</a>",
                            attr, editor.document);
                        editor.insertElement(a);
                        link = a;
                    } else {
                        editor.fire("save");
                        var linkStyle = new KEStyle(link_Style, attr);
                        linkStyle.apply(editor.document);
                        UA['gecko'] && (link = editor.getSelection().getStartElement());
                    }
                }
                editor.fire("save");
                editor.notifySelectionChange();
            },
            offClick:function () {
                var self = this;
                self.editor.showDialog("link/dialog", [self]);
            },
            destroy:function () {
                this.editor.destroyDialog("link/dialog");
            }
        });

        addRes.call(controls, context);

        KE.use("bubbleview", function () {
            KE.BubbleView.register({
                pluginName:"link",
                editor:editor,
                pluginContext:context,
                func:checkLink,
                init:function () {
                    var bubble = this,
                        el = bubble.get("contentEl");
                    el.html(tipHtml);
                    var tipurl = el.one(".ke-bubbleview-url"),
                        tipchange = el.one(".ke-bubbleview-change"),
                        tipremove = el.one(".ke-bubbleview-remove");
                    //ie focus not lose
                    KE.Utils.preventFocus(el);
                    tipchange.on("click", function (ev) {
                        var link = bubble._plugin;
                        link.call("offClick");
                        ev.halt();
                    });

                    tipremove.on("click", function (ev) {
                        var link = bubble._plugin;
                        link.call("_removeLink", bubble._selectedEl);
                        ev.halt();
                    });

                    addRes.call(bubble, tipchange, tipremove);

                    bubble.on("show", function () {
                        var a = bubble._selectedEl;
                        if (!a)return;
                        var href = a.attr(_ke_saved_href) ||
                            a.attr("href");
                        tipurl.html(href);
                        tipurl.attr("href", href);
                    });
                }
            });

            addRes.call(controls, function () {
                KE.BubbleView.destroy("link");
            });
        });

        this.destroy = function () {
            destroyRes.call(controls);
        };
    });
}, {
    attach:false
});