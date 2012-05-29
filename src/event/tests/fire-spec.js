/**
 * @fileOverview tc about fire function
 * @author  yiminghe@gmail.com
 */
KISSY.use("dom,event,ua", function(S, DOM, Event, UA) {
    var FIRST = '1',
        SECOND = '2',
        SEP = '-';

    describe("fire", function() {


        it('should support custom event target.', function() {

            var SPEED = '70 km/h', NAME = 'Lady Gogo', dog;

            function Dog(name) {
                this.name = name;
            }

            S.augment(Dog, Event.Target, {
                    run: function() {
                        return this.fire('running', {speed: SPEED});
                    }
                });

            dog = new Dog(NAME);

            dog.on('running', function(ev) {
                result.push(this.name);
                result.push(ev.speed);
                return this.name;
            });

            function rfalse() {
                result.push(FIRST);
                return false;
            }

            dog.on('running', rfalse);

            function f() {
                result.push(SECOND);
                return  SECOND;
            }

            dog.on('running', f);

            // let dog run
            result = [];

            //有一个为 false 就是 false
            expect(dog.run()).toBe(false);
            waits(0);
            runs(function() {
                expect(result.join(SEP)).toEqual([NAME, SPEED, FIRST, SECOND].join(SEP));
            });

            // test detach
            runs(function() {
                result = [];
                dog.detach('running', rfalse);

                // 没有 false，就取最后的值
                expect(dog.run()).toBe(SECOND);
                waits(0);
                runs(function() {
                    expect(result.join(SEP)).toEqual([NAME, SPEED, SECOND].join(SEP));
                });
            });
        });


        it("works for mouseenter/leave", function() {

            var n = DOM.create("<div/>"),ret;
            Event.on(n, "mouseenter", function() {
                ret = 1
            });
            Event.fire(n, "mouseenter", {
                    relatedTarget:document
                });

            expect(ret).toBe(1);

            Event.detach(n);

        });


    });

});