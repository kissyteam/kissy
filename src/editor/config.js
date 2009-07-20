
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
         * 需要加载的插件
         */
        plugins: "",

        /**
         * 主题
         */
        theme: "default",

        /**
         * Toolbar 上功能键
         */
        toolbar: [
            "bold", "italic", "underline",
            "",
            "orderedList", "unorderedList", "outdent", "indent", "justifyLeft", "justifyCenter", "justifyRight"
        ]
    };

});
