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

        // 获取hash串，作为cache key保留
        var hex = "Crypto" in S ? S.Crypto.hex_sha1 : S.now,

            _var = '_ks_data',

            _ks_tmpl = "_ks_tmpl_" + hex(templ).substring(0, 13);

        if(templ in cache) {
            return cache[templ];
        }

        var _parser = [
                "var " + _ks_tmpl + " = [];", 
                "with(" + _var + ") {",
                    _ks_tmpl + ".push('",
                        S.trim(templ)

                             //把 \' 处理为 \\''
                             //.replace(/([\\'])/g, "\\$1")

                             //清除换行，和tab，接下去用\t\r进行占位
                             .replace(/[\r\t\n]/g, " ")

                             //把<%全部替换成\t
                             .split("<%").join("\t")

                             //XXX 这一步是干嘛的？
                             .replace(/(^|%>)[^\t]*'/g, "$1\r")

                             //把<%=id%>声明的变量替换为: ',id,'
                             .replace(/\t=(.*?)%>/g, "',$1,'")

                             //非<%=的\t无用，把之前的push补上括号
                             //<%表示为真正的js语句，直接执行;
                             .split("\t").join("');")

                             //上一步替换掉<%，这一步继续替换%>为p.push
                             //条件/循环等语句内部局部作用域push
                             .split("%>").join(_ks_tmpl + ".push('")

                             //把换行换成\'，结束多余字符
                             .split("\r").join("\\'"),

                   "'); ",
                "}",
                "return " + _ks_tmpl + ".join('');"
            ].join("");

        var render = new Function (_var, _parser);

        cache[templ] = {
            hash: _ks_tmpl,
            parser: _parser,
            render: render
        };

        return cache[templ];
    };

    S.Template = S.mix(Template, {
        getCache: function(hash){
            return cache[hash];
        }
    });
}, { requires: [ 'core' ] } );
