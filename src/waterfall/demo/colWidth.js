KISSY.use("waterfall,io,node,stylesheet", function (S, Waterfall, io, Node, Stylesheet) {
    var $ = Node.all;

    var pinStyle = new Stylesheet('#pin');

    var tpl = $('#tpl').html(),
        nextpage = 1,
        waterfall = new Waterfall.Loader({
            colWidth: function () {
                if ($(window).width() < 1024) {
                    pinStyle.set('#ColumnContainer .pin', {
                        width: '103px'
                    });
                    return 150;
                } else {
                    pinStyle.set('#ColumnContainer .pin', {
                        width: '193px'
                    });
                    return 228;
                }
            },
            container: "#ColumnContainer",
            load: function (success, end) {
                $('#loadingPins').show();
                S.io({
                    data: {
                        'method': 'flickr.photos.search',
                        'api_key': '5d93c2e473e39e9307e86d4a01381266',
                        'tags': 'rose',
                        'page': nextpage,
                        'per_page': 20,
                        'format': 'json'
                    },
                    url: 'http://api.flickr.com/services/rest/',
                    dataType: "jsonp",
                    jsonp: "jsoncallback",
                    success: function (d) {
                        // 如果数据错误, 则立即结束
                        if (d.stat !== 'ok') {
                            alert('load data error!');
                            end();
                            return;
                        }
                        // 如果到最后一页了, 也结束加载
                        nextpage = d.photos.page + 1;
                        if (nextpage > d.photos.pages) {
                            end();
                            return;
                        }
                        // 拼装每页数据
                        var items = [];
                        S.each(d.photos.photo, function (item) {
                            item.height = Math.round(Math.random() * (300 - 180) + 180); // fake height
                            items.push(S.substitute(tpl, item));
                        });
                        success(items);
                    },
                    complete: function () {
                        $('#loadingPins').hide();
                    }
                });
            },
            minColCount: 2
            //align:'left' // right, center (default)
        });
    // scrollTo
    $('#BackToTop').on('click', function (e) {
        e.halt();
        e.preventDefault();
        $(window).stop();
        $(window).animate({
            scrollTop: 0
        }, 1, "easeOut");
    });
});
