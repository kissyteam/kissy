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

        this.getSubView().reset('title');
        this.defer = new Promise.Defer();
        this.promise = this.defer.promise;
        self.enter();

        var route = request.route;
        var routes = self.get('routes');

        if (routes[route.path]) {
            self[routes[route.path]].apply(self, arguments);
        }

        if (!request.replace ||
            // first screen replace
            !activeView) {
            if (activeView) {
                activeView.controller.leave();
            }
            if (navigationView.waitingView) {
                navigationView.waitingView.controller.leave();
            }

            self.switchView(request, !self.promise.isResolved());
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

        switchView: function (request, async) {
            this.get('navigationView')[request.backward ? 'pop' : 'push'](this.getSubView(), async);
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