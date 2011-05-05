
Update History
===============

Legend of version history:
---------------------------

 - [+]	this is a new feature
 - [*]	this is an improvement
 - [!]	this is a change
 - [x]	this is a bug fix


History:
--------
### v1.1.6 -> v1.2.0 (2011/4/14)
 - [x] KISSY.param/unparam 数组处理改变
 - [+] KISSY.getScript 支持 css 载入后调用回调
 - [+] KISSY.getScript 支持除了ie<9外的 error 立即回调
 - [x] KISSY Loader 初步重构，拆分文件
 - [x] bugfix anim 内存泄露
 - [+] anim 支持 scrollLeft ,scrollTop 配置
 - [+] 增加 anim 单元测试
 - [+] loader 支持包配置，各个模块无需配置路径 (http://docs.kissyui.com/docs/html/seed/loader/index.html)
 - [+] loader 增加单元测试
 - [+] overlay 增加 resize 配置
 - [+] 增加 button 组件
 - [+] 增加 menubutton 组件
 - [+] 增加 menu 组件
 - [+] kissy-tools 增加 module-compiler 工具
 - [+] dd 支持 drop 以及基于委托的 drag&drop

### v1.1.5 -> v1.1.6 (2010/11/30)

 - [!] KISSY.Event.on 第一个参数只支持单个原生 dom 节点或原生 dom 节点数组以及选择器字符串
 - [!] calendar 模块，S.use('calendar', fn) 需要写成 S.use('calendar+css', fn), 否则不会自动加载样式
 - [*] loader 中，对内置模块无需配置，采用约定，去除 mods.js
 - [*] S.clone 增加防循环引用
 - [+] kissy-tools 增加 idebug
 - [+] 增加 jasminelite 和 event-simulate for jasmine
 - [!] event 中对 return false, 仅 preventDefault + stopPropagation, 不再 stopImmediatePropagation
 - [+] cssreset 加入对 HTML5 的支持
 - [+] 增加 ajax 模块 [文档](http://kissyteam.github.com/kissy/docs/ajax/index.html)
 - [!] 将 S.one/all(selector).on(type, function(ev) { ev.target/currentTarget 由原来的 DOM 裸节点变成对应 Node })
 - [!] 将 S.all(selector).on(type, function() { this 由 NodeList 变成对应 Node })
 - [+] Node 增加 append/appendTo/prepend/prependTo
 - [+] 引入 Jasmine [Understanding JavaScript Testing](http://kissyui.com/blog/2010/10/understanding-javascript-testing/)
 - [+] imagezoom 增加 Zazzle 内部放大效果 [demo](http://kissyteam.github.com/kissy/src/imagezoom/demo-inner.html)
 - [*] anim 增加原生 CSS3 Transitions 支持 [原理](http://lifesinger.org/blog/2010/09/anim-using-css3-transitions/)
 - [+] 开发规范整理 [link](http://kissyteam.github.com/docs/html/styleguide/)
 - [*] 开发流程整理 [link](http://kissyteam.github.com/docs/html/workflow/)
 - [+] 社区建设 [Blog](http://kissyui.com/blog/)
 - [*] 正则优化 [小结](http://lifesinger.org/blog/2010/09/regular-expression-improvement-for-kissy/)
 - [*] README / CHANGELOG 细节改进
 - [x] 已知 bugs 的修复和大量细节改进
 - [+] 增加 uibase
 - [!] Overlay 基于 uibase 进行重构, 接口不兼容


### v1.1.0 -> v1.1.5 (2010/09/19)

 - [+] 从 core 中分拆出 seed, 增加 loader 功能
 - [+] 增加 Overlay / ImageZoom / Calendar 组件
 - [+] 增加 dom-data 模块
 - [+] 增加 DOM.show/hide/toggle 三个方法
 - [+] 增加 Node 的 show/slideUp/FadeIn 等动画方法
 - [+] 加入 kissy-editor 子品牌
 - [+] 增加 Getting Started with KISSY 文档
 - [+] 从 core 中分拆出 ua 模块，增加 shell 和 core 属性
 - [+] kissy-ajbridge 完成基础构建
 - [*] DOM.create 方法对 props 参数的增强
 - [*] 重构 Suggest 组件，增加更多配置参数
 - [*] 在 IE9 beta 中的测试
 - [*] 重构 flash 模块，功能更完善强大
 - [*] kissy docs 的整理和完善
 - [*] 升级 kissy-tools 中的第三方工具到最新稳定版
 - [!] S.Ajax.getScript 变更到 S.getScript
 - [x] 已知 bugs 的修复


### v1.0.0 -> v1.1.0 (2010/08/03)

 - [+] 完成编辑器到前端类库的转换，脱离对 YUI2 的依赖
 - [+] 完成 core/utils/css 三大部分
 - [+] Switchable /Suggest 组件的正式化
 - [+] 增加 kissy-ajbridge 子品牌
 - [+] 增加 kissy-tools 子项目


### Initial Version 1.0.0 (2009/10/26)

 - [+] KISSY 从一片黑色的土壤中，伸出一叶嫩绿的芽: KISSY Editor ^o^

