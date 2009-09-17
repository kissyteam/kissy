<textarea style="width: 1024px; height: 600px">
使用说明：

在需要监控的页面，添加两段 js：

<title>页面标题</title>
<script type="text/javascript">g_ks_monitor_st=+new Date</script>

...

<script type="text/javascript" src="http://a.tbcdn.cn/kissy/1.0.0/build/monitor/monitor-min.js?t=20090917.js">
    KISSY.Monitor.init({
        apiUrl: "http://igw.monitor.taobao.com/monitor-gw/receive.do",
        pageId: 1000,
        sampleRate: 10000,
        sections: ["id1", "id2"]
    });
</script>
</body>

目前 pageId 的约定：
    Detail页面1000, 淘宝首页2000, 商场首页3000,店铺首页4000, listing 5000

特别说明：

  1. 第一段 js 紧跟 title 下面

  2. 第二段 js 紧跟 </body> 上面
  
  3. 第二段 js，只有 pageId 是必须传的，比如 店铺首页，代码是：
<script type="text/javascript" src="http://a.tbcdn.cn/kissy/1.0.0/build/monitor/monitor-min.js?t=20090917.js">
    KISSY.Monitor.init({pageId:4000});
</script>
</textarea>