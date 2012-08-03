KISSY.Editor.add("flash", function(editor) {

    var S = KISSY,
        KE = S.Editor,
        CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        dataProcessor = editor.htmlDataProcessor,
        pluginConfig = editor.cfg.pluginConfig,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,i,
                    classId = attributes['classid'] && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!KE.Utils.isFlashEmbed(element.children[ i ]))
                                return null;
                            return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
                        }
                    }
                    return null;
                }
                return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
            },

            'embed' : function(element) {
                if (!KE.Utils.isFlashEmbed(element))
                    return null;
                return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
            }
        }}, 5);

    editor.addPlugin("flash", function() {
        var context;
        if (!pluginConfig["flash"] ||
            pluginConfig["flash"].btn !== false) {
            context = editor.addButton("flash", {
                contentCls:"ke-toolbar-flash",
                title:"插入Flash" ,
                mode:KE.WYSIWYG_MODE,
                loading:true
            });
        }
        KE.use("flash/support", function() {
            var flash = new KE.Flash(editor);
            context && context.reload({
                offClick:function() {
                    flash.show();
                },
                destroy:function() {
                    flash.destroy();
                }
            })
        });

        this.destroy = function() {
            context.destroy();
        };
    });

}, {
    attach:false,
    requires:["fakeobjects"]
});
