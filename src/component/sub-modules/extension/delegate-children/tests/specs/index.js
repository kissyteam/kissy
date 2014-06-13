var Container = require('component/container');
var Control = require('component/control');
var DelegateChildrenExtension = require('component/extension/delegate-children');
var Feature = require('feature');
var UA = require('ua');

/*jshint quotmark:false*/
function invalidNode(n) {
    return n == null || n.nodeType === 11;
}

describe("delegate children works", function () {
    var MyContainer = Container.extend([DelegateChildrenExtension], {}, {
        xclass: 'MyContainer'
    });

    it("should attach its methods", function () {
        var c = new MyContainer({
            content: "xx"
        });
        c.render();
        expect(c.getOwnerControl).not.toBeUndefined();
        expect(c.get('el')[0].parentNode).toBe(document.body);
        expect(c.get('el').html()).toBe("xx");
        c.destroy();
        expect(invalidNode(c.get('el')[0].parentNode)).toBe(true);
    });

    if (Feature.isTouchEventSupported()) {

    } else {
        it("should delegate events", function () {
            var c = new MyContainer({
                content: "xx"
            });

            var child1 = new Control({
                content: "yy",
                handleGestureEvents: false,
                focusable: false
            });

            c.addChild(child1);

            var child2 = new Control({
                content: "yy",
                handleGestureEvents: false,
                focusable: false
            });

            c.addChild(child2);
            c.render();

            // ie11 bug
            if (UA.ieMode === 11) {
                return;
            }

            waits(100);
            runs(function () {
                jasmine.simulate(c.get('el')[0], 'mousedown');
            });
            waits(100);
            runs(function () {
                expect(c.get('active')).toBe(true);
            });
            runs(function () {
                jasmine.simulate(c.get('el')[0], "mouseup");
            });
            waits(100);
            runs(function () {
                expect(c.get('active')).toBe(false);
            });

            runs(function () {
                jasmine.simulate(child1.get('el')[0], 'mousedown');
            });
            waits(100);
            runs(function () {
                // do not stop bubble
                expect(c.get('active')).toBe(true);
                expect(child1.get('active')).toBe(true);
                expect(child2.get('active')).toBeFalsy();
            });
            runs(function () {
                jasmine.simulate(child1.get('el')[0], "mouseup");
            });

            waits(100);

            runs(function () {
                expect(c.get('active')).toBeFalsy();
                expect(child1.get('active')).toBeFalsy();
                expect(child2.get('active')).toBeFalsy();
            });

            runs(function () {
                c.destroy();
                expect(invalidNode(child1.get('el')[0].parentNode)).toBe(true);
            });
        });
    }
});