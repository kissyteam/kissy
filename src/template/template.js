/**
 * @module template
 * @author 文河(yyfrankyy@gmail.com)
 */
KISSY.add('template', function(S, undefined){

    // 前端，如果不使用本地存储，基本不需要缓冲
    var cache = {};

    /**
     * @see http://ejohn.org/blog/javascript-micro-templating/
     * @param templ 待渲染的模板
     * @param vari 待渲染的数据变量名，模板内部调用
     */
    var Template = function(templ){

        if(!(templ in cache)) {

            var _lq = "<%", _rq = "%>",
                _parser = [
                    "var _ks_tmpl=[];with(_ks_data){_ks_tmpl.push('",
                        S.trim(templ)
                             .replace(new RegExp("[\r\t\n]", "g"), " ")
                             .replace(new RegExp(_lq, "g"), "\t")
                             .replace(new RegExp("(^|" + _rq + ")[^\t]*'", "g"), "$1\r")
                             .replace(new RegExp("\t=(.*?)" + _rq, "g"), "',$1,'")
                             .replace(new RegExp("\t", "g"), "');")
                             .replace(new RegExp(_rq, "g"), "_ks_tmpl.push('")
                             .replace(new RegExp("\r", "g"), "\\'"),
                    "');};return _ks_tmpl.join('');"
                ].join("");

            cache[templ] = {
                parser: _parser,
                render: new Function ("_ks_data", _parser)
            };
        }

        return cache[templ];
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
