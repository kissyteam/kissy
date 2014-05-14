function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/editor/enterKey.js']) {
  _$jscoverage['/editor/enterKey.js'] = {};
  _$jscoverage['/editor/enterKey.js'].lineData = [];
  _$jscoverage['/editor/enterKey.js'].lineData[10] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[11] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[12] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[13] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[14] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[15] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[16] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[17] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[18] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[19] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[22] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[24] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[26] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[27] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[30] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[35] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[36] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[37] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[42] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[45] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[46] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[47] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[48] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[49] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[51] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[54] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[56] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[58] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[59] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[60] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[62] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[63] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[65] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[67] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[68] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[69] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[70] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[72] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[77] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[80] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[82] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[83] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[87] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[90] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[91] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[93] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[96] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[97] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[98] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[99] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[100] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[102] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[103] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[104] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[105] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[108] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[113] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[117] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[120] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[125] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[126] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[129] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[134] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[136] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[138] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[139] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[142] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[143] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[149] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[150] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[151] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[152] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[154] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[156] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[159] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[160] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[161] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[162] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[167] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[168] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[171] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[178] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[180] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[181] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[185] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[188] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[189] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[192] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[195] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[198] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[203] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[207] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[214] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[215] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[218] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[219] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[220] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[221] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[222] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[223] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[224] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[225] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[226] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[227] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[228] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[235] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[237] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[240] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[241] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].functionData) {
  _$jscoverage['/editor/enterKey.js'].functionData = [];
  _$jscoverage['/editor/enterKey.js'].functionData[0] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[1] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[2] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[3] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[4] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[5] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[6] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].branchData) {
  _$jscoverage['/editor/enterKey.js'].branchData = {};
  _$jscoverage['/editor/enterKey.js'].branchData['18'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['26'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['42'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['44'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['44'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['44'][4] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['45'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['54'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['56'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['58'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['60'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['69'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['82'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['96'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['98'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['102'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['113'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['117'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['118'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['125'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['129'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['134'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['138'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['142'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['150'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['151'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['154'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['159'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['167'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['178'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['178'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['185'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['188'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['189'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['222'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['223'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['223'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['227'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['227'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['227'][1].init(184, 12, 're !== false');
function visit341_227_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['223'][3].init(38, 24, 'ev.ctrlKey || ev.metaKey');
function visit340_223_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['223'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['223'][2].init(23, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit339_223_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['223'][1].init(21, 42, '!(ev.shiftKey || ev.ctrlKey || ev.metaKey)');
function visit338_223_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['222'][1].init(55, 14, 'keyCode === 13');
function visit337_222_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['189'][1].init(17, 9, 'nextBlock');
function visit336_189_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['188'][1].init(6415, 7, '!OLD_IE');
function visit335_188_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['185'][1].init(2462, 31, 'isStartOfBlock && !isEndOfBlock');
function visit334_185_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['178'][3].init(2108, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit333_178_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['178'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['178'][2].init(2089, 72, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit332_178_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['178'][1].init(2079, 82, 'OLD_IE && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit331_178_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['167'][1].init(1658, 7, '!OLD_IE');
function visit330_167_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['159'][1].init(317, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit329_159_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['154'][1].init(87, 99, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit328_154_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['151'][1].init(68, 7, 'i < len');
function visit327_151_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['150'][1].init(971, 11, 'elementPath');
function visit326_150_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['142'][1].init(627, 9, '!newBlock');
function visit325_142_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['138'][1].init(538, 9, 'nextBlock');
function visit324_138_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['134'][2].init(253, 33, 'previousBlock.nodeName() === \'li\'');
function visit323_134_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['134'][1].init(253, 88, 'previousBlock.nodeName() === \'li\' || !(headerPreTagRegex.test(previousBlock.nodeName()))');
function visit322_134_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['129'][1].init(17, 13, 'previousBlock');
function visit321_129_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['125'][1].init(610, 9, 'nextBlock');
function visit320_125_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['118'][1].init(49, 110, '(node = nextBlock.first(Walker.invisible(true))) && util.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit319_118_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['117'][2].init(223, 29, 'nextBlock.nodeName() === \'li\'');
function visit318_117_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['117'][1].init(223, 160, 'nextBlock.nodeName() === \'li\' && (node = nextBlock.first(Walker.invisible(true))) && util.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit317_117_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['113'][1].init(3121, 32, '!isStartOfBlock && !isEndOfBlock');
function visit316_113_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['102'][3].init(2683, 24, 'node.nodeName() === \'li\'');
function visit315_102_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['102'][2].init(2649, 58, '(node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit314_102_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['102'][1].init(2631, 76, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit313_102_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['98'][1].init(56, 24, 'node.nodeName() === \'li\'');
function visit312_98_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['96'][1].init(2394, 9, 'nextBlock');
function visit311_96_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['82'][1].init(2003, 10, '!splitInfo');
function visit310_82_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['69'][1].init(647, 13, 'UA.ieMode < 9');
function visit309_69_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['60'][1].init(203, 13, 'UA.ieMode < 9');
function visit308_60_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['58'][1].init(64, 13, 'UA.ieMode < 9');
function visit307_58_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['56'][1].init(93, 13, '!isEndOfBlock');
function visit306_56_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['54'][2].init(913, 26, 'block.nodeName() === \'pre\'');
function visit305_54_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['54'][1].init(904, 35, 'block && block.nodeName() === \'pre\'');
function visit304_54_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['45'][1].init(21, 28, 'editor.hasCommand(\'outdent\')');
function visit303_45_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['44'][4].init(77, 34, 'block.parent().nodeName() === \'li\'');
function visit302_44_4(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['44'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['44'][3].init(48, 25, 'block.nodeName() === \'li\'');
function visit301_44_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['44'][2].init(48, 63, 'block.nodeName() === \'li\' || block.parent().nodeName() === \'li\'');
function visit300_44_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['44'][1].init(38, 74, 'block && (block.nodeName() === \'li\' || block.parent().nodeName() === \'li\')');
function visit299_44_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['42'][1].init(412, 30, 'isStartOfBlock && isEndOfBlock');
function visit298_42_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['26'][1].init(201, 5, 'i > 0');
function visit297_26_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['18'][1].init(240, 14, 'UA.ieMode < 11');
function visit296_18_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[11]++;
  var util = S;
  _$jscoverage['/editor/enterKey.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/enterKey.js'].lineData[13]++;
  var $ = Node.all;
  _$jscoverage['/editor/enterKey.js'].lineData[14]++;
  var UA = require('ua');
  _$jscoverage['/editor/enterKey.js'].lineData[15]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/enterKey.js'].lineData[16]++;
  var Editor = require('./base');
  _$jscoverage['/editor/enterKey.js'].lineData[17]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/enterKey.js'].lineData[18]++;
  var OLD_IE = visit296_18_1(UA.ieMode < 11);
  _$jscoverage['/editor/enterKey.js'].lineData[19]++;
  var headerPreTagRegex = /^(?:h[1-6])|(?:pre)$/i, dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/enterKey.js'].lineData[22]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[24]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[26]++;
    for (var i = ranges.length - 1; visit297_26_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[27]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[30]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[33]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[35]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[36]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[37]++;
    var path = new ElementPath(range.startContainer), isStartOfBlock = range.checkStartOfBlock(), isEndOfBlock = range.checkEndOfBlock(), block = path.block;
    _$jscoverage['/editor/enterKey.js'].lineData[42]++;
    if (visit298_42_1(isStartOfBlock && isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[44]++;
      if (visit299_44_1(block && (visit300_44_2(visit301_44_3(block.nodeName() === 'li') || visit302_44_4(block.parent().nodeName() === 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[45]++;
        if (visit303_45_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[46]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enterKey.js'].lineData[47]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[48]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enterKey.js'].lineData[49]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[51]++;
          return false;
        }
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[54]++;
      if (visit304_54_1(block && visit305_54_2(block.nodeName() === 'pre'))) {
        _$jscoverage['/editor/enterKey.js'].lineData[56]++;
        if (visit306_56_1(!isEndOfBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[58]++;
          var lineBreak = visit307_58_1(UA.ieMode < 9) ? $(doc.createTextNode('\r')) : $(doc.createElement('br'));
          _$jscoverage['/editor/enterKey.js'].lineData[59]++;
          range.insertNode(lineBreak);
          _$jscoverage['/editor/enterKey.js'].lineData[60]++;
          if (visit308_60_1(UA.ieMode < 9)) {
            _$jscoverage['/editor/enterKey.js'].lineData[62]++;
            lineBreak = $(doc.createTextNode('\ufeff')).insertAfter(lineBreak);
            _$jscoverage['/editor/enterKey.js'].lineData[63]++;
            range.setStartAt(lineBreak, Editor.RangeType.POSITION_AFTER_START);
          } else {
            _$jscoverage['/editor/enterKey.js'].lineData[65]++;
            range.setStartAfter(lineBreak);
          }
          _$jscoverage['/editor/enterKey.js'].lineData[67]++;
          range.collapse(true);
          _$jscoverage['/editor/enterKey.js'].lineData[68]++;
          range.select();
          _$jscoverage['/editor/enterKey.js'].lineData[69]++;
          if (visit309_69_1(UA.ieMode < 9)) {
            _$jscoverage['/editor/enterKey.js'].lineData[70]++;
            lineBreak[0].nodeValue = '';
          }
          _$jscoverage['/editor/enterKey.js'].lineData[72]++;
          return;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[77]++;
    var blockTag = 'p';
    _$jscoverage['/editor/enterKey.js'].lineData[80]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[82]++;
    if (visit310_82_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[83]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[87]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[90]++;
    isStartOfBlock = splitInfo.wasStartOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[91]++;
    isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[93]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[96]++;
    if (visit311_96_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[97]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[98]++;
      if (visit312_98_1(node.nodeName() === 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[99]++;
        nextBlock._4eBreakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[100]++;
        nextBlock._4eMove(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[102]++;
      if (visit313_102_1(previousBlock && visit314_102_2((node = previousBlock.parent()) && visit315_102_3(node.nodeName() === 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[103]++;
        previousBlock._4eBreakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[104]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[105]++;
        previousBlock._4eMove(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[108]++;
    var newBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[113]++;
    if (visit316_113_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[117]++;
      if (visit317_117_1(visit318_117_2(nextBlock.nodeName() === 'li') && visit319_118_1((node = nextBlock.first(Walker.invisible(true))) && util.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[120]++;
        (OLD_IE ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[125]++;
      if (visit320_125_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[126]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[129]++;
      if (visit321_129_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[134]++;
        if (visit322_134_1(visit323_134_2(previousBlock.nodeName() === 'li') || !(headerPreTagRegex.test(previousBlock.nodeName())))) {
          _$jscoverage['/editor/enterKey.js'].lineData[136]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[138]++;
        if (visit324_138_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[139]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[142]++;
      if (visit325_142_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[143]++;
        newBlock = new Node('<' + blockTag + '>', null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[149]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[150]++;
      if (visit326_150_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[151]++;
        for (var i = 0, len = elementPath.elements.length; visit327_151_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[152]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[154]++;
          if (visit328_154_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[156]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[159]++;
          if (visit329_159_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[160]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[161]++;
            newBlock._4eMoveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[162]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[167]++;
      if (visit330_167_1(!OLD_IE)) {
        _$jscoverage['/editor/enterKey.js'].lineData[168]++;
        newBlock._4eAppendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[171]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[178]++;
      if (visit331_178_1(OLD_IE && visit332_178_2(isStartOfBlock && (visit333_178_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[180]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[181]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[185]++;
      range.moveToElementEditablePosition(visit334_185_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[188]++;
    if (visit335_188_1(!OLD_IE)) {
      _$jscoverage['/editor/enterKey.js'].lineData[189]++;
      if (visit336_189_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[192]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[195]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[197]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[198]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[203]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[207]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[214]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[215]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[218]++;
  function enterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[219]++;
    var doc = editor.get('document');
    _$jscoverage['/editor/enterKey.js'].lineData[220]++;
    doc.on('keydown', function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[221]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[222]++;
  if (visit337_222_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[223]++;
    if (visit338_223_1(!(visit339_223_2(ev.shiftKey || visit340_223_3(ev.ctrlKey || ev.metaKey))))) {
      _$jscoverage['/editor/enterKey.js'].lineData[224]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enterKey.js'].lineData[225]++;
      var re = editor.execCommand('enterBlock');
      _$jscoverage['/editor/enterKey.js'].lineData[226]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enterKey.js'].lineData[227]++;
      if (visit341_227_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[228]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[235]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[237]++;
  editor.addCommand('enterBlock', {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[240]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[241]++;
  enterKey(editor);
});
}};
});
