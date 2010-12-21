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

## 扩展

### KISSY.tmpl 方法

    KISSY.tmpl('#template', {name: 'Frank'}).appendTo('#container');
