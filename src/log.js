/**
 * simple log utils
 * @author yiminghe@gmail.com
 */
(function (S) {
    var log_div;

    function log(str) {
        if (!log_div) {
            log_div = S.all('<div style="position:fixed;right:0;top:0;width:200px;height:100px;border:1px solid red;overflow:auto"></div>').appendTo('body');
        }
        log_div.append('<p>' + str + ' : ' + S.now() + '</p>');
        log_div[0].scrollTop = log_div[0].scrollHeight;
    }

    window.log = log;
})(KISSY);