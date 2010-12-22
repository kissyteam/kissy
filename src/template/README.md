# KISSY Template

## 特性

 * 模板语法,从`{{#tagName}}`开始,由`{{/tagName}}`结束(如果有结束标签的话).
 * 模板变量,`{{variable}}`.
 * 原生支持 if/elseif/else/each/! 四个标签.
 * 支持嵌套.
 * 容错和调试.
 * 性能还不赖.
 * 容易扩展.

## 模板语法和范例

### 变量

变量支持JavaScript语法里的任何有返回值的语句,比如 `name`, `user.name`, `user[0].name`, 甚至可以使用方法, `KISSY.one('#template').html()`

#### 语法

    {{Variable}}

#### 范例

    KISSY.Template('Hello, {{name}}.')
        .render({name: 'Frank'});

    Hello, Frank.

    KISSY.Template('Hello, {{user.name}}.')
        .render({user: {name: 'Frank'}});

    Hello, Frank.

### if 语句

#### 语法 
    {{#if conditions}}
        BLOCK
    {{/if}}

#### 范例

    KISSY.Template('Hello, {{#if show}}{{name}}{{/if}})')
        .render({show: true, name: 'Frank'});

    Hello, Frank

### else和elseif

#### 语法

    {{#if conditions}}
        BLOCK
    {{#elseif conditions}}
        ELSEIF BLOCK
    {{#else}}
        ELSE BLOCK
    {{/if}}

#### 范例

    KISSY.Template('Hello, {{#if showName}}{{name}}.{{#else}}{{nick}}{{/if}})')
        .render({showName: false, name: 'Frank', nick: 'yyfrankyy'});

    Hello, yyfrankyy.

    KISSY.Template('Hello, {{#if name}}{{name}}.{{#elseif nick}}{{nick}}{{/if}})')
        .render({name: 'Frank', nick: 'yyfrankyy'});

    Hello, Frank.

### each

循环读取某个变量,直接调用`KISSY.each`方法进行遍历.

#### 语法

    {{#each conditions}}
        BLOCK
    {{/each}}

#### 范例

    KISSY.Template('Hello, {{#each names}}<b color="{{_ks_value.color}}">{{_ks_value.name}}</b>{{/each}})')
        .render({names: [{name: 'Frank', color: 'red'}, {name: 'yyfrankyy', color: 'green']});

    Hello, <b color="red">Frank</b><b color="green">yyfrankyy</b>

### !

单行注释

#### 语法

    {{#! comments}}

#### 范例

    KISSY.Template('Hello, {{#! here you go.}}{{name}}.').render({name: 'Frank'});

    Hello, Frank.

### 标签嵌套

理论上支持任意标签嵌套,如果标签有关闭字符,记得关闭=,=,嵌套标签形成多代码块嵌套,作用域与JavaScript的作用域一致.

#### 语法

    {{#each object}}
        {{#if condition}}
            BLOCK
        {{/if}}
    {{/each}}

#### 范例

    KISSY.Template('Hello, {{#each users}}{{#if _ks_value.show}}{{_ks_value.name}}{{/if}}{{/each}}.')
        .render({users: [{show: false, name: 'Frank'}, {show: true, name: 'yyfrankyy'}]});

    Hello, yyfrankyy.

## 容错和调试.

### 容错

目前支持两种错误信息:

1. Syntax Error. 指模板在预编译阶段发生语法错误(模板编译后生成的脚本语法错误).
2. Render Error. 指模板在渲染时发生错误(运行时错误,数据错误,或者模板变量错误等).

### 调试

默认情况下,模板将编译时和运行时的错误,直接返回到结果里.

调试过程可调用`KISSY.Template.log()`方法输出渲染方法,定位脚本模板错误,并可通过引用`jsbeauty`来格式化生成的模板方法.

## 模板性能

<script type="text/javascript" src="//ajax.googleapis.com/ajax/static/modules/gviz/1.0/chart.js"> {"chartType":"ColumnChart","chartName":"Chart 2","dataSourceUrl":"//spreadsheets.google.com/tq?key=0ApZFGfLktT7FdDgtcGdzWV9wSzRpX2FRTElzZmVoV2c&range=A1%3AD11&gid=4&transpose=0&headers=1&pub=1","options":{"displayAnnotations":true,"showTip":true,"reverseCategories":false,"titleY":"","dataMode":"markers","maxAlternation":1,"pointSize":"0","colors":["#3366CC","#DC3912","#FF9900","#109618","#990099","#0099C6","#DD4477","#66AA00","#B82E2E","#316395"],"smoothLine":false,"lineWidth":"2","labelPosition":"right","is3D":false,"logScale":false,"hasLabelsColumn":true,"wmode":"opaque","title":"JavaScript Template Engine Performance /IE6","legend":"top","allowCollapse":true,"cht":"bhg","reverseAxis":false,"isStacked":false,"mapType":"hybrid","width":1272,"height":716},"packages":"corechart","refreshInterval":5} </script>

## 扩展

模板方法仅依赖于KISSY的`core`部分,默认调用为:

    KISSY.Template('template here.').render(data);

而:

    var templ = KISSY.Template();

可直接预编译模板方法.

### API

#### KISSY.tmpl

    KISSY.tmpl('#template', {name: 'Frank'}).appendTo('#container');

### 语法扩展

`KISSY.Template.addStatement()`方法,提供扩展语法的接口,目前支持标签语法开始,关闭及一个参数传递.

比如:

    KISSY.Template.addStatement({'while': {
        start: 'while(KS_TEMPL_STAT_PARAM){',
        end: '}'
    }});

即可支持`while`语句

    {{#while true}}
        BLOCK
    {{/while}}
