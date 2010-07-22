/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com
 */
KISSY.add('anim-node-plugin', function(S, undefined) {

    var Anim = S.Anim,
        NP = S.Node.prototype, NLP = S.NodeList.prototype;

    S.each([NP, NLP], function(P) {

        P.animate = function() {
            var args = S.makeArray(arguments);

            S.each(this, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            
            return this;
        };
    })

});

/**
 * TODO:
 *  - 考虑直接给 Node 添加 Node.addMethods 方法
 *  - 考虑是否添加 slideUp/slideDown/fadeIn/show/hide 等快捷方法
 *
 */
