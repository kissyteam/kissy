/**
 * uibase tc
 * @author yiminghe@gmaill.com
 */
KISSY.use("uibase", function(S, UIBase) {

    describe('uibase', function() {
        it(" will works as multi-inheritance", function() {

            var x = 0,y = 0,z = 0;

            function h1() {

            }

            h1.prototype.xx = function() {
                x = 1;
            };

            function h2() {

            }

            h2.prototype.yy = function() {
                y = 1;
            };


            var h3 = UIBase.create(h2, [h1], {
                zz:function() {
                    z = 1;
                }
            });


            var h = new h3();

            h.xx();
            h.yy();
            h.zz();

            expect(x).toBe(1);
            expect(y).toBe(1);
            expect(z).toBe(1);

        });
    });

});
