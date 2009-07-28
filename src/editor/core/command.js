
KISSY.Editor.add("core~command", function(E) {

    var ua = YAHOO.env.ua,

        CUSTOM_COMMANDS = {
            backColor: ua.gecko ? "hiliteColor" : "backColor"
        },
        BASIC_COMMANDS = "bold,italic,underline,strike,strikeThrough",
        STYLE_WITH_CSS = "styleWithCSS",
        EXEC_COMMAND = "execCommand";
    
    E.Command = {

        /**
         * 执行 doc.execCommand
         */
        exec: function(doc, cmdName, val) {
            cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;

            this._preExec(doc, cmdName);
            doc[EXEC_COMMAND](cmdName, false, val);
        },

        _preExec: function(doc, cmdName) {

            // 关闭 gecko 浏览器的 styleWithCSS 特性，使得产生的内容和 ie 一致
            if(ua.gecko && BASIC_COMMANDS.indexOf(cmdName) > -1) {
                doc[EXEC_COMMAND](STYLE_WITH_CSS, false, false);
            } else {
                doc[EXEC_COMMAND](STYLE_WITH_CSS, false, true);
            }
        }
    };

});
