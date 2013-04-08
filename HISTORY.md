
Update History
===============

Legend of version history:
---------------------------

 - [+]	this is a new feature
 - [*]	this is an improvement
 - [!]	this is a change
 - [x]	this is a bug fix


History:
---------------------------

### v1.3.0 -> v1.4.0

 - [*] kissy-tools 对应工具合并到 tools 目录
 - [!] 模块更新到对应模块文件夹查看

### Happy 3nd Anniversary (2012/10/26)
 - [!] Still Alive

### v1.2.0 -> v1.3.0

#### template
 - [!] 移到 gallery: http://docs.kissyui.com/kissy-gallery/gallery/template/docs/1.0/build/html/index.html
 - 推荐用 xtemplate 模块替代

#### suggest
 - [!] 移到 gallery: http://docs.kissyui.com/kissy-gallery/gallery/suggest/docs/1.0/build/html/index.html
 - 推荐用 combobox 模块替代

#### flash
 - [!] 移到 gallery: http://docs.kissyui.com/kissy-gallery/gallery/flash/docs/1.0/build/html/index.html
 - 推荐用 swf 模块替代

#### structure
 - [*] 调整源码目录结构
 - [!] 删除 kissy-aio

#### seed
 - [+] S.config 增加 combine 配置，支持自动 combo
 - [+] 支持

        <script src='seed|kissy.js' data-config="json"></script>

    data-config parse 为 json 传入 config

 - [!] KISSY.mix 深度 mix 时白名单参数递归作用于子对象
 - [x] KISSY.add(fn) fn 中 this 为模块对象
 - [!] KISSY.add(name,fn); fn 不会立即执行，只有 name 被 use 或 require 时才会执行
 - [*] Support tag for individual module : #110
 - [!] 删除 KISSY.app 方法
 - [+] package 增加 debug 配置，可以对包级别设置 debug
 - [!] 删除 csspath/cssfullpath 配置
 - [+] 内置 gallery 包地址
 - [+] 增加 KISSY.keys， #101
 - [+] 支持 KISSY.config({packages:{},modules:{}}); modules,packages 均可配置时间戳
 - [*] KISSY.ready try catch 达到互不影响的效果
 - [*] S.ready 多次调用间独立，不会因为某个异常导致全部中断
 - [+] 单个包配置增加 ignorePackageNameInUri ，可以在实际模块存储文件路径中省去 package name.

#### promise
 - [+] 增加 promise 模块，支持 Promise 规范

#### uri
 - [+] 增加 uri 模块，方便对 url 结构化操作

#### ua
 - [+] html 标签键入 ua 标志，例如 "ks-ie ke-ie6"
 - [!] 去除国产浏览器探测，用 gallery/ua-extra/1.0/ 替代

#### event
 - [+] Event 模块：on/detach 支持事件分组
 - [+] Event 模块：fireHandler api 增加
 - [x] Event.delegate 重构，fix #76
 - [*] valuechange 透明支持 webkitspeechchange 事件
 - [*] publish 支持空格分隔的多个事件名字符串
 - [+] support touch (swipe/tap/tapHold/pinch/rotate/shake)
 - [!] focus/blur 不可用于 delegate，请使用 focusin/focusout

#### ajax
 - [+] io 调用返回 Promise 类型，可以进行链式操作
 - [+] io 增加 formdata 上传示例
 - [+] io 调用返回的 XhrObject 增加 getNativeXhr 方法，用于取得原生 xhr 对象，对其上的 upload 上传进度进行监听
 - [+] io 增加配置 beforeSend ，可用于发送前监听 nativeXhr 事件，例如 upload progress

#### anim
 - [+] anim 支持 pause/resume

#### dom
 - [x] dom 支持 css("backgroundPosition") in ie
 - [!] DOM.query 支持字符串/节点数组/单个节点，不要是KISSY或原生的NodeList
 - [x] fix #88，去除多余的 tbody
 - [+] DOM 增加 contents/wrap/wrapAll/unwrap/wrapInner
 - [+] DOM 增加 nodeName 方法，返回小写的 nodeName
 - [+] DOM 增加 outerHTML 方法，全浏览器兼容
 - [+] ie 支持 selectionStart/End prop

