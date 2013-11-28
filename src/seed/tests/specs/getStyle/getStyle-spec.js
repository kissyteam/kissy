/**
 * test loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var d = window.location.href.replace(/[^/]*$/, "") + "../specs/";

    describe("getStyle", function () {

        it("should callback after css onload", function () {

            var html = "\
                <div id='special'>\
                33px\
            </div>\
            <div id='special2'>\
            44px\
            </div>";

            $(html).appendTo('body');

            var state = 0;

            expect($('#special').css('height')).not.toBe("330px");

            S.getScript(d + "getStyle/height.css", function () {
                setTimeout(function () {
                    expect($('#special').css('height')).toBe("330px");
                    state++;
                    // breath
                }, 100);

            });

            // cross domain
            var d2 = d.replace(":8888", ":9999");
            S.getScript(d2 + "getStyle/height2.css", function () {
                setTimeout(function () {
                    expect($('#special2').css('height')).toBe("440px");
                    state++;
                    // breath
                }, 100);
            });

            waitsFor(function () {
                return state == 2;
            }, 10000);

            runs(function () {
                $('#special').remove();
                $('#special2').remove();
            });
        });
    });

})(KISSY);

