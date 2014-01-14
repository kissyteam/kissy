/**
 * navigation view to accommodate multiple views
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node').all;
    var Container = require('component/container');
    var Bar = require('navigation-view/bar');
    var ContentTpl = require('component/extension/content-xtpl');
    var ContentRender = require('component/extension/content-render');
    var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' +
        '<div class="{prefixCls}navigation-view-loading-outer">' +
        '<div class="{prefixCls}navigation-view-loading-inner"></div>' +
        '</div>' +
        '</div>';

    var uuid = 0;

    var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
        renderUI: function () {
            var loadingEl = $(S.substitute(LOADING_HTML, {
                prefixCls: this.control.get('prefixCls')
            }));
            this.control.get('contentEl').append(loadingEl);
            this.control.loadingEl = loadingEl;
        }
    });

    function onBack(e) {
        if (e.target === this.get('bar')) {
            this.pop();
        }
    }

    function getViewInstance(navigationView, config) {
        var children = navigationView.get('children');
        var viewId = config.viewId;
        for (var i = 0; i < children.length; i++) {
            if (children[i].constructor.xclass === config.xclass) {
                if (viewId) {
                    if (children[i].get('viewId') === viewId) {
                        return children[i];
                    }
                } else {
                    return children[i];
                }
            }
        }
        return null;
    }

    function gc(navigationView) {
        var children = navigationView.get('children').concat();
        var viewCacheSize = navigationView.get('viewCacheSize');
        if (children.length <= viewCacheSize) {
            return;
        }
        var removedSize = Math.floor(viewCacheSize / 3);
        children.sort(function (a, b) {
            return a.uuid - b.uuid;
        });
        for (var i = 0; i < removedSize; i++) {
            navigationView.removeChild(children[i]);
        }
    }

    return Container.extend({
        initializer: function () {
            this.publish('back', {
                defaultFn: onBack,
                defaultTargetOnly: false
            });
        },

        isLoading: function () {
            return this.loadingEl.css('display') !== 'none';
        },

        renderUI: function () {
            this.viewStack = [];
            var bar;
            var barCfg = this.get('barCfg');
            barCfg.elBefore = this.get('el')[0].firstChild;
            this.setInternal('bar', bar = new Bar(barCfg).render());
            bar.addTarget(this);
        },

        /**
         * get inner view instance for specified view class.
         * @param [config]
         * @returns {KISSY.Component.Control}
         */
        createView: function (config) {
            var self = this;
            var nextView = getViewInstance(self, config);
            if (!nextView) {
                nextView = self.addChild(config);
                nextView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
            }
            return nextView;
        },

        push: function (config) {
            var self = this,
                nextView,
                viewStack = self.viewStack;
            var bar = self.get('bar');
            nextView = self.createView(config);
            var nextViewEl = nextView.get('el');
            nextView.uuid = uuid++;
            var activeView = self.get('activeView');
            var loadingEl = this.loadingEl;
            viewStack.push(config);
            if (activeView && activeView.leave) {
                activeView.leave();
            }
            if (config) {
                nextView.set(config);
            }
            if (nextView.enter) {
                nextView.enter();
            }
            var promise = nextView.promise;
            if (!self.isLoading()) {
                var activeEl = activeView.get('el');
                activeEl.stop(true);
                activeEl.animate({
                    transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'
                }, {
                    useTransition: true,
                    easing: 'ease-in-out',
                    duration: 0.25
                });
                if (promise) {
                    loadingEl.stop(true);
                    loadingEl.css('left', '100%');
                    loadingEl.show();
                    loadingEl.animate({
                        left: '0'
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    self.set('activeView', null);
                } else {
                    gc(self);
                    nextViewEl.stop(true);
                    nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
                    nextViewEl.animate({
                        transform: ''
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    self.set('activeView', nextView);
                }
                bar.forward(nextView.get('title') || '');
            } else {
                bar.set('title', nextView.get('title'));
                if (!promise) {
                    gc(self);
                    nextView.get('el').css('transform', '');
                    loadingEl.hide();
                }
            }
            self.set('activeView', nextView);
            if (promise) {
                promise.then(function () {
                    var activeView = self.get('activeView');
                    if (activeView && activeView.uuid === nextView.uuid) {
                        gc(self);
                        nextView.get('el').css('transform', '');
                        bar.set('title', nextView.get('title') || '');
                        loadingEl.hide();
                    }
                });
            }
        },

        replace: function (config) {
            var self = this,
                viewStack = self.viewStack;
            S.mix(viewStack[viewStack.length - 1], config);
        },

        pop: function () {
            var self = this,
                viewStack = self.viewStack;
            if (viewStack.length > 1) {
                viewStack.pop();
                var config = viewStack[viewStack.length - 1];
                var nextView = self.createView(config);
                nextView.uuid = uuid++;
                var activeView = self.get('activeView');
                var loadingEl = self.loadingEl;
                var bar = self.get('bar');
                if (activeView && activeView.leave) {
                    activeView.leave();
                }
                nextView.set(config);
                if (nextView.enter) {
                    nextView.enter();
                }
                var promise = nextView.promise;
                if (!self.isLoading()) {
                    var activeEl = activeView.get('el');
                    activeEl.stop(true);
                    activeEl.animate({
                        transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    if (promise) {
                        self.set('activeView', null);
                        loadingEl.stop(true);
                        loadingEl.css('left', '-100%');
                        loadingEl.show();
                        loadingEl.animate({
                            left: '0'
                        }, {
                            useTransition: true,
                            easing: 'ease-in-out',
                            duration: 0.25
                        });
                    } else {
                        gc(self);
                        var nextViewEl = nextView.get('el');
                        nextViewEl.stop(true);
                        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
                        nextViewEl.animate({
                            transform: ''
                        }, {
                            useTransition: true,
                            easing: 'ease-in-out',
                            duration: 0.25
                        });
                        self.set('activeView', nextView);
                    }
                } else {
                    if (!promise) {
                        gc(self);
                        nextView.get('el').css('transform', '');
                        loadingEl.hide();
                    }
                }
                self.set('activeView', nextView);
                bar.back(nextView.get('title') || '', viewStack.length > 1);

                if (promise) {
                    promise.then(function () {
                        var activeView = self.get('activeView');
                        if (activeView && activeView.uuid === nextView.uuid) {
                            gc(self);
                            nextView.get('el').css('transform', '');
                            bar.set('title', nextView.get('title') || '');
                            loadingEl.hide();
                        }
                    });
                }
            }
        }
    }, {
        xclass: 'navigation-view',

        ATTRS: {
            barCfg: {
                value: {}
            },

            handleMouseEvents: {
                value: false
            },

            viewCacheSize: {
                value: 20
            },

            focusable: {
                value: false
            },

            allowTextSelection: {
                value: true
            },

            xrender: {
                value: NavigationViewRender
            },

            contentTpl: {
                value: ContentTpl
            },

            defaultChildCfg: {
                value: {
                    handleMouseEvents: false,
                    allowTextSelection: true
                }
            }
        }
    });
});