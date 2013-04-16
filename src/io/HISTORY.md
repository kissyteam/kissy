# io

# 1.4

 - [!] form 参数代表的 form 节点中如果有 input type='file' 的节点会自动启用 iframe-upload 模式，
 否则收集 form 内 input 数据启用普通 xhr 模式.

 - [!] form 参数用户文件上传时请设置 type:'post'.

 - [!] iframe-upload 模式与 subDomain 模式需配置服务器 CORS 头，例如

        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Origin', 'http://*.taobao.com');
        res.set('Access-Control-Allow-Headers', 'origin, x-requested-with, yiminghe, content-type, accept, *');

 - [!] withCredentials 默认为 true
