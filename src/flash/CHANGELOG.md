  Update History  
==================

 Legend of version history
----------------------------

 - [+]	this is a new feature
 - [*]	this is an improvement
 - [!]	this is a change
 - [x]	this is a bug fix
 
 
History:
--------
### 1.3 (2010/12/22)
 - [x] 修复 Flash.remove 失效问题.
 - [+] 引入 [Jasmine](http://pivotal.github.com/jasmine/)测试.

### 1.2 (2010/10/26)
 - [*] 重新定义了内部创建 SWF 方法，从对象创建改为创建 String 通过 innerHTML 插入。 之前方法在IE下耗费性能较明显.
 - [*] 双Object 模式更改为 Object - Embed 模式。从而减少一些如Firefox 产生的 swf 二次请求。
 - [+] 增加了callback(config) 回调参数属性 dynamic 便于在后续知道是使用何种方法应用。
 - [!] 从原来的替换容器为当前 swf 元素方法更改为在指定的容器中重新写入 swf 作为其子节点。
 - [!] 如果 add 指定的 target 未找到则会自动创建一个。
 - [!] 如果 add 指定的 target 未找到则会自动创建一个。
 - [+] 增加 S.Flash 自身颁布号 S.Flash.version。
 
### 1.0 (2010/08/10)
 - [x] 修复了sarfari/chrome （webkit）下失效的问题.

### 0.8~0.9 (2010/08/09)
 - [*] 修正了在动态添加_embed() target 指向不正确，造成获取swf不正确问题。（test中也针对这点有了测试）.
 - [!] 修正了在flashvars存在的 双引号隐患。 将所有flashvars中的双引号替换为单引号。但此后所有应用都需要进行过滤.

### 0.7 (2010/08/04)
 - [*] 取消了对内部SWF存储以 "#" 开头。并且修正了会自动替换修改入口在无#时添加其前缀，造成后续应用失效.
 - [!] 取消了 F.swfs 的 length属性和 F.len()属性.
 - [*] 增加了 F.length，以保证 F.swfs 是个纯池.
 - [*] 修正了Flashvars 参数中强制字符串带引号造成传入参数不纯粹的bug.

### 0.6 (2010/07/30)
 - [*] 增加了标准化配置项方法 _normalize(); 修正 flashvars 转 String 方式为 toFlashVars.

### 0.5 (2010/07/29)
 - [*] 重构到 kissy 项目中.

### 0.4 (2010/07/28)
 - [!] 合并了公开方法 Flash.register 和 Flash.embed 为 Flash.add().
 - [!] 修改 Flash.length() 为 Flash.getLength(), 使其看上去更像方法而非属性方式获取.

### 0.3 (2010/07/27)
 - [!] 迁移至 github 做版本管理。向 kissy-sandbox 提交代码

### 0.2 (2010/07/22)
 - [*] 修正了 embed 始终都有 callback 尝试性调用.
 - [*] 避免了未定义 el/id 或 swfurl 时无法获知错误.
 
### Initial Version 0.1 (2010/07/21)
 - [+] 向 KISSY Sandbox的 google code 提交了基础代码 	
