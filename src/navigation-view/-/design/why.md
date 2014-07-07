# 为什么做这个东西
之前大家都有不错的解决方案：

* 妙净，基德: m.etao.com
* 由校: http://10.68.145.26:8002/easy/src/easytouch/demo/
* 拔赤: http://gallery.kissyui.com/app/1.4/guide/index.html

解决各自的业务都没问题，kissy 为什么要做这个东西呢：

1. 这次要将整个淘宝主流程 ipad 单页面化，复杂度可能超过之前大家的业务，代码大小不是问题。
2. 另外大家各自的解决方案和 kissy 关联不大，并没有充分利用 kissy 的基础设施。
3. 大家各自的方案代码粒度较大，目前来看共性较少，统一并不现实，分别维护分散精力，浪费资源，缺乏交流也不利于进一步发展。

最后，这个组件在触屏环境下是一个重要组件，kissy 必须有一个和自身整体架构融合的解决方案，
从而确保 kissy 在这次浪潮中存活下去。

# 做什么

kissy 这次做 navigation-view 专注于（暂定），

* 视图切换，多种视图切换效果

* 视图管理，缓存，销毁，离开，进入接口

* 视图滚动，使用 scroll-view 统一处理视窗滚动

* 历史管理，和原生浏览器历史完全一致

细粒度模块化，预留扩展接口。

不涉及 model，内容获取，业务架构等。

# 大家能做什么

kissy 希望能够得到大家的帮助，贡献代码者均是该组件的作者，永久版权保留。

大家可以提建议，推荐直接提交代码，最终能够方便自己进一步的封装。

# 目标

能够在 ipad 淘宝项目中取得不错的效果，
并且大家也可以在 navigation-view 的基础上进一步封装成满足自己需求的方案。

# refer

代码： [https://github.com/kissyteam/kissy/tree/master/src/navigation-view](https://github.com/kissyteam/kissy/tree/master/src/navigation-view)

demo： [http://dev.kissyui.com/kissy/src/navigation-view/-/demo/navigation-view.html](http://dev.kissyui.com/kissy/src/navigation-view/-/demo/navigation-view.html)