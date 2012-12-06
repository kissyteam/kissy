KISSY.use("waterfall,ajax,node", function (S, Waterfall, io,  Node) {
    var $ = Node.all;

    var tpl = $('#tpl').html(),
        nextPage = 1,
        waterfall = new Waterfall.Loader({
            container:"#ColumnContainer",
            load:function (success, end) {
                $('#loadingPins').show();
                S.ajax({
                    data:{
                        'method':'flickr.photos.search',
                        'api_key':'5d93c2e473e39e9307e86d4a01381266',
                        'tags':'rose',
                        'page':nextPage,
                        'per_page':20,
                        'format':'json'
                    },
                    url:'http://api.flickr.com/services/rest/',
                    dataType:"jsonp",
                    jsonp:"jsoncallback",
                    success:function (d) {
                        // 如果数据错误, 则立即结束
                        if (d.stat !== 'ok') {
                            alert('load data error!');
                            end();
                            return;
                        }
                        var photos=d.photos;
                        // 如果到最后一页了, 也结束加载
                        nextPage = photos.page + 1;
                        if (nextPage > photos.pages) {
                            end();
                            return;
                        }
                        // 拼装每页数据
                        var items = [];
                        S.each(photos.photo, function (item) {
                            item.height = Math.round(Math.random() * (300 - 180) + 180); // fake height
                            items.push(S.substitute(tpl,item));
                        });

                        var right = new S.Node('<div class="pin ks-waterfall ks-waterfall-fixed-right">' +
                            '<div style="height: 100px">' +
                            S.guid('always right') +
                            '</div>' +
                            '</div>');
                        items.push(right);

                        var left = new S.Node('<div class="pin ks-waterfall ks-waterfall-fixed-left">' +
                            '<div style="height: 100px">' +
                            S.guid('always left') +
                            '</div>' +
                            '</div>');
                        items.push(left);
                        success(items);
                    },
                    complete:function () {
                        $('#loadingPins').hide();
                    }
                });
            },
            minColCount:2,
            colWidth:228
        });
    // scrollTo
    $('#BackToTop').on('click', function (e) {
        e.halt();
        e.preventDefault();
        $(window).stop();
        $(window).animate({
            scrollTop:0
        }, 1, "easeOut");
    });
});
