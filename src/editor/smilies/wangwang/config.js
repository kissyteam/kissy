
KISSY.Editor.add("smilies~config~wangwang", function(E) {

    E.Smilies = E.Smilies || {};

    E.Smilies["wangwang"] = {

        name: "wangwang",

        mode: "sprite",

		base: "http://a.tbcdn.cn/sys/wangwang/smiley/48x48/",

		spriteStyle: "background: url(http://a.tbcdn.cn/sys/wangwang/smiley/sprite.png) no-repeat -1px 0; width: 288px; height: 235px",

        unitStyle: "width: 24px; height: 24px",

		filePattern: {
			start : 0,
			end   : 98,
		    step  : 1	
		},

        fileExt: "gif"
    };

});