#### node
 - [x] NodeList.prototype.slice 支持单个负数参数：fix #85
 - [+] NodeList.prototype 增加 nodeName/outerHTML/pause/resume/contents/wrap/wrapAll/unwrap/wrapInner

#### base
 - [*] KISSY.Base : values should not be set if any validator occurs error
 - [+] KISSY.Base.prototype.set opts 增加 error 属性，配置错误回调

#### dd
 - [+] Constrain 方便进行拖放范围限制
 - [+] DD groups 支持拖放分组
 - [!] scroll/proxy/constrain 变为 dd/plugin/(scroll/proxy/constrain) 模块，需要显示动态加载
 - [!] scroll/proxy/constrain api 变为插件 api： new Draggable().plug(new ScrollPlugin())

#### component
 - [!] 删除 uibase 模块，合并 uibase 到 component 模块
 - [+] Component children 可配置带有 xclass 的组件描述 json 对象
 - [+] Component 可配置 listeners，直接绑定事件
 - [+] 组件根节点添加 {prefix}{component}-shown/{prefix}{component}-hidden
 - [+] mask 节点添加 {prefix}{component}-mask-shown/{prefix}{component}-mask-hidden
 - [+] 增加 drag/resize 插件模块： component/plugin/drag(resize)

#### calendar
 - [+] 左莫增强 calendar：新的 ui,增加 destroy 方法

#### overlay
 - [+] popup 增加 toggle(左莫),mouseDelay(乔花) 配置
 - [!] popup 构造器参数和 overlay 一致，第一个参数为 object!
 - [+] Dialog draggable 扩展配置支持 dd proxy 以及 dd scroll.
 - [+] Overlay 增加 maskShared 配置以及 maskNode 属性，可以控制是否共享以及操纵 mask 层.
 - [!] drag/resize api 变更为插件方式 new O({plugins:[new DragPlugin()]})
 - [+] mask 配置增加 closeOnClick

#### menu
 - [*] SubMenu 支持 click 事件
 - [!] autoHideDelay 单位变更为秒
 - [!] 去除 menu/menubutton 的 menuCfg 配置
 - [!] 去除 select 的 selectedItem/selectedIndex 配置
 - [+] 增加 matchElWidth 菜单是否自动和 menubutton 保持宽度一致

#### datalazyload
 - [+] datalazyload 增加 autoDestroy 配置
 - [+] datalazyload 增加 removeElements/addElements/removeCallback 与 destroy 接口
   addElements 可用于将动态产生的内容加入到监控滚动处理中.
 - [+] datalazyload 改进, 缓冲检测 scroll 和 resize, 并只加载显示在当前屏幕中的懒加载元素
 - [+] datalazyload 可以监控 div 容器滚动，以及横轴滚动
 - [+] diff 参数可扩充到四个维度
 - [+] datalazyload 增加 refresh api，重新检测并条件加载懒加载
 - [*] datalazyload addCallback callback 返回 false 时下次仍然检测.

#### switchable
 - [+] switchable 增加 lazyImgAttribute/lazyTextareaClass 解决嵌套 lazyload 问题 #98
 - [+] switchable 增加 pauseOnScroll，只在可视窗口时才滚动
 - [+] switchable 增加 add/remove/destroy
 - [!] switchable _switchView 参数变化，覆盖注意（不推荐覆盖）

#### imagezoom
 - [!] api 调整，请重新查看文档与 demo 页面

#### waterfall
 - [+] waterfall 增加方法 adjustItem/removeItem/start 以及配置 adjustEffect。支持调整时的动画。
 - [+] waterfall item class 支持配置 ks-waterfall-item-fixed-right/left 固定列。

#### tree
 - [!] tree label(css/js)出现处改成 content

#### combobox
 - [+] 增加 combobox(autocomplete) 组件

#### xtemplate
 - [+] 增加 xtemplate 组件，富逻辑模板引擎

