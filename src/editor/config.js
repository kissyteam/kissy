
KISSY.Editor.add("config", function(E) {

    E.config = {
        /**
         * 基本路径
         */
        base: "",

        /**
         * 语言
         */
        language: "en",

        /**
         * 主题
         */
        theme: "default",

        /**
         * Toolbar 上功能插件
         */
        toolbar: [
            "undo", "redo",
            "",
            "bold", "italic", "underline", "foreColor", "backColor",
            "",
            "link",
            "",
            "insertOrderedList", "insertUnorderedList", "outdent", "indent", "justifyLeft", "justifyCenter", "justifyRight"
        ]
    };

});
