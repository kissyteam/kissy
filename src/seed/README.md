
kissy seed 的层次结构为：
<pre><code>
    |          web app ...         |
    |------------------------------|
    |    web.js      |             |
    |----------------|             |
    |    lang.js     | loader.js   |
    |    kissy.js    |             |
    |----------------|-------------|
</code></pre>
其左下角的核心框架是 HOST 无关的，可应用于其它脚本引擎。

非常感谢周爱民老师(aimingoo)对 kissy 进行 review 和重构。

----
2010/12 aimingoo:
 - 将 web 层从 kissy.js 和 lang 中分离出来，现在 kissy.js 是环境无关的。
 - kissy.js 不再依赖具体的 window 作为 context env. kissy.js 可以在任意的 host 中初始化。
 - 从 kissy.js 中找到 seed 的概念，即具有 meta 性质的 host 对象。如果 host 没有 meta 性质，则通过 meta.mix() 使其成为核心的 seed。
 - 核心的 kissy.js 是对对象和系统扩展特性的封装，以及对 app/namespace 的概念约定与实现。
 - 从 kissy.js 中去掉私有函数 mix() 声明的原因，是力图使 S.mix() 成为标准用法。

2010/08 yubo:
 - 将 loader 功能独立到 loader.js 中。
 - lang.js 增加 lastIndexOf 和 unique 方法。

2010/07 yubo:
 - 增加 available 和 guid 方法。
 - S.unparam 里的 try catch 让人很难受，但为了顺应国情，决定还是留着。
 - 增加 filter 方法。
 - globalEval 中，直接采用 text 赋值，去掉 appendChild 方式。

2010/04 yubo:
 - 移除掉 weave 方法，鸡肋。
 - param 和 unparam 应该放在什么地方合适？有点纠结，暂放放在 lang.js
 - param 和 unparam 是不完全可逆的。对空值的处理和 cookie 保持一致。

2010/01 yubo:
 - add 方法决定内部代码的基本组织方式（用 module 和 submodule 来组织代码）。
 - ready, available 方法决定外部代码的基本调用方式，提供简单的弱沙箱。
 - mix, merge, augment, extend 方法，决定了类库代码的基本实现方式，充分利用 mixin 特性和 prototype 方式来实现代码。
 - namespace, app 方法，决定子库的实现和代码的整体组织。
 - log, error 方法，简单的调试工具和报错机制。
 - guid 方法，全局辅助方法。
 - 考虑简单够用和 2/8 原则，去掉对 YUI3 沙箱的模拟。（archives/2009 r402）
