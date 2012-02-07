KISSY - An Enjoyable JavaScript Library
=======================================

 * Source: <http://github.com/kissyteam/kissy>
 * Docs: <http://kissyteam.github.com/>
 * Changelog: <http://github.com/kissyteam/kissy/blob/master/CHANGELOG.md>
 * License: <http://github.com/kissyteam/kissy/blob/master/LICENSE.md>


 Vision
--------
小巧灵活，简洁实用，使用起来让人感觉愉悦。

    Keep It
        Simple & Stupid, Short & Sweet, Slim & Sexy...
    Yeah!


 Structure
-----------
 - build:         构建好的发布文件
 - docs:          API 文档
 - src:           源码、测试等开发资源
 - tools:         打包压缩等自动化工具


 Convention
------------
原则：尽量避免潜在冲突，同时力求精简短小和见名知意。

 - 全局变量：       g_ks_comp_xxx        比如：g_ks_suggest_callback
 - class/id 命名： ks-comp[-xxx]        比如：ks-editor-toolbar-item
 - data 属性命名：  data-ks-comp[-xxx]   比如：data-ks-suggest
 - hook 规范：     KS_Comp              比如：KS_Switchable

注意：为了避免太冗长，在保持清晰和无潜在冲突的情况下，可以打破原则，比如：
    <div class="KS_Widget" data-widget-type="Tabs" data-widget-config="{...}">


Questions?
----------
 - Docs: <http://docs.kissyui.com>
 - Bug：<http://github.com/kissyteam/kissy/issues>
 - 邮件：<kissyteam@gmail.com>
 - Twitter: <http://twitter.com/#!/kissyteam>
 - Google Group: <http://groups.google.com/group/kissy-ui>

