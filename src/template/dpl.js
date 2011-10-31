/**
 * @fileoverview KISSY.Template DPL.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template/dpl', function(S) {

    var T = S.Template,
        KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM';

    T.DPL = {
        add: function(tagName, config) {
             var s = {};
             for (var i in config) {
                 s[i] = 'KS_TEMPL.push("' + config[i].replace(/(['"])/ig, '\\$1') + '");';
             }
             T.addStatement(tagName, s);
        }
    };

    T.DPL.add('button', {
        start: '<span class="dpl-button ' + KS_TEMPL_STAT_PARAM + '"><button>',
        end: '</button></span>'
    });

    // dpl-tabs-template {{{
    /**
     * @see http://kissyteam.github.com/kissy-dpl/src/tabs/demo.html
     */
    T.DPL.add('tabs', {
        start: '<div class="tabs"><s class="tabs-tp"><b></b></s>',
        end: '<s class="tabs-bt"><b></b></s></div>'
    });

    T.DPL.add('tabs-hd', {
        start: '<ul class="tabs-hd">',
        end: '</ul>'
    });

    T.DPL.add('tabs-trigger', {
        start: '<li class="tabs-trigger ' + KS_TEMPL_STAT_PARAM + '"><i></i><h3>',
        end: '</h3></li>'
    });

    T.DPL.add('tabs-bd', {
        start: '<div class="tabs-bd">',
        end: '</div>'
    });

    T.DPL.add('tabs-panel', {
        start: '<div class="tabs-panel' + KS_TEMPL_STAT_PARAM + '">',
        end: '</div>'
    });
    // }}}

}, {host: 'template'});
