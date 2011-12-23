/**
 * @fileOverview 远程校验
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/remote", function(S, DOM, Event, Util) {

    function Remote(el, config, callback) {
        var timer = null,
            ajaxHandler = null,
            cache = new Util.storage(),
            elName = DOM.attr(el, "name"),
            cfg = {
                loading: "loading",
                type: 'POST',
                dataType: 'json',
                data: {}
            };

        S.mix(cfg, config);

        function success(val){
            return function(data, textStatus, xhr) {
                if (data && (data.state===true || data.state===false)) {
                    callback(data.state, data.message);
                    if(data.state) {
                        cache.add(val, { est: data.state,msg: data.message});
                    }
                }else{
                    callback(0,"failure");
                }
                //用户自定义回调方法
                if (S.isFunction(config.success)) {
                    config.success.call(this, data, textStatus, xhr);
                }
                ajaxHandler = null;
            };
        }

        cfg.error = function(data, textStatus, xhr) {
            if (S.isFunction(config.error)) {
                config.success.call(this, data, textStatus, xhr);
            }
        };

        function ajax(time, val) {
            S.io(cfg);
        }


        this.check = function(val) {
            //缓存
            var r = cache.get(val);
            if (r) {
                return [r.msg,r.est];
            }

            //延迟校验
            if (timer)timer.cancel();
            timer = S.later(function() {
                if(ajaxHandler){
                    ajaxHandler.abort();
                }
                cfg.data[elName] = val;
                cfg.success = success(val);
                ajaxHandler = S.io(cfg);
            }, 500);
            return [cfg.loading,0];
        }

    }

    return Remote;


}, { requires: ['dom',"event","../utils"] });





