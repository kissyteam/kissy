
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
### v1.1.6 -> v1.2.0 (2011/06/08)
 - [!] 静态 combo 引用组件代码时注意：组件代码层次减低 switchable/switchable-pkg.js -> switchable.js

 - [*] 借鉴 jquery 1.6,支持 w3c attribute, attr 方法对 checked='checked' 返回 "checked" 否则返回 undefined，增加 prop 方法 ，返回 prop('checked')==true
 - [!] DOM.insertBefore/insertAfter 没有返回值
 - [*] ie: dom opacity bug fix , border-width 数值归一化
 - [!] DOM.create(html),参数为复杂 html 字符串时，需要加上结束标签，例如 <a href='#'></a> 而不是 <a href='#'>
 - [*] DOM.query(selector,context) context 可以为 Array<HTMLElement> HTMLNodeList 以及选择器字符串(限制同第一个参数 selector)
 - [!] DOM.css 取计算值，而不是行内样式值。行内样式可通过 DOM.style 获取
 - [+] 增加 DOM.clone
 - [+] 增加 DOM.style
 - [!] 禁止使用原生 cloneNode ，使用 DOM.clone ，也不要设置自定义属性，使用 DOM.data
 - [*] DOM.remove 会自动清理当前节点以及子孙节点上注册的事件
 - [+] 增加 DOM.inner/outerWidth
 - [x] checkbox/radio append/insert 状态保持
 - [x] html(" <span></span>") 前缀空白保留
  - [+] append/insert 都可以指定是否执行脚本节点的代码

  

 - [+] event 增加作用于 dom 节点的 delegate 方法
 - [+] event 增加作用于 dom 节点的 fire 方法
 - [+] event 支持 submit change 冒泡绑定
 - [*] 自定义事件 listeners 放入对象自身保存，避免内存泄露
 - [+] event 增加 valuechange ,hashchange 事件兼容处理
 - [*] Event.detach = Event.remove
 - [x] 修正 focusin/out 事件触发顺序,子元素先，父元素后
 - [!] 无论是通过 Event.on 还是 S.on("#xx").on，回调 event.target 以及 event.relatedTarget 都为原生节点。
 - [!] 无论是通过 Event.on 还是 S.on("#xx").on，如果不指定 scope 回调函数中 this 都指向原生 dom 节点。
 - [!] 字符串数组支持变化，例如 Event.on(['#xx','#yy'],...) 改写做 Event.on('#xx,#yy',...);



 - [x] ajax 触发 success 或 error 后触发 complete 回调（ if exists ）
 - [x] ajax 无论什么错误，出错后都会触发 error
 - [!] ajax 所有方法都返回模拟 xhr 对象，包含 abort 方法用于中断当前请求等
 - [!] ajax 请求地址的响应头如果设置了 content-type 为 json 或 xml ，回调的第一个参数自动为该格式，不需要手动 parse
 - [+] 增加 S.io.upload 方法，用于无刷新文件上传
 - [+] 增加 form 配置，可直接序列化 form 并发送 ajax 请求
 - [+] 增加 S.io.serialize 方法，用于 form 序列化
 - [+] 支持 cross domain ajax , ie67 使用 flash ，详见 xdr 配置


 - [+] 增加 Node.prototype.stop ，随时停止由 Node.prototype.animate 引起的动画
 - [*] Node 与 NodeList 合一
 - [!] NodeList.prototype.all(selector) 1.1.6为取得第一个元素的子孙中选符合 selector 的节点 , 1.2 改为取得所有元素的子孙符合 selector 的节点（经过去重和根据 DOM 树前序遍历顺序进行排序）


 - [*] anim 提高性能，不重复 touch dom / css
 - [+] anim 重构，支持 scrollLeft ,scrollTop 配置
 - [+] 增加 anim 单元测试
 - [x] bugfix anim 内存泄露
 - [+] anim 支持 window scrollTop/Left 动画

 - [+] base ATTRS 支持 validator 配置，返回 false ，不设置值
 - [+] base set/get 支持 "x.y.z" 子属性设置，要求 x 为原生简单对象 : {y:{z:xx}}


 - [*] Suggest 增加配置项 dataType, 标志数据来源, 支持动态且缓存, 动态但不缓存, 静态数据
 - [x] Suggest fix: IE9 下无法更新数据
 - [x] Suggest fix: chrome 下光标鼠标移动问题

 - [*] switchable 中针对 datalazyload 的配置项 lazyDataType 值变更, 支持1) img 或 img-src, 2) textarea 或 area-data, 这对应于 Datalazyload.loadCustomLazyData 的 type 参数保持一致
 - [*] Accordion 增加 aria 配置
 - [*] Carousel 增加 aria 配置
 - [*] Tabs 增加 aria 配置


 - [*] Overlay 增加 closeAction 配置, destroy or hide
 - [*] Overlay 增加 aria 配置, trap focus and keydown
 - [+] overlay 增加 resize 配置
 - [+] overlay 增加单元测试


 - [*] KISSY.param/unparam 增加数组处理选项
 - [+] KISSY.getScript 支持 css 载入后调用回调
 - [+] KISSY.getScript 支持除了 ie < 9外的 error 立即回调


 - [x] Loader 初步重构，拆分文件
 - [+] loader 支持包配置，各个模块无需配置路径 (http://docs.kissyui.com/docs/html/api/seed/loader/index.html)
 - [+] loader 增加单元测试
 - [*] 所有模块结构根据 loader 重新组织


 - [+] 增加 button 组件

 - [+] 增加 tree 组件

 - [+] 增加 menubutton 组件

 - [+] 增加 menu 组件

 - [+] 增加 waterfall 组件

 - [+] 增加 component 组件基类

 - [+] kissy-tools 增加 module-compiler 工具

 - [+] dd 支持 drop 以及基于委托的 drag&drop
 - [+] dd 增加单元测试
 - [+] dd 增加 portal 示例

 - [*] kissyteam 文档利用 sphinx 重新编写整理

 - [!] calendar 模块 use("calendar") 不会会默认加载基础css，需要的话可以静态引入或者user("calendar,calendar/assets/base.css") 载入


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

