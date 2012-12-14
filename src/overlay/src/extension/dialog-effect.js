/**
 * @ignore
 * effect for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/extension/dialog-effect', function (S) {

    function DialogEffect() {

    }

    DialogEffect.prototype = {

        // also simplify body
        __afterCreateEffectGhost: function (ghost) {
            var self = this,
                body,
                elBody = self.get("body");

            ghost.all('.' + self.get('prefixCls') + 'stdmod-body')
                .css({
                    height: elBody.height(),
                    width: elBody.width()
                })
                .html('');

            return ghost;
        }

    };

    return DialogEffect;

});