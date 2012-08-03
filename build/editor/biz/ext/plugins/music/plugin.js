/**
 * biz plugin , xiami music intergration
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("xiami-music", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "xiami-music",
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

    function checkXiami(url) {
        return /xiami\.com/i.test(url);
    }

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,
                    //增加音乐名字提示
                    title = element.attributes.title,
                    i,
                    c,
                    classId = attributes['classid']
                        && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        c = element.children[ i ];
                        if (c.name == 'embed') {
                            if (!KE.Utils.isFlashEmbed(c))
                                return null;
                            if (checkXiami(c.attributes.src)) {
                                return dataProcessor.createFakeParserElement(element,
                                    CLS_XIAMI, TYPE_XIAMI, true, {
                                    title:title
                                });
                            }
                        }
                    }
                    return null;
                }
                for (i = 0; i < element.children.length; i++) {
                    c = element.children[ i ];
                    //innerHTML 会莫名首字母大写，还会加入一些属性
                    //Movie
                    if (c.name == 'param'
                        && c.attributes.name.toLowerCase() == "movie") {
                        if (checkXiami(c.attributes.value)) {
                            return dataProcessor.createFakeParserElement(element,
                                CLS_XIAMI, TYPE_XIAMI, true, {
                                title:title
                            });
                        }
                    }
                }
            },

            'embed' : function(element) {
                if (!KE.Utils.isFlashEmbed(element))
                    return null;
                if (checkXiami(element.attributes.src)) {
                    return dataProcessor.createFakeParserElement(element,
                        CLS_XIAMI, TYPE_XIAMI, true, {
                        title:element.attributes.title
                    });
                }
            }
            //4 比 flash 的优先级 5 高！
        }}, 4);

    editor.addPlugin("xiami-music", function() {
        var context = editor.addButton("xiami-music", {
            contentCls:"ke-toolbar-music",
            title:"插入虾米音乐" ,
            mode:KE.WYSIWYG_MODE,
            loading:true
        });

        KE.use("xiami-music/support", function() {
            var music = new KE.XiamiMusic(editor);
            context.reload({
                offClick:function() {
                    music.show();
                },
                destroy:function() {
                    music.destroy();
                }
            });
        });

        this.destroy = function() {
            context.destroy();
        }
    });

},
{
    attach:false,
    requires : ["fakeobjects"]
});