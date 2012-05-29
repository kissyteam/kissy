/**
 * custom bubble mechanism tc
 * @author yiminghe@gmail.com *
 */
KISSY.use("event", function(S, Event) {


    describe("custom event is same as native event.", function() {

        it("can fire more than one", function() {

            var args = [];

            function Test() {
                this.on("test", function(e) {
                    args.push(e.a);
                });
                this.on("test2", function(e) {
                    args.push(e.a);
                });
            }

            S.augment(Test, Event.Target);

            var t = new Test();

            t.fire("test test2", {
                a:1
            });

            expect(args).toEqual([1,1]);

        });


        it("can bubble", function() {

            var ret = [],args = [];

            function Test() {
                this.publish("test", {
                    bubbles:1
                });

                this.on("test", function(e) {
                    ret.push(this.id);
                    args.push(e.a);
                    e.a++;
                });
            }

            S.augment(Test, Event.Target);

            var t = new Test();

            t.id = 1;


            var t2 = new Test();

            t2.id = 2;

            t2.addTarget(t);

            t2.fire("test", {
                a:1
            });

            expect(ret).toEqual([2,1]);
            expect(args).toEqual([1,2]);

            ret = [];
            args = [];

            t2.removeTarget(t);

            t2.fire("test", {
                a:1
            });

            expect(ret).toEqual([2]);
            expect(args).toEqual([1]);

        });


        it("can stop bubble by stopPropagation()", function() {
            var ret = [];

            function Test() {
                this.publish("test", {
                    bubbles:1
                });

                this.on("test", function(e) {
                    ret.push(this.id);
                    e.stopPropagation();
                });
            }

            S.augment(Test, Event.Target);

            var t = new Test();

            t.id = 1;


            var t2 = new Test();

            t2.id = 2;

            t2.addTarget(t);

            t2.fire("test");

            expect(ret).toEqual([2]);
        });
    });

});