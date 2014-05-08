/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
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
            var affix = this.affix;
            if (!affix) {
                affix = this.affix = {};
            }
            for (var name in v) {
                affix[name] = v[name];
            }
        },

        get: function (name) {
            var data = this.data;

            var v = data && data[name];

            if (v !== undefined) {
                return v;
            }

            var affix = this.affix;

            v = affix && affix[name];

            if (v !== undefined) {
                return v;
            }

            if (name === 'this') {
                return data;
            } else if (name === 'root') {
                return this.root.data;
            }

            return v;
        },

        resolve: function (parts, depth) {
            var self = this;

            if (!depth && parts.length === 1) {
                return self.get(parts[0]);
            }

            var len = parts.length,
                scope = self,
                i, v;

            // root keyword for root self
            if (len && parts[0] === 'root') {
                parts.shift();
                scope = scope.root;
                len--;
            } else if (depth) {
                while (scope && depth--) {
                    scope = scope.parent;
                }
            }

            if (!len) {
                return scope.data;
            }

            var part0 = parts[0];

            do {
                v = scope.get(part0);
            } while (v === undefined && (scope = scope.parent));

            if (v && scope) {
                for (i = 1; v && i < len; i++) {
                    v = v[parts[i]];
                }
                return v;
            } else {
                return undefined;
            }
        }
    };

    return Scope;
});