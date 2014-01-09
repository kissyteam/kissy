/**
 * sub controller for navigation-view
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');
    var router = require('router');
    var Promise = require('promise');

    function doRoute(request) {
        var self = this;
        var subView = self.getSubView();
        var navigationView = self.get('navigationView');
        var activeView = navigationView.get('activeView');
        if (!subView) {
            subView = new (self.get('SubView'))();
            navigationView.addChild(subView);
            subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
        }
        subView.controller = self;

        this.defer = new Promise.Defer();
        this.promise = this.defer.promise;

        if (!request.replace ||
            // first screen replace
            !activeView) {
            if (activeView) {
                activeView.controller.leave();
            }
            if (navigationView.waitingView) {
                navigationView.waitingView.controller.leave();
            }
        }

        self.enter();

        var route = request.route;
        var routes = self.get('routes');

        if (routes[route.path]) {
            self[routes[route.path]].apply(self, arguments);
        }

        if (!request.replace ||
            // first screen replace
            !activeView) {
            var async = !self.promise.isResolved();
            if (async) {
                subView.reset('title');
            }
            navigationView[request.backward ? 'pop' : 'push'](subView, async);
        }
    }

    return Base.extend({
        router: router,

        initializer: function () {
            var self = this;
            var path;
            self.doRoute = S.bind(doRoute, self);
            var routes = self.get('routes');
            for (path in routes) {
                router.get(path, self.doRoute);
            }
        },

        leave: function () {
        },

        enter: function () {
        },

        getSubView: function () {
            var self = this;
            var navigationView = self.get('navigationView');
            var SubView = self.get('SubView');
            var children = navigationView.get('children');
            for (var i = children.length - 1; i >= 0; i--) {
                if (children[i].constructor === SubView) {
                    return children[i];
                }
            }
            return undefined;
        },

        navigate: function (url, options) {
            router.navigate(url, options);
        },

        'isSubViewActive': function () {
            return this.get('navigationView').get('activeView') === this.getSubView();
        }
    }, {
        ATTRS: {
            routes: {
            },

            SubView: {
            }
        }
    });
});