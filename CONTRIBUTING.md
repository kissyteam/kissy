# 如何给 KISSY 贡献代码

1. 如何参与讨论
1. 如何汇报 bug
1. 如何提交 patch
1. 浏览器支持列表

## 如何参与讨论

### 论坛

加入 [Google Group](https://groups.google.com/group/kissy-ui)，
可以发帖提出你的疑问以及讨论一些使用问题
如果发现了 bug，请提交到 [github issues](https://github.com/kissyteam/kissy/issues)

### 旺旺群

加入旺旺群 **29676575** 和更多人一起讨论 KISSY ，阿里集团内部人员以及外部贡献者更可加入 **574665692** 来影响 KISSY 的未来发展

### 阿里技术圈

阿里集团内部人员也可加入 [阿里技术圈](http://www.atatech.org/gprofile/348) 来讨论

### 微博

联系新浪微博或者 twitter:  **@kissyteam**

## 如何汇报 bug

### 确认是 KISSY 的 bug

请首先查阅文档 api 以及使用示例，确保自己调用正确

### 禁用浏览器扩展和插件

禁用浏览器扩展和插件后再看是否能够依然出错

### 试用最新版本

老版本的 bug 可能在新版本或者主干版本修复，避免提交已知 bug

### 测试前一版本

在前一个版本上做测试，确定这个 bug 是新引出的，还是一直存在的老 bug

### 最简用例

当出现问题时，请精简出错代码到最简，避免和具体业务相关联，避免其他无关的代码执行


## 如何提交 patch

### 代码规范

patch 代码格式请参考 [KISSY 源码规范](http://docs.kissyui.com/docs/html/tutorials/style-guide/kissy-source-style.html)

### 环境： Node/Ant/Java

KISSY 的开发依赖 nodejs 提供 web 环境，包括静态文件访问以及 ajax 动态请求测试
以及 ant 提供打包工具

所以请确保你配置了以下环境:

- Node.js
- JDK7

将 tools/ant/bin 加入到环境变量 path 中

### 本地 KISSY 开发

fork KISSY 项目 [https://github.com/kissyteam/kissy](https://github.com/kissyteam/kissy)

进入一个目录，例如

    cd /path/my

clone KISSY 到本地

    git clone git@github.com:username/kissy.git

username 为你的 github 用户名

进入新 clone 的 kissy 目录

    cd kissy

添加 KISSY 官方 master

    git remote add remote git://github.com/kissyteam/kissy.git

开始新 patch 前要和官方主干同步

    git pull remote master

安装 node 依赖模块

    npm install

启动 web 环境

    node tools/test/server

现在打开 KISSY 集成测试用例: [http://localhost:8888/kissy/test](http://localhost:8888/kissy/test)

你也可以测试单个模块，例如动画： [http://localhost:8888/kissy/src/anim/tests/runner/test.html](http://localhost:8888/kissy/src/anim/tests/runner/test.html)

可选： build KISSY

    cd src/
    ant build-all

build KISSY 时间很长，需要耐心等待

### 对应于 github issues 提供 patch

**永远不要把 patch 提交到你的主干！**

**一定要使用 issue 分支！**

确保你的主干和官方同步

    git checkout master
    git pull remote master


建立一个新分支，该分支名为 issue_ 加 issue 数字

    git checkout -b issue_###

"###" 为你提交的 issue 号码，现在你已经切换到了 issue_### 分支

在对应模块的 tests/specs 下面添加测试用例

然后根据测试用例对相应模块源码进行修改（TDD）

运行 http://localhost:8888/kissy/src/$module$/tests/runner/test.html -> **all test cases is green and passed.**

$module$ 为你修改的模块名

下面对你修改的代码进行 stage 操作

    git add filename

注意不要使用: **git add .**

一旦你 stage 了你修改的所有文件，运行以下命令提交

    git commit -m "简介. Fixes #xxx"

对于多行注释，只要运行 **git commit** 然后在其后的界面输入多行注释

然后把你的 patch 提交到你的 github

    git push origin -u issue_###

在进行下个 patch 开始前，请切换到 master 分支

    git checkout master

最后到的 github 界面，点击 pull request 即可


**pull request 前清确保代码符合规范并且单元测试通过**

## 浏览器支持列表

 - chrome/firefox/opera/safari 最新版本以及次新版本
 - mobile safari/mobile chrome 最新版本以及次新版本
 - ie6+