#### mvc
 - [+] navigate 第二个参数支持 replaceHistory 配置
 - [+] router callback 增加第三个参数 {path,url}
 - [+] 增加静态方法 hasRoute/removeRoot

#### tabs
 - [+] 增加 tabs

#### stylesheet
 - [+] 增加 stylesheet 操作样式表

#### toolbar
 - [+] 增加 toolbar， button 和 menubutton 的容器

#### split-button
 - [+] 增加 split-button， button 和 menubutton 的组合

#### swf
 - [+] 增加 swf 模块，方便在各个浏览器快速插入 flash 节点.

#### dpl
 - [+] 增加 kissy dpl

#### editor
 - [!] 重构，api 变化
 - [+] 增加 code 插件，处理代码输入

### Happy 2nd Anniversary (2011/10/26)
 - [!] Still Alive

### v1.1.6 -> v1.2.0 (2011/12/12)
 - [+] 详见 http://docs.kissyui.com/docs/html/changelog/1.2.0.html

 - [!] 静态 combo 引用组件代码时注意：组件代码层次减低 switchable/switchable-pkg.js -> switchable.js

 - [*] 借鉴 jquery 1.6,支持 w3c attribute, attr 方法对 checked='checked' 返回 "checked" 否则返回 undefined，增加 prop 方法 ，返回 prop('checked')==true
 - [!] DOM.insertBefore/insertAfter 没有返回值
 - [*] ie: dom opacity bug fix , border-width 数值归一化
 - [!] DOM.create(html),参数为复杂 html 字符串时，需要加上结束标签，例如 <a href='#'></a> 而不是 <a href='#'>
 - [*] DOM.query(selector,context) context 可以为 Array<HTMLElement> HTMLNodeList 以及选择器字符串(限制同第一个参数 selector)
 - [!] DOM.css 取计算值，而不是行内样式值。行内样式可通过 DOM.style 获取
 - [+] 增加 DOM.clone ,DOM.style, DOM.empty
 - [!] 禁止使用原生 cloneNode ，使用 DOM.clone ，也不要设置自定义属性，使用 DOM.data
 - [*] DOM.remove 会自动清理当前节点以及子孙节点上注册的事件
 - [+] 增加 DOM.inner/outerWidth
 - [x] checkbox/radio append/insert 状态保持
 - [x] html(" <span></span>") 前缀空白保留
 - [!] html()参数中的脚本会在调用后立即执行，请避免在脚本内部引用尚没添加到dom的根节点：

        DOM.html(DOM.create("<div>"),"<div id='t'><script>alert(document.getElementById('t'));</script></div>",true);

 - [+] append/insert 都可以指定是否执行脚本节点的代码



 - [+] event 增加作用于 dom 节点的 delegate 方法
 - [+] event 增加作用于 dom 节点的 fire 方法
 - [+] event 支持 submit change 冒泡绑定
 - [*] 自定义事件 listeners 放入对象自身保存，避免内存泄露
 - [+] event 增加 valuechange ,hashchange 事件兼容处理
 - [*] Event.detach = Event.remove
 - [x] 修正 focusin/out 事件触发顺序,子元素先，父元素后
 - [!] 无论是通过 Event.on 还是 S.one("#xx").on，回调 event.target 以及 event.relatedTarget 都为原生节点。
 - [!] 无论是通过 Event.on 还是 S.one("#xx").on，如果不指定 scope 回调函数中 this 都指向原生 dom 节点。
 - [!] 字符串数组支持变化，例如 Event.on(['#xx','#yy'],...) 改写做 Event.on('#xx,#yy',...);
 - [+] 自定义事件增加冒泡支持，参见 publish api
 - [+] 兼容 mousewheel 事件：http://docs.kissyui.com/docs/html/api/core/event/mousewheel.html


 - [x] ajax 触发 success 或 error 后触发 complete 回调（ if exists ）
 - [x] ajax 无论什么错误，出错后都会触发 error
 - [!] ajax 所有方法都返回模拟 xhr 对象，包含 abort 方法用于中断当前请求等
 - [!] ajax 请求地址的响应头如果设置了 content-type 为 json 或 xml ，回调的第一个参数自动为该格式，不需要手动 parse
 - [+] 增加 S.io.upload 方法，用于无刷新文件上传
 - [+] 增加 form 配置，可直接序列化 form 并发送 ajax 请求
 - [+] 增加 S.io.serialize 方法，用于 form 序列化
 - [+] 支持 cross domain ajax , ie67 使用 flash ，详见 xdr 配置
 - [+] 支持 sub domain ajax ，利用代理页，详见 xdr 配置


 - [+] 增加 Node.prototype.stop ，随时停止由 Node.prototype.animate 引起的动画
 - [*] Node 与 NodeList 合一
 - [!] NodeList.prototype.all(selector) 1.1.6为取得第一个元素的子孙中选符合 selector 的节点 , 1.2 改为取得所有元素的子孙符合 selector 的节点（经过去重和根据 DOM 树前序遍历顺序进行排序）
 - [+] 增加 slideToggle/fadeToggle

 - [*] anim 完全重写，提高性能，不重复 touch dom / css
 - [+] anim 支持 scrollLeft,scrollTop （包括 window）
 - [+] 增加 anim 单元测试
 - [+] 增加队列 (queue) 配置
 - [!] 同一个元素的动画默认进入内置队列进行排队

 - [+] base ATTRS 支持 validator 配置，返回 false ，不设置值
 - [+] base set/get 支持 "x.y.z" 子属性设置，要求 x 为原生简单对象 : {y:{z:xx}}
 - [+] base set 返回 boolean，代表属性值是否验证成功

 - [+] dd 支持 drop 以及基于委托的 drag&drop
 - [+] dd 增加单元测试
 - [+] draggable 增加 move 配置
 - [*] 改进 draggable，提高拖时的响应速度

 - [*] Suggest 增加配置项 dataType, 标志数据来源, 支持动态且缓存, 动态但不缓存, 静态数据
 - [x] Suggest fix: IE9 下无法更新数据
 - [x] Suggest fix: chrome 下光标鼠标移动问题

 - [*] Switchable 中针对 datalazyload 的配置项 lazyDataType 值变更, 支持1) img 或 img-src, 2) textarea 或 area-data, 这对应于 Datalazyload.loadCustomLazyData 的 type 参数保持一致
 - [*] Accordion 增加 aria 配置
 - [*] Carousel 增加 aria 配置
 - [*] Tabs 增加 aria 配置
 - [+] Switchable 增加参数 pauseOnScroll，当轮播不在 viewport 时是否自动停止播放
 - [+] Switchable 支持触屏设备,增加配置项 mouseAsTouch ，是否用鼠标模拟 touch


 - [*] Overlay 增加 closeAction 配置, destroy or hide
 - [*] Overlay 增加 aria 配置, trap focus and keydown
 - [+] overlay 增加 resize 配置
 - [+] overlay 增加单元测试
 - [!] Overlay srcNode 和 content 不能同时配置，同时配置时 content 不生效


 - [*] KISSY.param/unparam 增加数组处理选项
 - [+] KISSY.getScript 支持 css 载入后调用回调
 - [+] KISSY.getScript 支持除了 ie < 9外的 error 立即回调
 - [+] 增加 KISSY.throttle/buffer/stamp/every/some/filter/map/bind/escapeHTML/unEscapeHTML/startsWidth/endsWidth


 - [x] Loader 初步重构，拆分文件
 - [+] loader 支持包配置，各个模块无需配置路径 (http://docs.kissyui.com/docs/html/api/seed/loader/index.html)
 - [+] loader 增加单元测试
 - [*] 所有模块结构根据 loader 重新组织

 - [x] 修复 datalazyload addCallback 元素本事可见时不触发回调的 bug

 - [+] 增加 button 组件

 - [+] 增加 tree 组件

 - [+] 增加 menubutton 组件

 - [+] 增加 menu 组件

 - [+] 增加 waterfall 组件

 - [+] 增加 mvc 框架
 - [+] mvc 支持 hash 导航以及 html5 history api

 - [+] 增加 component 组件基类

 - [+] kissy-tools 增加 module-compiler 工具

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

