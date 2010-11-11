/**
 * @module template
 * @author 文河(yyfrankyy@gmail.com)
 */
KISSY.add('template', function(S, undefined){

    var 
        // 前端，如果不使用本地存储，基本不需要模板缓冲
        templateCache = {},

        // 正则缓存
        regexpCache = {},
        getRegexp = function(regexp) {
            if (!(regexp in regexpCache)) {
                regexpCache[regexp] = new RegExp(regexp, "g");
            }
            return regexpCache[regexp];
        },

        // 特殊字符转义
        checkSpacial = function(char){
            return char.replace(/([{}\[\]()?*.\\\/])/g, "\\$1");
        },

        // 静态化parser
        buildparser = function(templ, lq, rq) {
            lq = checkSpacial(lq);
            rq = checkSpacial(rq);
            templ = S.trim(templ)
                    .replace(getRegexp("[\r\t\n]"), " ")
                    .replace(getRegexp(lq), "\t")
                    .replace(getRegexp("(^|" + rq + ")[^\t]*'"), "$1\r")
                    .replace(getRegexp("\t=(.*?)" + rq), "',$1,'")
                    .replace(getRegexp("\t"), "');")
                    .replace(getRegexp(rq), "_ks_tmpl.push('")
                    .replace(getRegexp("\r"), "\\'");
            return templ;
        };

    /**
     * @see http://ejohn.org/blog/javascript-micro-templating/
     * @param templ 待渲染的模板
     * @param vari 待渲染的数据变量名，模板内部调用
     */
    var Template = function(templ, config){

        if(!(templ in templateCache)) {
            config = S.merge({
                lq: "<%",
                rq: "%>"
            }, config);

            var _ks_data = "_ks_data_" + +new Date,
                _lq = config.lq, _rq = config.rq,
                _parser = "var _ks_tmpl=[];with(" + _ks_data + "){_ks_tmpl.push('" + buildparser(templ, _lq, _rq) + "');};return _ks_tmpl.join('');";

            templateCache[templ] = {
                parser: _parser,
                render: new Function(_ks_data, _parser)
            };
        }

        return templateCache[templ];
    };

    S.Template = Template;
}, { requires: [ 'core' ] } );
/**
 * ChangeLog:
 *
 * 2010-9-22
 *  - 根据new Function的思路，实现了一遍Micro Template，增加一些接口
 *
 * 2010-11-02
 *  - 调整部分接口，实现一个较为复杂的用例，P4P
 *
 * 2010-11-10
 *  - 迁移到kissy目录
 *  - 按照原来的接口，规划好部分单元测试用例
 *
 */
