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

    function postProcessSwitchView(self, nextView) {
        var promise = nextView.promise;

        self.set('activeView', nextView);

        gc(self);

        if (promise) {
            promise.then(function () {
                var activeView = self.get('activeView');
                if (activeView && activeView.uuid === nextView.uuid) {
                    self.get('bar').set('title', nextView.get('title') || '');
                    stopAnimateEl(self.loadingEl, self);
                    animateEl(nextView.get('el'), self, self.animateNoneEnterClass);
                }
            });
        }
    }

    function processSwitchView(self, config, nextView, enterAnimCssClass, leaveAnimCssClass) {
        var loadingEl = self.loadingEl;
        var activeView = self.get('activeView');
        if (activeView && activeView.leave) {
            activeView.leave();
        }
        var nextViewEl = nextView.get('el');
        nextView.set(config);
        if (nextView.enter) {
            nextView.enter();
        }
        var promise = nextView.promise;

        if (activeView) {
            animateEl(activeView.get('el'), self, leaveAnimCssClass);
        }

        if (promise) {
            if (activeView) {
                animateEl(loadingEl, self, enterAnimCssClass);
            } else {
                animateEl(loadingEl, self, self.animateNoneEnterClass);
            }
            // leave without aim, hidden
            stopAnimateEl(nextViewEl, self);
        } else {
            if (self.isLoading() || !activeView) {
                stopAnimateEl(loadingEl, self);
                animateEl(nextViewEl, self, self.animateNoneEnterClass);
            } else {
                animateEl(nextViewEl, self, enterAnimCssClass);
            }
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
            return this.loadingEl.hasClass(this.animatorClass);
        },

        renderUI: function () {
            var self = this;
            this.animateClassRegExp = new RegExp(this.view.getBaseCssClass() + '-anim-[^\\s]+');
            this.animatorClass = this.view.getBaseCssClass('animator');
            this.animateNoneEnterClass = getAnimCss(self, 'none', true);
            this.animatorClassRegExp = new RegExp(this.animatorClass);
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
                bar,
                promise,
                activeView,
                viewStack = self.viewStack;

            activeView = self.get('activeView');
            bar = self.get('bar');
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
            promise = nextView.promise;
            enterAnimCssClass = getAnimCss(self, enterAnimation, true);
            leaveAnimCssClass = getAnimCss(self, leaveAnimation);

            processSwitchView(self, config, nextView, enterAnimCssClass, leaveAnimCssClass);

            if (activeView) {
                bar.forward(nextView.get('title') || '');
            } else if (!promise) {
                bar.set('title', nextView.get('title') || '');
            }

            postProcessSwitchView(self, nextView);
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
                enterAnimCssClass = getAnimCss(self, nextView.get('animation').leave||activeView.get('animation').leave, true);
                leaveAnimCssClass = getAnimCss(self, activeView.get('animation').enter);

                processSwitchView(self, config, nextView, enterAnimCssClass, leaveAnimCssClass);

                self.get('bar').back(nextView.get('title') || '', viewStack.length > 1);

                postProcessSwitchView(self, nextView);
            }
        }
    }, {
        xclass: 'navigation-view',

        ATTRS: {
            barCfg: {
                value: {}
            },

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