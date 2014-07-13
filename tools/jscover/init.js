try {
    if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
        // this is a browser window that was opened from another window

        if (!top.opener._$jscoverage) {
            top.opener._$jscoverage = {};
        }
    }
}
catch (e) {
}

try {
    if (typeof top === 'object' && top !== null) {
        // this is a browser window

        try {
            if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
                top._$jscoverage = top.opener._$jscoverage;
            }
        }
        catch (e) {
        }

        if (!top._$jscoverage) {
            top._$jscoverage = {};
        }
    }
}
catch (e) {
}

try {
    if (typeof top === 'object' && top !== null && top._$jscoverage) {
        this._$jscoverage = top._$jscoverage;
    }
}
catch (e) {
}
if (!this._$jscoverage) {
    this._$jscoverage = {};
}