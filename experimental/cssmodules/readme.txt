==CSS Modules==


===参考===

 * 淘宝DPL：

 * 拍拍：http://www.paipai.com/
   class使用短命名+tag，高度定制化，圆角无额外标签（包括tab），使用定宽背景图实现  

 * 百度知道：http://zhidao.baidu.com/
   同类模块结构和class一样，同类模块最外层标签再使用一个额外的class区分，使用短命名，布局有专门的结构承担，模块本身不会设置浮动，所以圆角实现方案比较简单

 * yahoo：http://www.yahoo.com/
   重要模块使用id设置样式，同时存在大量id既不用于css可能也不用于js，圆角处理方式和cssmodule之前讨论的方式类似，class长短命名混用，css文件combo生成

 * ebay：http://www.ebay.com/
   不具太多参考性

 * googleCode：http://code.google.com/
   模块种类少，结构简单，完全不考虑圆角，页面级一定不会重复的重要功能模块使用id设置样式，其他一概使用class设置样式，可嵌套其他模块的容器类模块class使用带命名空间前缀的长命名，非容器类使用短命名+tag


===设计目标===
 
 * 结构通用
 * 方便组合
 * 可扩展
 * 灵活换肤


===设计思路===
   
   以box为例：

	<!-- box START -->
        <div class="ks-box ks-box-default">
            <u class="ks-box-top"><s></s><b></b></u>
            <div class="ks-box-hd">
                <h3 class="ks-box-title">box</h3>
                <p class="ks-box-act">
                    <a href="#">more</a>
                </p>
            </div>
            <div class="ks-box-bd">
                your code here
            </div>
            <u class="ks-box-bottom"><s></s><b></b></u>
        </div>
        <!-- box END -->

 * 结构尽量简单，多考虑语义化，不考虑太多特殊样式需求

 * 同一种类型的组件，总结一套通用的html结构

 * class使用长命名：ks-box,ks-box-hd

 * 原则上，样式不占用id

 * 如果是比较明确的使用环境
    - ks-box承载默认样式
    - 如果想使用其他样式，在最外层tag上添加class如：ks-box-itaobao，覆盖默认样式

 * 如果使用环境不明确：
    - ks-box不承载任何样式，只表明模块类型和结构
    - 如果要为模块添加样式，默认的样式class为:ks-box-default，如想换肤则替换ks-box-default为ks-box-itaobao

 * 样式实现上，不一定在所有浏览器上实现统一效果，如阴影

 * cssmodules完成后，建议kissy组件默认配置中class相关部分均改为跟cssmodules一致


===模块整理===

 * 容器类
      box | tabs | accordions | overlay

 * 复杂组件类
      message | form | combobox | grid | tree |  calendar  

 * 简单组件类
      menus | scrumbs | flowsteps | button | bar | list 

===目录结构===

   cssmodules
      +--index.html
      +--box.html
      +--box.css
      +--img
      +--...

===注意事项===
 
 * 同类模块嵌套，使用不同风格时，可能会受css定义顺序等优先级影响
