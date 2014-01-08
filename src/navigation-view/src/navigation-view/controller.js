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
        if (activeView !== subView || self.needNavigation(request)) {
            if (activeView) {
                activeView.controller.leave();
            }
            if (navigationView.waitingView) {
                navigationView.waitingView.controller.leave();
            }
            self.reload();
            self.go(request);
        }
        var route = request.route;
        var routes = self.get('routes');
        self[routes[route.path]].apply(self, arguments);
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

        needNavigation: function () {
            return true;
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

        reload: function () {
            this.getSubView().reset('title');
            this.defer = new Promise.Defer();
            this.promise = this.defer.promise;
            this.enter();
        },

        navigate: function (url, options) {
            router.navigate(url, options);
        },

        go: function (request) {
            this.get('navigationView')[request.backward ? 'pop' : 'push'](this.getSubView());
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