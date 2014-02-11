(function () {
    var p;
    KISSY.use('example/simplepage/simplepage', function (S, Spage) {
        p = new Spage(S.all('#Hook .item'), 'Page', {
            step:4,
            selected_class:'on'
        });
        if (typeof SSJS == "undefined") {
            p.render({index:Number(window.location.hash.replace('#page=', ''))});
        }
    });
    return p;
})();