/**
 * flash utilities
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/flash-common/utils", function (S, SWF) {
    var DOM = S.DOM,

        flashUtils = {

            insertFlash: function (editor, src, attrs, _cls, _type) {
                var nodeInfo = flashUtils.createSWF({
                        src: src,
                        attrs: attrs,
                        document: editor.get("document")[0]
                    }),
                    real = nodeInfo.el,
                    substitute = editor.createFakeElement(real,
                        _cls || 'ke_flash',
                        _type || 'flash',
                        true,
                        nodeInfo.html,
                        attrs);
                editor.insertElement(substitute);
                return substitute;
            },

            isFlashEmbed: function (element) {
                return (
                    DOM.attr(element, "type") == 'application/x-shockwave-flash' ||
                        /\.swf(?:$|\?)/i.test(DOM.attr(element, "src") || '')
                    );
            },

            getUrl: function (r) {
                return SWF.getSrc(r);
            },

            createSWF: function (cfg) {
                var render = DOM.create('<div style="' +
                    "position:absolute;left:-9999px;top:-9999px;" +
                    '"></div>', undefined, cfg.document);
                cfg.htmlMode = 'full';
                DOM.append(render, cfg.document.body);
                cfg.render = render;
                var swf = new SWF(cfg);
                DOM.remove(render);
                return {
                    el: S.all(swf.get('el')),
                    html: swf.get('html')
                };
            }
        };

    return flashUtils;
}, {
    requires: ['swf']
});