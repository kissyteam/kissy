
KISSY.Editor.add("color", function(E) {
    
    var TO_STRING = "toString",
        PARSE_INT = parseInt,
        RE = RegExp,
        Y = YAHOO.util;

    E.Color = {
        KEYWORDS: {
            black: "000",
            silver: "c0c0c0",
            gray: "808080",
            white: "fff",
            maroon: "800000",
            red: "f00",
            purple: "800080",
            fuchsia: "f0f",
            green: "008000",
            lime: "0f0",
            olive: "808000",
            yellow: "ff0",
            navy: "000080",
            blue: "00f",
            teal: "008080",
            aqua: "0ff"
        },

        re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
        re_hex3: /([0-9A-F])/gi,

        toRGB: function(val) {
            if (!this.re_RGB.test(val)) {
                val = this.toHex(val);
            }

            if (this.re_hex.exec(val)) {
                val = "rgb(" + [
                    PARSE_INT(RE.$1, 16),
                    PARSE_INT(RE.$2, 16),
                    PARSE_INT(RE.$3, 16)
                ].join(", ") + ")";
            }
            return val;
        },

        toHex: function(val) {
            val = this.KEYWORDS[val] || val;
            if (this.re_RGB.exec(val)) {
                var r = Number(RE.$1),
                    g = Number(RE.$2),
                    b = Number(RE.$3);

                val = [
                    r[TO_STRING](16),
                    g[TO_STRING](16),
                    b[TO_STRING](16)
                ].join("");
            }

            if (val.length < 6) {
                val = val.replace(this.re_hex3, "$1$1");
            }

            if (val !== "transparent" && val.indexOf("#") < 0) {
                val = "#" + val;
            }

            return val.toLowerCase();
        }
    };
});
