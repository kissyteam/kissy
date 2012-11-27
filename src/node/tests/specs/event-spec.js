/**
 * event attached for node
 * @author gonghao, yiminghe@gmail.com
 */
KISSY.use("node", function(S, Node) {
    var $ = Node.all;
// simulate mouse event on any element
    var simulate = function(target, type, relatedTarget) {
        if (typeof target === 'string') {
            target = $(target)[0];
        }
        jasmine.simulate(target, type, { relatedTarget: relatedTarget });
    };

    describe("node-event", function() {

        it('should set this properly', function() {
            var ret;

            // Node
            runs(function() {

                Node.one('#link-test-this').on('click', function() {
                    ret = this;
                });
                simulate('#link-test-this', 'click');
            });
            waits(0);

            runs(function() {
                expect(ret.nodeType).not.toBe(undefined);
            });


            // NodeList
            runs(function() {
                $('#link-test-this-all span').on('click', function() {
                    ret = Node.one(this);
                });
                simulate('#link-test-this-all-span', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.text()).toBe('link for test this');
            });

            // DOM Element
            runs(function() {
                $('#link-test-this-dom').on('click', function() {
                    ret = $(this);
                });
                simulate('#link-test-this-dom', 'click');
            });
            waits(0);
            runs(function() {
                expect(ret.prop('nodeType')).toBe(1);
            });
        });


        it('should detach properly', function() {
            var ret;

            // Node
            runs(function() {
                var node = Node.one('#link-detach');

                function t() {
                    ret = 1;
                }

                node.on('click', t);

                Node.one('#link-detach').detach('click', t);

                simulate('#link-detach', 'click');
            });
            waits(10);
            runs(function() {
                expect(ret).toBeUndefined();
            });
        });
    });
});