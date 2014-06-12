## 浏览器端使用

### 未预编译

``` javascript
KISSY.use('xtemplate',function(S,XTemplate){
  new XTemplate('{{x}}').render({x:1},function(error,z){
    // z=>1
  });
})
```

### 预编译

```
npm install kissy@5.0.0-alpha.2 -g
kissy-xtemplate -p x/   // x/ 为模板文件目录，后缀为 -xtpl.html
```

``` javascript
KISSY.use('xtemplate/runtime,a/b-xtpl',function(S,XTemplate,bXtpl){
  new XTemplate(bXtpl).render({x:1},function(error,z){
    // z=>1
  });
})
```

## node 下使用

包：https://www.npmjs.org/package/xtpl

express 下使用:

``` javascript
app.set("view engine", "xtpl");
```

模板文件全部为 xtpl 后缀，目录规范和渲染同 express

## 语法

### 基本类型

支持 true false null undefined number string

### 字面模式

```
{{%

{{x}}

%}}  // => {{x}}
```

### 注释

```
{{! zhu shi }}
```

### 变量渲染

转义：

```
{{x}}
```

非转义:

```
{{{x}}}
```

### 支持变量属性获取

``` javascript
var x = {
    y: 1
};
var y = [1, 2, 3];
var z = {
    q: 1
};
var x = 'q';
```

```
{{x.y}} // 1
{{y[1]}} // 2
{{z[x]}} // 1
```

### 调用变量方法

注意：该用法会影响性能，推荐自定义命令

``` javascript
var x = [1, 2, 3];
```

```
{{#each(x.slice(1))}}{{this}} {{/each}} // => 2 3
```

### 变量运算

支持 + - * / %

```
{{x+y}}
{{x + "1"}}
{{ y - 1 }}
```

### 比较操作

支持 === !=== > >= < <=

```
{{#if( x===1)}}
1
{{else}}
2
{{/if}}

{{#if ( (x+1) > 2 )}}
{{/if}}
```

### 逻辑操作

支持 || &&

```
{{#if(x>1 && y<2)}}
{{/if}}
```

```
{{#if(!x)}}
{{/if}}
```

### 循环操作

可以对数组或对象进行循环操作，默认获取循环对象值为 {{this}}，键为 {{xindex}} , 也可以指定.

``` javascript
var x = ['a', 'b'];
```

```
{{#each(x)}}
{{xindex}} {{this}} // 0 a 1 b
{{/each}}

{{#each(x,"value","index")}}
{{key}} {{value}} // 0 a 1 b
{{/each}}
```

### 范围循环

可以对 start 和 end(不包含) 范围内的数字进行循环

```
{{#each(range(0,3))}}{{this}}{{/each}} // 012
{{#each(range(3,0))}}{{this}}{{/each}} // 321
{{#each(range(3,0,2))}}{{this}}{{/each}} // 31
```

### 设置操作

```
{{set(x=1)}}

{{x}} // 1
```

### 宏

```
// 声明
{{#macro("test","param" default=1)}}param is {{param}} {{default}}{{/macro}}

// 调用宏
{{macro("test","2")}} // => param is 2 1

{{macro("test", "2", 2)}} // => param is 2 2
```

### 包含操作

x.xtpl:
```
{{z}}
```

y.xtpl
```
{{include("x")}}
```

### 继承

layout.xtpl

``` html
<!doctype html>
<html>
    <head>
        <meta name="charset" content="utf-8" />
        <title>{{title}}</title>
        {{{block ("head")}}} // 坑
    </head>
    <body>
        {{{include ("./header")}}}
        {{{block ("body")}}}  // 坑
        {{{include ("./footer")}}}
    </body>
</html>
```

index.xtpl

``` html
{{extend ("./layout1")}}

// 填
{{#block ("head")}}
    <link type="text/css" href="test.css" rev="stylesheet" rel="stylesheet"/>
{{/block}}

// 填
{{#block ("body")}}
    <h2>{{title}}</h2>
{{/block}}
```

### 自定义命令

#### nodejs 全局命令

同步调用行内：

``` javascript
var xtpl = require('xtpl');
xtpl.XTemplate.addCommand('xInline',function(scope, option){
  return option.params[0]+'1';
});
```

```
{{xInline(1)}} // => 2
```

同步调用块级：

``` javascript
var xtpl = require('xtpl');
xtpl.XTemplate.addCommand('xBlock',function(scope, option, buffer){
  return option.fn(scope, buffer)+option.params[0];
});
```

```
{{#xBlock(1)}}
2
{{/xBlock}}
// => 21
```

异步调用行内

``` javascript
var xtpl = require('xtpl');
xtpl.XTemplate.addCommand('xInline',function(scope, option,buffer){
  buffer = buffer.async(function(newBuffer){
    setTimeout(function(){
        newBuffer.write(option.params[0]+1).end();
    },10);
  });
  return buffer;
});
```

```
{{xInline(1)}} // => 2
```

异步调用块级：

``` javascript
var xtpl = require('xtpl');
xtpl.XTemplate.addCommand('xInline',function(scope, option,buffer){
  buffer = buffer.async(function(newBuffer){
    setTimeout(function(){
        var newScope = xtpl.XTemplate.Scope({ret:2});
        newScope.setParent(scope);
        option.fn(newScope, newBuffer);
    },10);
  });
  buffer.write(option.params[0]);
  return buffer;
});
```

```
{{#xBlock(1)}}
{{ret}}
{{/xBlock}}
// => 21
```

#### 浏览器命令

全局：

``` javascript
KISSY.use('xtemplate/runtime',function(S,XTemplate){
    XTemplate.addCommand(...) // 同 node
});
```

局部：

``` javascript
KISSY.use('xtemplate/runtime',function(S,XTemplate){
    new XTemplate('{{x()}}',{
        commands:{
            x:function(){
                // ... 同 node
            }
        }
    })...
});
```