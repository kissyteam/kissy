# xtemplate

Provide logic template engine for KISSY.

## 1.5.0

 [!] 去除二义性，不兼容 mustache，if each 等必须显示指定。提高性能。
 [!] 改变语法，命令调用必须加括号，参数以逗号分隔，例如 {{#if(x > 1)}}{{/if}} {{each(data,"x")}}{{/each}}
 [!] 不支持 {{{^ ，用 ! 替代. 例如 {{^if x}} => {{if(!x)}}
 [+] 支持命令的嵌套调用 {{join( map(users) )}}