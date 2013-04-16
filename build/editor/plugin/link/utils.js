/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:18
*/
/**
 * link utils
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/link/utils", function (S, Editor) {

    var Node = S.Node,
        KEStyle = Editor.Style,
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
        };

    function getAttributes(el) {
        var attributes = el.attributes,
            re = {};
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


    function removeLink(editor, a) {
        editor.execCommand("save");
        var sel = editor.getSelection(),
            range = sel.getRanges()[0];
        if (range && range.collapsed) {
            var bs = sel.createBookmarks();
            // 不使用核心 styles ，直接清除元素标记即可。
            a._4e_remove(true);
            sel.selectBookmarks(bs);
        } else if (range) {
            var attrs = getAttributes(a[0]);
            new KEStyle(link_Style, attrs).remove(editor.get("document")[0]);
        }
        editor.execCommand("save");
        editor.notifySelectionChange();
    }

    function applyLink(editor, attr, _selectedEl) {
        // 注意同步，取的话要从 _ke_saved_href 取原始值的
        attr[_ke_saved_href] = attr.href;
        // 是修改行为
        if (_selectedEl) {
            editor.execCommand("save");
            _selectedEl.attr(attr);
        } else {
            var sel = editor.getSelection(),
                range = sel && sel.getRanges()[0];
            //编辑器没有焦点或没有选择区域时直接插入链接地址
            if (!range || range.collapsed) {
                var a = new Node("<a>" + attr.href + "</a>",
                    attr, editor.get("document")[0]);
                editor.insertElement(a);
            } else {
                editor.execCommand("save");
                var linkStyle = new KEStyle(link_Style, attr);
                linkStyle.apply(editor.get("document")[0]);
            }
        }
        editor.execCommand("save");
        editor.notifySelectionChange();
    }


    return {
        removeLink:removeLink,
        applyLink:applyLink,
        _ke_saved_href:_ke_saved_href
    }
}, {
    requires:['editor']
});
