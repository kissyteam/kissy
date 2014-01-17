/**
 * navigation view to accommodate multiple views
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node').all;
    var Container = require('component/container');
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

    /**
     * @private
     * @param self
     * @param css
     * @param [enter]
     * @returns {string}
     */
    function getAnimCss(self, css, enter) {
        return self.view.getBaseCssClass('anim-' + css + '-' + (enter ? 'enter' : 'leave'));
    }

    function trimClassName(className) {
        return S.trim(className).replace(/\s+/, ' ');
    }

    function animateEl(el, self, css) {
        var className = el[0].className,
            originalClassName = className;
        if (className.match(self.animateClassRegExp)) {
            className = className.replace(self.animateClassRegExp, css);
        } else {
            className += ' ' + css;
        }
        if (css) {
            if (className.indexOf(self.animatorClass) === -1) {
                className += ' ' + self.animatorClass;
            }
        }
        if (className !== originalClassName) {
            el[0].className = trimClassName(className);
        }
    }

    function stopAnimateEl(el, self) {
        var className = el[0].className,
            originalClassName = className;

        className = className.replace(self.animateClassRegExp, '').replace(self.animatorClassRegExp, '');

        if (className !== originalClassName) {
            el[0].className = trimClassName(className);
        }
    }

    function postProcessSwitchView(self, oldView, newView, backward) {
        var promise = newView.promise;

        self.set('activeView', newView);

        gc(self);

        if (promise) {
            promise.then(function () {
                var activeView = self.get('activeView');
                if (activeView && activeView.uuid === newView.uuid) {
                    self.fire('afterInnerViewChange', {
                        oldView: oldView,
                        newView: newView,
                        backward: backward
                    });
                    stopAnimateEl(self.loadingEl, self);
                    animateEl(newView.get('el'), self, self.animateNoneEnterClass);
                }
            });
        } else {
            self.fire('afterInnerViewChange', {
                oldView: oldView,
                newView: newView,
                backward: backward
            });
        }
    }

    function processSwitchView(self, config, oldView, newView, enterAnimCssClass, leaveAnimCssClass, backward) {
        var loadingEl = self.loadingEl;
        if (oldView && oldView.leave) {
            oldView.leave();
        }
        var newViewEl = newView.get('el');
        newView.set(config);
        if (newView.enter) {
            newView.enter();
        }

        self.fire('beforeInnerViewChange', {
            oldView: oldView,
            newView: newView,
            backward: backward
        });

        var promise = newView.promise;

        if (oldView) {
            animateEl(oldView.get('el'), self, leaveAnimCssClass);
        }

        if (promise) {
            if (oldView) {
                animateEl(loadingEl, self, enterAnimCssClass);
            } else {
                animateEl(loadingEl, self, self.animateNoneEnterClass);
            }
            // leave without aim, hidden
            stopAnimateEl(newViewEl, self);
        } else {
            if (self.isLoading() || !oldView) {
                stopAnimateEl(loadingEl, self);
                animateEl(newViewEl, self, self.animateNoneEnterClass);
            } else {
                animateEl(newViewEl, self, enterAnimCssClass);
            }
        }
    }

    return Container.extend({
        isLoading: function () {
            return this.loadingEl.hasClass(this.animatorClass);
        },

        renderUI: function () {
            var self = this;
            self.animateClassRegExp = new RegExp(self.view.getBaseCssClass() + '-anim-[^\\s]+');
            self.animatorClass = self.view.getBaseCssClass('animator');
            self.animateNoneEnterClass = getAnimCss(self, 'none', true);
            self.animatorClassRegExp = new RegExp(self.animatorClass);
            self.viewStack = [];
            var barEl = self.get('barEl');
            var bar = self.get('bar');
            var el = self.get('el');
            if (barEl) {
                el.prepend(barEl);
            } else if (bar) {
                bar.set('elBefore', el[0].firstChild);
                bar.set('navigationView', self);
                bar.render();
            }
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
            }
            return nextView;
        },

        push: function (config) {
            var self = this,
                nextView,
                animation,
                enterAnimation,
                leaveAnimation,
                enterAnimCssClass,
                leaveAnimCssClass,
                activeView,
                viewStack = self.viewStack;

            activeView = self.get('activeView');
            config.animation = config.animation || self.get('animation');
            if (!activeView) {
                // first view no animation
                config.animation = {};
            }
            nextView = self.createView(config);
            nextView.uuid = uuid++;
            viewStack.push(config);
            animation = nextView.get('animation');
            enterAnimation = animation.enter;
            leaveAnimation = animation.leave;
            if (activeView) {
                leaveAnimation = activeView.get('animation').leave || leaveAnimation;
            }

            enterAnimCssClass = getAnimCss(self, enterAnimation, true);
            leaveAnimCssClass = getAnimCss(self, leaveAnimation);

            processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass);

            postProcessSwitchView(self, activeView, nextView);
        },

        replace: function (config) {
            var self = this,
                viewStack = self.viewStack;
            S.mix(viewStack[viewStack.length - 1], config);
        },

        pop: function () {
            var self = this,
                activeView,
                config,
                nextView,
                enterAnimCssClass,
                leaveAnimCssClass,
                viewStack = self.viewStack;

            if (viewStack.length > 1) {
                viewStack.pop();
                activeView = self.get('activeView');
                config = viewStack[viewStack.length - 1];
                nextView = self.createView(config);
                nextView.uuid = uuid++;
                enterAnimCssClass = getAnimCss(self, nextView.get('animation').leave || activeView.get('animation').leave, true);
                leaveAnimCssClass = getAnimCss(self, activeView.get('animation').enter);

                processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass, true);

                postProcessSwitchView(self, activeView, nextView, true);
            }
        }
    }, {
        xclass: 'navigation-view',

        ATTRS: {
            bar: {},

            barEl: {},

            /**
             * default animation for view switch when pushed enter or pushed leave
             */
            animation: {
                value: {
                    'enter': 'slide-right',
                    'leave': 'slide-left'
                }
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