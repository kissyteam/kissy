
KISSY.Editor.add("core~command", function(E) {

    var ua = YAHOO.env.ua,

        CUSTOM_COMMANDS = {
            backColor: ua.gecko ? "hiliteColor" : "backColor"
        };
    
    E.Command = {

        /**
         * 执行 doc.execCommand
         */
        exec: function(doc, cmdName, val) {
            if(!doc.inited) {
                this._initDoc(doc);
            }

            cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;
            doc.execCommand(cmdName, false, val);
        },

        /**
         * 对 doc 进行初始化操作
         */
        _initDoc: function(doc) {
            if(ua.gecko) {
                // 关闭 gecko 浏览器的 styleWithCSS 特性，使得产生的内容和 ie 一致
                doc.execCommand("styleWithCSS", false, false);
            }

            doc.inited = true;
        }
    };

});
