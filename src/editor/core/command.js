
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
            cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;
            doc.execCommand(cmdName, false, val);
        }
    };

});
