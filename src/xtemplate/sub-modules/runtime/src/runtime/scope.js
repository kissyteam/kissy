/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    function Scope(data, affix) {
        // {}
        this.data = data || {};
        // {xindex}
        this.affix = affix;
        this.root = this;
    }

    Scope.prototype = {
        isScope: 1,

        setParent: function (parentScope) {
            this.parent = parentScope;
            this.root = parentScope.root;
        },

        // keep original data unmodified
        set: function (name, value) {
            if (!this.affix) {
                this.affix = {};
            }
            this.affix[name] = value;
        },

        setData: function (data) {
            this.data = data;
        },

        getData: function () {
            return this.data;
        },

        mix: function (v) {
            if (!this.affix) {
                this.affix = {};
            }
            S.mix(this.affix, v);
        },

        get: function (name) {
            var data = this.data;

            var v = data && data[name];

            if (v !== undefined) {
                return v;
            }

            var affix = this.affix;

            if (affix && (name in affix)) {
                return affix[name];
            }

            if (name === 'this') {
                return data;
            }

            if (name === 'root') {
                return this.root.data;
            }

            return v;
        },

        resolve: function (parts, depth) {
            var self = this;

            if (!depth && parts.length === 1) {
                return self.get(parts[0]);
            }

            var len, i, v;
            var scope = self;

            // root keyword for root self
            if (parts[0] === 'root') {
                parts.shift();
                scope = scope.root;
            } else if (depth) {
                while (scope && depth--) {
                    scope = scope.parent;
                }
            }

            len = parts.length;

            var part0 = parts[0];

            do {
                v = scope.get(part0);
            } while (v === undefined && (scope = scope.parent));

            if (v && scope) {
                for (i = 1; v && i < len; i++) {
                    v = v[parts[i]];
                }
                if (typeof v === 'function') {
                    v = v.call(this.data);
                }
                return v;
            } else {
                return undefined;
            }
        }
    };

    return Scope;
});