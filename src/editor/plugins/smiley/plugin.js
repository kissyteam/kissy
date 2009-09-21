
KISSY.Editor.add("plugins~smiley", function(E) {

    var Y = YAHOO.util, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,

        DIALOG_CLS = "ks-editor-smiley-dialog",
        DIALOG_TMPL = '<div class="ks-editor-smiley-icons">{icons}</div>';

    E.addPlugin("smiley", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 关联的对话框
         */
        dialog: null,

        /**
         * 关联的 range 对象
         */
        range: null,

        /**
         * 初始化函数
         */
        init: function() {
            this._renderUI();
            this._bindUI();
        },

        /**
         * 初始化对话框界面
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
                lang = this.lang;

            dialog.className += " " + DIALOG_CLS;
            dialog.innerHTML = DIALOG_TMPL
                    .replace("{icons}", this._getIconsList());

            this.dialog = dialog;

            if(isIE) {
                E.Dom.setItemUnselectable(dialog);
            }
        },

        _getIconsList: function() {
            var config = this.editor.config,
                smileyName = config.smiley,
                base = config.base + "smilies/" + smileyName + "/",
                smiley = E.Smilies[smileyName],
                fileNames = smiley["fileNames"],
                fileExt = "." + smiley["fileExt"],
                code = [],
                i, len = fileNames.length, name;

            for(i = 0; i < len; i++) {
                name = fileNames[i];

                code.push(
                        '<img src="' + base +  name + fileExt
                        + '" alt="' + name
                        + '" title="' + name
                        + '" />');

                // TODO: 让 5 可配置
                if(i % 5 === 4) code.push("<br />");
            }

            return code.join("");
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var self = this;

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.nodeName) {
                    case "IMG":
                        self._insertImage(target.src, target.getAttribute("alt"));
                        break;
                    default: // 点击在非按钮处，停止冒泡，保留对话框
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * 插入图片
         */
        _insertImage: function(url, alt) {
            url = Lang.trim(url);

            // url 为空时，不处理
            if (url.length === 0) {
                return;
            }

            var editor = this.editor,
                range = editor.getSelectionRange(),
                img;

            // 插入图片
            if (!isIE) {
                img = document.createElement("img");
                img.src = url;
                img.setAttribute("alt", alt);
                range.insertNode(img);
            } else {
                editor.execCommand("insertImage", url);
            }
        }
    });

 });

// TODO:
//  1. 多套表情支持
//  2. 表情的多国语言支持，包括 alt 和 title 信息
