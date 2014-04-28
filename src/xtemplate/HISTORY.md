# xtemplate

## 5.0

 [!] 去除二义性，不兼容 mustache，if each 等必须显示指定。提高性能。
 [!] 改变语法，命令调用必须加括号，参数以逗号分隔，例如 {{#if(x > 1)}}{{/if}} {{each(data,"x")}}{{/each}}
 [!] 不支持 {{{^ ，用 ! 替代. 例如 {{^if x}} => {{if(!x)}}
 [+] 支持命令的嵌套调用 {{join( map(users) )}}


# 1.4

 - [+] 兼容 mustache
 - [+] 支持 {{%%}} escape 其内所有字符
 - [+] 支持变量做索引 {{data[d]}}
 - [!] 取消对负数支持，请用表达式替代 {{#if x === -1}} -> {{#if x === 0-1}}
 - [+] 支持 macro 宏.  https://github.com/kissyteam/kissy/issues/449
 - [+] 支持命令空间. https://github.com/kissyteam/kissy/issues/451
 - [!] 删除 XTemplate.addSubTpl/XTemplate.removeSubTpl 直接使用 KISSY.add 注册全局模板（模板即模块）
 - [+] 支持 root 关键字获取顶层作用域 {{root.name}}