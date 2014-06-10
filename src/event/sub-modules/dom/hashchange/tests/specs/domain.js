/**
 * domain spec for event
 * @author yiminghe@gmail.com
 */

var Dom = require('dom');
var UA = require('ua');
var Event = require('event/dom');
/*jshint quotmark:false*/
describe("domain in event", function () {
    it("hashchange should consider domain", function () {

        if (UA.ie === 6) {
            return;
        }

        window.location.hash = '';
        document.domain = location.hostname;

        // document.domain does not contain port
        Dom.isCustomDomain = function () {
            return true;
        };

        var hash = "#ok",
            current = -1;

        Event.on(window, "hashchange", function () {
            current = window.location.hash;
        });

        waits(500);

        runs(function () {
            window.location.hash = hash;
        });

        waits(500);

        runs(function () {
            expect(current).toBe(hash);
        });
    });
});