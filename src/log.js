/**
 * simple log utils
 * @author yiminghe@gmail.com
 */
(function (S) {
    var log_div;

    function log(str) {
        var DOM = S.DOM;
        if (!log_div) {
            log_div = DOM.create('<div style="position:fixed;' +
                'right:0;top:0;width:200px;' +
                'height:100px;' +
                'border:1px solid red;' +
                'background:white;' +
                'overflow:auto"></div>');
            DOM.append(log_div, document.body);
        }
        DOM.append(DOM.create('<p>' + str + ' : ' + S.now() + '</p>'),
            log_div);
        log_div.scrollTop = log_div.scrollHeight;
    }

    window.log = log;
})(KISSY);