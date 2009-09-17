
使用说明：

在需要监控的页面，添加两段 js：

<title>页面标题</title>
<script type="text/javascript">g_ks_monitor_st=+new Date</script>

...

<script type="text/javascript" src="http://a.tbcdn.cn/kissy/1.0.0/build/monitor/monitor.js?t=20090917.js">
    KISSY.Monitor.init({
        apiUrl: "http://igw.monitor.taobao.com/monitor-gw/receive.do",
        pageId: 1000,
        sampleRate: 10000,
        sections: ["id1", "id2"]
    });
</script>
</body>
