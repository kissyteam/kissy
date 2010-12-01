
感谢周爱民老师(aimingoo)的 code review 和调整建议。

note by aimingoo:
====
1. 将 web 层从 kissy.js 和 lang 中分离出来，现在 kissy.js 是环境无关的；
2. kissy.js 不再依赖具体的 window 作为 context env. kissy.js 可以在任意的 host 中初始化；
3. 从 kissy.js 中找到 seed 的概念，即具有 meta 性质的 host 对象。如果 host 没有 meta 性质，则通过 meta.mix() 使其成为核心的 seed。
4. 核心的 kissy.js 是对对象和系统扩展特性的封装，以及对 app/namespace 的概念约定与实现。
5. 从 kissy.js 中去掉私有函数 mix() 声明的原因，是力图使 S.mix() 成为标准用法。

6. kissy 核心的层次结构为：

|          web app ...         |
|------------------------------|
|    web.js      |             |
|----------------|             |
|    lang.js     | loader.js   |
|    kissy.js    |             |
|----------------|-------------|

其左下角的核心框架是 HOST 无关的，可以应用于其它的脚本引擎。
