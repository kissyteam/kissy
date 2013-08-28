/**
 * simple log utils
 * @author yiminghe@gmail.com
 */
(function () {
    var log_div;
    
    function create(html){
    	var div=document.createElement('div');
    	div.innerHTML=html;
      return div.firstChild;
    }

    function log(str) {
        var height = 100;
        if (window.innerHeight > 500) {
            height = 200;
        }
        if (!log_div) {
            log_div =create('<div style="position:fixed;' +
                'right:0;top:0;width:200px;' +
                'z-index:9999;' +
                'height:' + height + 'px;' +
                '-webkit-overflow-scrolling: touch;' +
                'border:1px solid red;' +
                'background:white;' +
                'overflow:auto"></div>');
            document.body.appendChild(log_div);
            var button = create('<button style="position:fixed;' +
                'right:0;top:' + height + 'px;width:200px;' +
                'z-index:9999;">clear</button>');
            document.body.appendChild(button);
            button.onclick = function () {
                log_div.innerHTML = '';
            };
        }
        log_div.appendChild(create('<p>' + str + ' : ' + new Date().valueOf() + '</p>'));
        log_div.scrollTop = log_div.scrollHeight;
    }

    window.log = log;
})();