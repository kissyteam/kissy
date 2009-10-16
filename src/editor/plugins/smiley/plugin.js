
KISSY.Editor.add("plugins~smiley", function(E) {

    var Y = YAHOO.util, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        DIALOG_CLS = "ks-editor-smiley-dialog",
        ICONS_CLS = "ks-editor-smiley-icons",
        SPRITE_CLS = "ks-editor-smiley-sprite",

        defaultConfig = {
                tabs: ["default"]
            };

    E.addPlugin("smiley", {
        /**
         * 种类：按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 配置项
         */
        config: {},

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
            this.config = Lang.merge(defaultConfig, this.editor.config.pluginsConfig[this.name] || {});

            this._renderUI();
            this._bindUI();
        },

        /**
         * 初始化对话框界面
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

            dialog.className += " " + DIALOG_CLS;
            this.dialog = dialog;
            this._renderDialog();

            if(UA.ie) E.Dom.setItemUnselectable(dialog);
        },

        _renderDialog: function() {
            var smileyConfig = E.Smilies[this.config["tabs"][0]], // TODO: 支持多个 tab
                mode = smileyConfig["mode"];

            if(mode === "icons") this._renderIcons(smileyConfig);
            else if(mode === "sprite") this._renderSprite(smileyConfig);

        },

        _renderIcons: function(config) {
            var base = this.editor.config.base + "smilies/" + config["name"] + "/",
                fileNames = config["fileNames"],
                fileExt = "." + config["fileExt"],
                cols = config["cols"],
                htmlCode = [],
                i, len = fileNames.length, name;

            htmlCode.push('<div class="' + ICONS_CLS + '">');
            for(i = 0; i < len; i++) {
                name = fileNames[i];

                htmlCode.push(
                        '<img src="' + base +  name + fileExt
                        + '" alt="' + name
                        + '" title="' + name
                        + '" />');

                if(i % cols === cols - 1) htmlCode.push("<br />");
            }
            htmlCode.push('</div');

            this.dialog.innerHTML = htmlCode.join("");
        },

        _renderSprite: function(config) {
            var base = config.base,
                filePattern = config["filePattern"],
                fileExt = "." + config["fileExt"],
                len = filePattern.end + 1,
                step = filePattern.step,
                i, code = [];

            code.push('<div class="' + SPRITE_CLS + ' ks-clearfix" style="' + config["spriteStyle"] + '">');
            for(i = 0; i < len; i += step) {
                code.push(
                        '<span data-icon="' + base +  i + fileExt
                        + '" style="' + config["unitStyle"] + '"></span>');
            }
            code.push('</div');

            this.dialog.innerHTML = code.join("");
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var self = this;

            // range 处理
            Event.on(this.domEl, "click", function() {
                // 保存 range, 以便还原
                self.range = self.editor.getSelectionRange();

                // 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
                // 注：通过 blur / focus 等方式在 ie7- 下无效
                UA.ie && self.editor.contentDoc.selection.empty();
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.nodeName) {
                    case "IMG":
                        self._insertImage(target.src, target.getAttribute("alt"));
                        break;
                    case "SPAN":
                        self._insertImage(target.getAttribute("data-icon"), "");
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
                range = this.range;

            // 插入图片
            if (window.getSelection) { // W3C
                var img = editor.contentDoc.createElement("img");
                img.src = url;
                img.setAttribute("alt", alt);

                range.deleteContents(); // 清空选中内容
                range.insertNode(img); // 插入图片

                // 使得连续插入图片时，添加在后面
                if(UA.webkit) {
                    var selection = editor.contentWin.getSelection();
                    selection.addRange(range);
                    selection.collapseToEnd();
                } else {
                    range.setStartAfter(img);
                }

                editor.contentWin.focus(); // 显示光标

            } else if(document.selection) { // IE
                if("text" in range) { // TextRange
                    range.pasteHTML('<img src="' + url + '" alt="' + alt + '" />');

                } else { // ControlRange
                    editor.execCommand("insertImage", url);
                }
            }
        }
    });

 });

/**
 * NOTES:
 *   - Webkit 下，不能将一个 document 内创建的 dom 节点移动到另一个 document
 *     http://www.codingforums.com/archive/index.php/t-153219.html 
 */
// TODO:
//  1. 多套表情支持
//  2. 表情的多国语言支持，包括 alt 和 title 信息
