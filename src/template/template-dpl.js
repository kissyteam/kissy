/**
 * @fileoverview KISSY.Template DPL.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template-dpl', function(S, undefined) {

    var T = S.Template;

    T.addStatement('dpl-button', {
        start: 'KS_TEMPL.push("<span class="dpl-button ' + KS_TEMPL_STAT_PARAM + '"><button>',
        end: '</button></span>")'
    });

    // dpl-tabs-template {{{
    /**
     * @see http://kissyteam.github.com/kissy-dpl/src/tabs/demo.html
     */
    T.addStatement('dpl-tabs', {
        start: 'KS_TEMPL.push("<div class="tabs"><s class="tabs-tp"><b></b></s>',
        end: '<s class="tabs-bt"><b></b></s></div>")'
    });

    T.addStatement('dpl-tabs-hd', {
        start: 'KS_TEMPL.push("<ul class="tabs-hd">',
        end: '</ul>")'
    });

    T.addStatement('dpl-tabs-trigger', {
        start: 'KS_TEMPL.push("<li class="tabs-trigger ' + KS_TEMPL_STAT_PARAM + '"><i></i><h3>',
        end: '</h3></li>")'
    });

    T.addStatement('dpl-tabs-bd', {
        start: 'KS_TEMPL.push("<div class="tabs-bd">',
        end: '</div>")'
    });

    T.addStatement('dpl-tabs-panel', {
        start: 'KS_TEMPL.push("<div class="tabs-panel" style="display:none;">',
        end: '</div>")'
    });
    // }}}

}, {host: 'template'});
