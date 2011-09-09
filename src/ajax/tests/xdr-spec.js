/**
 * test cases for cross domain ajax
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,json,ajax,node", function(S, UA, JSON, io, Node) {
    describe("xdr", function() {

        it("should works", function() {
            var v1,v2;
            io({
                headers:{
                    // cross domain 设置 header ie 无效
                    // yiminghe:1
                },
                dataType:'json',
                url:'http://yiminghe.daily.taobao.net/' +
                    'kissy_git/kissy/src/ajax/tests/xdr/xdr.php',
                xhrFields:{
                    // Cannot use wildcard in Access-Control-Allow-Origin
                    // when credentials flag is true.
                    //withCredentials:true
                },
                data:{
                    action:"x"
                },
                success:function(d, s, r) {
                    v1 = d.x;
                }
            });


            waitsFor(function() {
                return v1 === 1;
            }, 5000, "xdr should return!");


            runs(function() {
                io({
                    headers:{
                        // cross domain 设置 header ie 无效
                        // yiminghe:1
                    },
                    dataType:'json',
                    url:'http://yiminghe.daily.taobao.net/' +
                        'kissy_git/kissy/src/ajax/tests/xdr/xdr.php',
                    xhrFields:{
                        // Cannot use wildcard in Access-Control-Allow-Origin
                        // when credentials flag is true.
                        // withCredentials:true
                    },
                    data:{
                        action:"y"
                    },
                    success:function(d, s, r) {
                        v2 = d.y;
                    }
                });
            });


            waitsFor(function() {
                return v2 === 1;
            }, 5000, "xdr should return!");


        });

    });
});