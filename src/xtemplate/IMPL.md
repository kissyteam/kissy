目前在传统的软件开发领域 [DSL](http://en.wikipedia.org/wiki/Domain-specific_language) 已经比较普遍，
特别是 [Martin Fowler](http://martinfowler.com/) 的突出贡献。
而在前端领域尚较少涉及，而如果在前端开发中合理使用 DSL 同样也可以有效得**减少代码数量，提高可读性**，常见的一个应用场景即前端模板的构建。
本质上说模板也是一个微型语言，因此可以从DSL的角度着手，使用工具快速构建一个适合于特定前端框架的模板引擎。
本文将以 [KISSY XTemplate](http://docs.kissyui.com/docs/html/demo/component/xtemplate/index.html)
为例介绍如何构建前端的 DSL。

注：
本文持续更新地址：
[xtemplate at github](https://github.com/kissyteam/kissy/blob/master/src/xtemplate/impl.md).
[xtemplate at docs.kissyui.com](http://docs.kissyui.com/docs/html/tutorials/kissy/component/xtemplate/impl.html).
DSL 也是初学，敬请勘误.



# 首先 npm 安装 kissy

     npm install -g kissy


# xtemplate 示例代码

    this is kissy xtemplate: {{date}}
    {{#if n > n*2}}
        {{{no escape}}}
        {{each array}}
            index: {{xindex}}
            count: {{xcount}}
            value: {{value}}
            {{set t = value*2}}
            subValue:
            {{#with this.subValue}}
                {{subSubValue + ../t}}
            {{/with}}
        {{/each}}
    {{else}}
        {{#custom_block param}}
            {{custom_tpl param2}}
        {{/custom_block}}
    {{/if}}

# 模板词法/语法

这一步主要是为了下一步构建自定义语言的语法树做准备，这里采用使用工具**自动生成语法解析器**（parser）的方向来做，
如果你打算手写解析器则可以略过此步（事实上可以略过本文）。

由于本文关注前端技术，
故词法以及语法都采用 json 格式描述，词法直接采用正则表达式，
语法采用变形的 [BNF](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form) 形式，
例如 xtemplate 的 [词法语法文件](https://github.com/kissyteam/kissy/blob/master/src/xtemplate/src/parser-grammar.kison)

工具采用 kissy 开发的 [LALR](http://en.wikipedia.org/wiki/LALR) 语法解析器生成器 [kison](https://github.com/kissyteam/kissy/tree/master/src/kison).

词法关注如何从输入代码中解析出最基本的代码单元（关键词，字符串，数字...），例如 xtemplate 的部分词法

    {
        state: ['t'],
        regexp: /^{{/,
        token: 'OPEN'
    },
    {
        state: ['t'],
        regexp: /^}}/,
        token: 'CLOSE'
    },
    {
        state: ['t'],
        regexp: /^<=/,
        token: 'LE'
    },
    {
        state: ['t'],
        regexp: /^\+/,
        token: 'PLUS'
    },
    {
        state: ['t'],
        regexp: /^[a-zA-Z0-9_$-]+/,
        token: 'ID'
    },

其中 state 表示单个状态，词法解析过程也是一个状态机变换状态的过程.

而语法解析关注与从词法单元中识别出有效的程序结构，即语法解析树，例如 xtemplate 的部分语法描述：

    {
        symbol: 'Expression',
        rhs: ['ConditionalOrExpression']
    },

    {
        symbol: 'ConditionalOrExpression',
        rhs: ['ConditionalAndExpression']
    },
    {
        symbol: 'program',
        rhs: ['statements', 'inverse', 'statements']
    },
    {
        symbol: 'statement',
        rhs: ['openBlock', 'program', 'closeBlock']
    }

其中对应 BNF 形式中： symbol ::= rhs

# 构建模板抽象语法树

语法词法只是描述了如何识别模板语言，而构建语法树的过程则需要在语法识别过程中由调用者自行构建，
kison 支持在每个语法规则项中添加动作函数，通过工具在识别语言过程中（遍历[语法解析树](http://en.wikipedia.org/wiki/Parse_tree)）
同时有选择性得构建异型[抽象语法树](http://en.wikipedia.org/wiki/Abstract_syntax_tree)，
例如 xtemplate 的树节点构建过程：

    {
        symbol: 'program',
        rhs: ['statements', 'inverse', 'statements'],
        action: function () {
            return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1, this.$3);
        }
    },
    {
        symbol: 'PrimaryExpression',
        rhs: ['path']
    },
    {
        symbol: 'RelationalExpression',
        rhs: ['RelationalExpression', 'LE', 'AdditiveExpression'],
        action: function () {
            return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
        }
    }

其中 最基本的表达式(PrimaryExpression)可以直接是变量词法单元的值，而复杂的比较表达式以及整个程序则是自底向上由子树构建起来.

最后使用 **kissy-kison** 命令

    kissy-kison -g parser.kison -m xtemplate/parser

就可以生成模板解析函数模块，大致为：

    KISSY.add('xtemplate/parser', function(){
        function parse(code){
            // ...
        }
        return parse;
    });

# 模板编译

最后一步即是模板编译过程，将模板代码编译为 javascript 代码，填入数据执行后即可得到真正的渲染 html.

## 调用 parse

经过上一步得到解析函数后，调用

    parse(tempalteCode)

即得到一棵抽象语法树，例如 xtemplate 的一段代码：

    {{#each data}}
    {{#if n === ../n2 * 5}}
    {{n + 10.1}}
    {{/if}}
    {{/each}}

对应的抽象语法树：

![xtemplate ast](http://img04.taobaocdn.com/tps/i4/T1iEDUXmpdXXcyYdHO-265-555.png)

## 翻译代码

接着就可以采用 [visitor](http://en.wikipedia.org/wiki/Visitor_pattern) 模式将生成具体代码的逻辑写入 visitor 对象，遍历 ast 将对应的子树或节点转换成 javascript 代码，

这步可以继续优雅得采用代码模板，将代码模板的数据替换成模板对应的 javascript 单元。
不过为了不折磨大脑，最后放松下，可以直接采用原生的代码拼接：


    visitor.tplNode=function(node){

        if(node.escapeHTML){
            codes.push("if("+node.id+" in data) { ret.push(KISSY.escapeHTML(data."+node.js+");) }"+
            " else { KISSY.warn('not found')!; }");
        }else{
        }

    };

不过确实还是挺折磨.

## 离线编译

大多数 DSL 都是推荐在使用前就转换成目标语言，而客户端在不太注重性能的情况下也可以在终端用户使用时在线编译。

xtemplate 通过 **kissy-xtemplate** 命令支持将模板代码离线编译为模板函数模块，这样客户端可以直接require该模块，
省去了客户端编译过程，同时开发中直接面对 html 类似的模板代码，省去了字符串嵌入模板的繁琐。

例如 t-tpl.html

    {{ offline }} compile

运行

    kissy-xtemplate -t t-tpl.html -m tests/t -w

可得到 t.js

    KISSY.add('tests/t',function(){
        function render(data){
        }
        return render;
    });

离线编译的一个缺点是编译出来的代码肯定比原生模板大很多，这也正体现了 DSL 节省代码，易读的特性（代码肯定不可读了）。

# 下一步

目前存在两大问题：

## 体积较大

    压缩前 130k， 不过 gzip+compress 后由于生成的重复代码比较多，降到 10k，
    不过仍然需要优化生成代码: 减少模板解析器的代码。同时也可优化模板转化为最终代码的大小，这在离线编译情况下很有用。

## xtemplate 模块需要拆分

    当选择离线编译，实际上 xtemplate 的编译代码可以不用下载，
    可拆分为两个模块: xtemplate/runtime 以及 xtemplate/compiler

    这样当选择离线编译时直接use xtemplate/runtime 载入模板的功能基础设施即可。

# xtemplate 文档

[api](http://docs.kissyui.com/docs/html/api/component/xtemplate/index.html)

[demo](http://docs.kissyui.com/docs/html/demo/component/xtemplate/index.html)

[tutorial](http://docs.kissyui.com/docs/html/tutorials/kissy/component/xtemplate/index.html)


# 推荐书籍

感谢这些作者，没有这些书籍， 这个任务不可能完成

[Compilers: Principles,Techniques and Tools](http://book.douban.com/subject/3296317/)

[DSL In Action](http://book.douban.com/subject/4768014/)

[Language Implementation Patterns: Create Your Own Domain-Specific and General Programming Languages](http://book.douban.com/subject/10482195/)

# 致谢

在开发过程中参考一了下工具：

[velocity](http://velocity.apache.org/)

[closure templates](https://developers.google.com/closure/templates/)

[bison](http://www.gnu.org/software/bison/)

[jison](http://zaach.github.com/jison/)

[handlebar](http://handlebarsjs.com/)

[mustache](http://mustache.github.com/)


