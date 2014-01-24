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


    var vendorPrefix = S.Features.getVendorCssPropPrefix('animation');
    var ANIMATION_END_EVENT = vendorPrefix ?
        (vendorPrefix.toLowerCase() + 'AnimationEnd') :
        // https://github.com/kissyteam/kissy/issues/538
        'animationend webkitAnimationEnd';

    var uuid = 0;

    var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
        createDom: function () {
            var self = this,
                control = self.control;
            var $loadingEl = $(S.substitute(LOADING_HTML, {
                prefixCls: self.control.get('prefixCls')
            }));
            control.get('contentEl').append($loadingEl);
            control.$loadingEl = $loadingEl;
            control.loadingEl = $loadingEl[0];
            $loadingEl.on(ANIMATION_END_EVENT, onAnimEnd($loadingEl[0]), control);
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

    /**
     *
     * @param el
     * @param self
     * @param [css]
     */
    function showAnimateEl(el, self, css) {
        var className = el.className,
            originalClassName = className;

        if (className.match(self.animateClassRegExp)) {
            className = className.replace(self.animateClassRegExp, '');
        }

        if (css) {
            className += ' ' + css;
        }

        if (className.indexOf(self.showViewClass) === -1) {
            className += ' ' + self.showViewClass;
        }
        if (className !== originalClassName) {
            el.className = trimClassName(className);
        }
    }

    function hideAnimateEl(el, self) {
        var className = el.className,
            originalClassName = className;

        className = className.replace(self.animateClassRegExp, '')
            .replace(self.showViewClass, '');

        if (className !== originalClassName) {
            el.className = trimClassName(className);
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
                    hideAnimateEl(self.loadingEl, self);
                    showAnimateEl(newView.el, self);
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
        var newViewEl = newView.el;
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
            showAnimateEl(oldView.el, self, leaveAnimCssClass);
        }

        if (promise) {
            if (oldView) {
                showAnimateEl(loadingEl, self, enterAnimCssClass);
            } else {
                // first view show loading without anim
                showAnimateEl(loadingEl, self);
            }
            // leave without aim, hidden
            hideAnimateEl(newViewEl, self);
        } else {
            // is loading and not first view
            if (self.$loadingEl.hasClass(self.showViewClass) && oldView) {
                showAnimateEl(loadingEl, self, leaveAnimCssClass);
            }
            showAnimateEl(newViewEl, self, enterAnimCssClass);
        }
    }

    function isEnterCss(css, self) {
        return css.match(self.animateEnterRegExp);
    }

    function isLeaveCss(css, self) {
        return css.match(self.animateLeaveRegExp);
    }

    function onAnimEnd(el) {
        return function () {
            var self = this;
            var className = el.className;
            if (isEnterCss(className, self)) {
                showAnimateEl(el, self);
            } else if (isLeaveCss(className, self)) {
                hideAnimateEl(el, self);
            }
        };
    }

    return Container.extend({
        createDom: function () {
            var self = this;
            self.animateClassRegExp = new RegExp(self.view.getBaseCssClass() + '-anim-[^\\s]+');
            self.animateEnterRegExp = new RegExp('-enter(?:\\s|$)');
            self.animateLeaveRegExp = new RegExp('-leave(?:\\s|$)');
            self.showViewClass = self.view.getBaseCssClass('show-view');
            self.viewStack = [];
        },

        /**
         * get inner view instance for specified view class.
         * @param [config]
         * @returns {KISSY.Component.Control}
         */
        createView: function (config) {
            var self = this;
            var nextView = getViewInstance(self, config);
            var nextViewEl;
            if (!nextView) {
                nextView = self.addChild(config);
                nextViewEl = nextView.get('el');
                nextViewEl.on(ANIMATION_END_EVENT, onAnimEnd(nextViewEl[0]), self);
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

            enterAnimCssClass = enterAnimation && getAnimCss(self, enterAnimation, true) || '';
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
            /**
             * default animation for view switch when pushed enter or pushed leave
             */
            animation: {
                value: {
                    'enter': 'slide-right',
                    'leave': 'slide-left'
                }
            },

            handleGestureEvents: {
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
                    handleGestureEvents: false,
                    allowTextSelection: true
                }
            }
        }
    });
});