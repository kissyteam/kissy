/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
var undef;

function Scope(data) {
    // {}
    if (arguments.length) {
        this.data = data;
    } else {
        this.data = {};
    }
    // {xindex}
    this.affix = undef;
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
        var v;
        var affix = this.affix;

        v = affix && affix[name];

        if (v !== undef) {
            return v;
        }

        if (data !== undef) {
            v = data[name];
        }

        if (v !== undef) {
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
        var v;

        if (!depth && parts.length === 1) {
            v = self.get(parts[0]);
            if (v !== undef) {
                return v;
            } else {
                depth = 1;
            }
        }

        var len = parts.length,
            scope = self,
            i;

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

        if (!scope) {
            return undef;
        }

        if (!len) {
            return scope.data;
        }

        var part0 = parts[0];

        do {
            v = scope.get(part0);
        } while (v === undef && (scope = scope.parent));

        if (v && scope) {
            for (i = 1; v && i < len; i++) {
                v = v[parts[i]];
            }
            return v;
        } else {
            return undef;
        }
    }
};

module.exports = Scope;