# component

## 1.4

 - [+] 组件基类增加 sync 函数，调用后可调用父类、扩展类、插件对应的 syncUI 方法。
 - [!] srcNode 时设置其他属性不起作用，属性通通在 html 标签中指定，并且 html 标签必须包含完整结构，
 例如 content 节点必须存在