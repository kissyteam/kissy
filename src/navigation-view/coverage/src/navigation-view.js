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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[9] = 0;
  _$jscoverage['/navigation-view.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view.js'].lineData[20] = 0;
  _$jscoverage['/navigation-view.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[28] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[32] = 0;
  _$jscoverage['/navigation-view.js'].lineData[33] = 0;
  _$jscoverage['/navigation-view.js'].lineData[34] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[47] = 0;
  _$jscoverage['/navigation-view.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[51] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[68] = 0;
  _$jscoverage['/navigation-view.js'].lineData[71] = 0;
  _$jscoverage['/navigation-view.js'].lineData[72] = 0;
  _$jscoverage['/navigation-view.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view.js'].lineData[76] = 0;
  _$jscoverage['/navigation-view.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[89] = 0;
  _$jscoverage['/navigation-view.js'].lineData[93] = 0;
  _$jscoverage['/navigation-view.js'].lineData[94] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[99] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[115] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[144] = 0;
  _$jscoverage['/navigation-view.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view.js'].lineData[153] = 0;
  _$jscoverage['/navigation-view.js'].lineData[156] = 0;
  _$jscoverage['/navigation-view.js'].lineData[157] = 0;
  _$jscoverage['/navigation-view.js'].lineData[158] = 0;
  _$jscoverage['/navigation-view.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[176] = 0;
  _$jscoverage['/navigation-view.js'].lineData[180] = 0;
  _$jscoverage['/navigation-view.js'].lineData[181] = 0;
  _$jscoverage['/navigation-view.js'].lineData[182] = 0;
  _$jscoverage['/navigation-view.js'].lineData[183] = 0;
  _$jscoverage['/navigation-view.js'].lineData[184] = 0;
  _$jscoverage['/navigation-view.js'].lineData[185] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[187] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[189] = 0;
  _$jscoverage['/navigation-view.js'].lineData[190] = 0;
  _$jscoverage['/navigation-view.js'].lineData[191] = 0;
  _$jscoverage['/navigation-view.js'].lineData[192] = 0;
  _$jscoverage['/navigation-view.js'].lineData[193] = 0;
  _$jscoverage['/navigation-view.js'].lineData[194] = 0;
  _$jscoverage['/navigation-view.js'].lineData[204] = 0;
  _$jscoverage['/navigation-view.js'].lineData[205] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[207] = 0;
  _$jscoverage['/navigation-view.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view.js'].lineData[213] = 0;
  _$jscoverage['/navigation-view.js'].lineData[223] = 0;
  _$jscoverage['/navigation-view.js'].lineData[224] = 0;
  _$jscoverage['/navigation-view.js'].lineData[225] = 0;
  _$jscoverage['/navigation-view.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view.js'].lineData[229] = 0;
  _$jscoverage['/navigation-view.js'].lineData[230] = 0;
  _$jscoverage['/navigation-view.js'].lineData[231] = 0;
  _$jscoverage['/navigation-view.js'].lineData[232] = 0;
  _$jscoverage['/navigation-view.js'].lineData[233] = 0;
  _$jscoverage['/navigation-view.js'].lineData[234] = 0;
  _$jscoverage['/navigation-view.js'].lineData[235] = 0;
  _$jscoverage['/navigation-view.js'].lineData[236] = 0;
  _$jscoverage['/navigation-view.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view.js'].lineData[240] = 0;
  _$jscoverage['/navigation-view.js'].lineData[242] = 0;
  _$jscoverage['/navigation-view.js'].lineData[244] = 0;
  _$jscoverage['/navigation-view.js'].lineData[248] = 0;
  _$jscoverage['/navigation-view.js'].lineData[250] = 0;
  _$jscoverage['/navigation-view.js'].lineData[254] = 0;
  _$jscoverage['/navigation-view.js'].lineData[262] = 0;
  _$jscoverage['/navigation-view.js'].lineData[263] = 0;
  _$jscoverage['/navigation-view.js'].lineData[264] = 0;
  _$jscoverage['/navigation-view.js'].lineData[265] = 0;
  _$jscoverage['/navigation-view.js'].lineData[266] = 0;
  _$jscoverage['/navigation-view.js'].lineData[267] = 0;
  _$jscoverage['/navigation-view.js'].lineData[268] = 0;
  _$jscoverage['/navigation-view.js'].lineData[269] = 0;
  _$jscoverage['/navigation-view.js'].lineData[271] = 0;
  _$jscoverage['/navigation-view.js'].lineData[273] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view.js'].functionData[13] = 0;
  _$jscoverage['/navigation-view.js'].functionData[14] = 0;
  _$jscoverage['/navigation-view.js'].functionData[15] = 0;
  _$jscoverage['/navigation-view.js'].functionData[16] = 0;
  _$jscoverage['/navigation-view.js'].functionData[17] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['31'] = [];
  _$jscoverage['/navigation-view.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['32'] = [];
  _$jscoverage['/navigation-view.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['33'] = [];
  _$jscoverage['/navigation-view.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['34'] = [];
  _$jscoverage['/navigation-view.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['48'] = [];
  _$jscoverage['/navigation-view.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['55'] = [];
  _$jscoverage['/navigation-view.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['78'] = [];
  _$jscoverage['/navigation-view.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['83'] = [];
  _$jscoverage['/navigation-view.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['84'] = [];
  _$jscoverage['/navigation-view.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['88'] = [];
  _$jscoverage['/navigation-view.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['99'] = [];
  _$jscoverage['/navigation-view.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['111'] = [];
  _$jscoverage['/navigation-view.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['114'] = [];
  _$jscoverage['/navigation-view.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['135'] = [];
  _$jscoverage['/navigation-view.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['140'] = [];
  _$jscoverage['/navigation-view.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['152'] = [];
  _$jscoverage['/navigation-view.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['156'] = [];
  _$jscoverage['/navigation-view.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['157'] = [];
  _$jscoverage['/navigation-view.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['165'] = [];
  _$jscoverage['/navigation-view.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['189'] = [];
  _$jscoverage['/navigation-view.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['191'] = [];
  _$jscoverage['/navigation-view.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['206'] = [];
  _$jscoverage['/navigation-view.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['224'] = [];
  _$jscoverage['/navigation-view.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['225'] = [];
  _$jscoverage['/navigation-view.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['235'] = [];
  _$jscoverage['/navigation-view.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['236'] = [];
  _$jscoverage['/navigation-view.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['262'] = [];
  _$jscoverage['/navigation-view.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['268'] = [];
  _$jscoverage['/navigation-view.js'].branchData['268'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['268'][1].init(296, 68, 'nextView.get(\'animation\').leave || activeView.get(\'animation\').leave');
function visit29_268_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['262'][1].init(248, 20, 'viewStack.length > 1');
function visit28_262_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['236'][1].init(35, 51, 'activeView.get(\'animation\').leave || leaveAnimation');
function visit27_236_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['235'][1].init(842, 10, 'activeView');
function visit26_235_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['225'][1].init(442, 11, '!activeView');
function visit25_225_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['224'][1].init(382, 41, 'config.animation || self.get(\'animation\')');
function visit24_224_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['206'][1].init(107, 9, '!nextView');
function visit23_206_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['191'][1].init(591, 3, 'bar');
function visit22_191_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['189'][1].init(521, 5, 'barEl');
function visit21_189_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['165'][1].init(18, 28, 'self.isLoading() || !oldView');
function visit20_165_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['157'][1].init(18, 7, 'oldView');
function visit19_157_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['156'][1].init(586, 7, 'promise');
function visit18_156_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['152'][1].init(481, 7, 'oldView');
function visit17_152_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['140'][1].init(211, 13, 'newView.enter');
function visit16_140_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['135'][1].init(55, 24, 'oldView && oldView.leave');
function visit15_135_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['114'][2].init(94, 32, 'activeView.uuid === newView.uuid');
function visit14_114_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['114'][1].init(80, 46, 'activeView && activeView.uuid === newView.uuid');
function visit13_114_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['111'][1].init(121, 7, 'promise');
function visit12_111_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['99'][1].init(211, 31, 'className !== originalClassName');
function visit11_99_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['88'][1].init(464, 31, 'className !== originalClassName');
function visit10_88_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['84'][1].init(18, 44, 'className.indexOf(self.animatorClass) === -1');
function visit9_84_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['83'][1].init(297, 3, 'css');
function visit8_83_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['78'][1].init(100, 40, 'className.match(self.animateClassRegExp)');
function visit7_78_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['55'][1].init(387, 15, 'i < removedSize');
function visit6_55_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['48'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit5_48_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['34'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit4_34_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['33'][1].init(22, 6, 'viewId');
function visit3_33_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['32'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit2_32_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['31'][1].init(119, 19, 'i < children.length');
function visit1_31_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[16]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[18]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[20]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[23]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[24]++;
  this.control.loadingEl = loadingEl;
}});
  _$jscoverage['/navigation-view.js'].lineData[28]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[29]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[30]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[31]++;
    for (var i = 0; visit1_31_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[32]++;
      if (visit2_32_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[33]++;
        if (visit3_33_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[34]++;
          if (visit4_34_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[35]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[38]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[42]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[45]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[46]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[47]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[48]++;
    if (visit5_48_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[49]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[51]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[52]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[53]++;
  return a.uuid - b.uuid;
});
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    for (var i = 0; visit6_55_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[56]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[67]++;
  function getAnimCss(self, css, enter) {
    _$jscoverage['/navigation-view.js'].functionData[5]++;
    _$jscoverage['/navigation-view.js'].lineData[68]++;
    return self.view.getBaseCssClass('anim-' + css + '-' + (enter ? 'enter' : 'leave'));
  }
  _$jscoverage['/navigation-view.js'].lineData[71]++;
  function trimClassName(className) {
    _$jscoverage['/navigation-view.js'].functionData[6]++;
    _$jscoverage['/navigation-view.js'].lineData[72]++;
    return S.trim(className).replace(/\s+/, ' ');
  }
  _$jscoverage['/navigation-view.js'].lineData[75]++;
  function animateEl(el, self, css) {
    _$jscoverage['/navigation-view.js'].functionData[7]++;
    _$jscoverage['/navigation-view.js'].lineData[76]++;
    var className = el[0].className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[78]++;
    if (visit7_78_1(className.match(self.animateClassRegExp))) {
      _$jscoverage['/navigation-view.js'].lineData[79]++;
      className = className.replace(self.animateClassRegExp, css);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[81]++;
      className += ' ' + css;
    }
    _$jscoverage['/navigation-view.js'].lineData[83]++;
    if (visit8_83_1(css)) {
      _$jscoverage['/navigation-view.js'].lineData[84]++;
      if (visit9_84_1(className.indexOf(self.animatorClass) === -1)) {
        _$jscoverage['/navigation-view.js'].lineData[85]++;
        className += ' ' + self.animatorClass;
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[88]++;
    if (visit10_88_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[89]++;
      el[0].className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[93]++;
  function stopAnimateEl(el, self) {
    _$jscoverage['/navigation-view.js'].functionData[8]++;
    _$jscoverage['/navigation-view.js'].lineData[94]++;
    var className = el[0].className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[97]++;
    className = className.replace(self.animateClassRegExp, '').replace(self.animatorClassRegExp, '');
    _$jscoverage['/navigation-view.js'].lineData[99]++;
    if (visit11_99_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[100]++;
      el[0].className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[104]++;
  function postProcessSwitchView(self, oldView, newView, backward) {
    _$jscoverage['/navigation-view.js'].functionData[9]++;
    _$jscoverage['/navigation-view.js'].lineData[105]++;
    var promise = newView.promise;
    _$jscoverage['/navigation-view.js'].lineData[107]++;
    self.set('activeView', newView);
    _$jscoverage['/navigation-view.js'].lineData[109]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[111]++;
    if (visit12_111_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[112]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[10]++;
  _$jscoverage['/navigation-view.js'].lineData[113]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[114]++;
  if (visit13_114_1(activeView && visit14_114_2(activeView.uuid === newView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[115]++;
    self.fire('afterInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[120]++;
    stopAnimateEl(self.loadingEl, self);
    _$jscoverage['/navigation-view.js'].lineData[121]++;
    animateEl(newView.get('el'), self, self.animateNoneEnterClass);
  }
});
    } else {
      _$jscoverage['/navigation-view.js'].lineData[125]++;
      self.fire('afterInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[133]++;
  function processSwitchView(self, config, oldView, newView, enterAnimCssClass, leaveAnimCssClass, backward) {
    _$jscoverage['/navigation-view.js'].functionData[11]++;
    _$jscoverage['/navigation-view.js'].lineData[134]++;
    var loadingEl = self.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[135]++;
    if (visit15_135_1(oldView && oldView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[136]++;
      oldView.leave();
    }
    _$jscoverage['/navigation-view.js'].lineData[138]++;
    var newViewEl = newView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[139]++;
    newView.set(config);
    _$jscoverage['/navigation-view.js'].lineData[140]++;
    if (visit16_140_1(newView.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[141]++;
      newView.enter();
    }
    _$jscoverage['/navigation-view.js'].lineData[144]++;
    self.fire('beforeInnerViewChange', {
  oldView: oldView, 
  newView: newView, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[150]++;
    var promise = newView.promise;
    _$jscoverage['/navigation-view.js'].lineData[152]++;
    if (visit17_152_1(oldView)) {
      _$jscoverage['/navigation-view.js'].lineData[153]++;
      animateEl(oldView.get('el'), self, leaveAnimCssClass);
    }
    _$jscoverage['/navigation-view.js'].lineData[156]++;
    if (visit18_156_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[157]++;
      if (visit19_157_1(oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[158]++;
        animateEl(loadingEl, self, enterAnimCssClass);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[160]++;
        animateEl(loadingEl, self, self.animateNoneEnterClass);
      }
      _$jscoverage['/navigation-view.js'].lineData[163]++;
      stopAnimateEl(newViewEl, self);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[165]++;
      if (visit20_165_1(self.isLoading() || !oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[166]++;
        stopAnimateEl(loadingEl, self);
        _$jscoverage['/navigation-view.js'].lineData[167]++;
        animateEl(newViewEl, self, self.animateNoneEnterClass);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[169]++;
        animateEl(newViewEl, self, enterAnimCssClass);
      }
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[174]++;
  return Container.extend({
  isLoading: function() {
  _$jscoverage['/navigation-view.js'].functionData[12]++;
  _$jscoverage['/navigation-view.js'].lineData[176]++;
  return this.loadingEl.hasClass(this.animatorClass);
}, 
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[13]++;
  _$jscoverage['/navigation-view.js'].lineData[180]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[181]++;
  self.animateClassRegExp = new RegExp(self.view.getBaseCssClass() + '-anim-[^\\s]+');
  _$jscoverage['/navigation-view.js'].lineData[182]++;
  self.animatorClass = self.view.getBaseCssClass('animator');
  _$jscoverage['/navigation-view.js'].lineData[183]++;
  self.animateNoneEnterClass = getAnimCss(self, 'none', true);
  _$jscoverage['/navigation-view.js'].lineData[184]++;
  self.animatorClassRegExp = new RegExp(self.animatorClass);
  _$jscoverage['/navigation-view.js'].lineData[185]++;
  self.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[186]++;
  var barEl = self.get('barEl');
  _$jscoverage['/navigation-view.js'].lineData[187]++;
  var bar = self.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[188]++;
  var el = self.get('el');
  _$jscoverage['/navigation-view.js'].lineData[189]++;
  if (visit21_189_1(barEl)) {
    _$jscoverage['/navigation-view.js'].lineData[190]++;
    el.prepend(barEl);
  } else {
    _$jscoverage['/navigation-view.js'].lineData[191]++;
    if (visit22_191_1(bar)) {
      _$jscoverage['/navigation-view.js'].lineData[192]++;
      bar.set('elBefore', el[0].firstChild);
      _$jscoverage['/navigation-view.js'].lineData[193]++;
      bar.set('navigationView', self);
      _$jscoverage['/navigation-view.js'].lineData[194]++;
      bar.render();
    }
  }
}, 
  createView: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[14]++;
  _$jscoverage['/navigation-view.js'].lineData[204]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[205]++;
  var nextView = getViewInstance(self, config);
  _$jscoverage['/navigation-view.js'].lineData[206]++;
  if (visit23_206_1(!nextView)) {
    _$jscoverage['/navigation-view.js'].lineData[207]++;
    nextView = self.addChild(config);
  }
  _$jscoverage['/navigation-view.js'].lineData[209]++;
  return nextView;
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[15]++;
  _$jscoverage['/navigation-view.js'].lineData[213]++;
  var self = this, nextView, animation, enterAnimation, leaveAnimation, enterAnimCssClass, leaveAnimCssClass, activeView, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[223]++;
  activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[224]++;
  config.animation = visit24_224_1(config.animation || self.get('animation'));
  _$jscoverage['/navigation-view.js'].lineData[225]++;
  if (visit25_225_1(!activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[227]++;
    config.animation = {};
  }
  _$jscoverage['/navigation-view.js'].lineData[229]++;
  nextView = self.createView(config);
  _$jscoverage['/navigation-view.js'].lineData[230]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[231]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[232]++;
  animation = nextView.get('animation');
  _$jscoverage['/navigation-view.js'].lineData[233]++;
  enterAnimation = animation.enter;
  _$jscoverage['/navigation-view.js'].lineData[234]++;
  leaveAnimation = animation.leave;
  _$jscoverage['/navigation-view.js'].lineData[235]++;
  if (visit26_235_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[236]++;
    leaveAnimation = visit27_236_1(activeView.get('animation').leave || leaveAnimation);
  }
  _$jscoverage['/navigation-view.js'].lineData[239]++;
  enterAnimCssClass = getAnimCss(self, enterAnimation, true);
  _$jscoverage['/navigation-view.js'].lineData[240]++;
  leaveAnimCssClass = getAnimCss(self, leaveAnimation);
  _$jscoverage['/navigation-view.js'].lineData[242]++;
  processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass);
  _$jscoverage['/navigation-view.js'].lineData[244]++;
  postProcessSwitchView(self, activeView, nextView);
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[16]++;
  _$jscoverage['/navigation-view.js'].lineData[248]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[250]++;
  S.mix(viewStack[viewStack.length - 1], config);
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[17]++;
  _$jscoverage['/navigation-view.js'].lineData[254]++;
  var self = this, activeView, config, nextView, enterAnimCssClass, leaveAnimCssClass, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[262]++;
  if (visit28_262_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[263]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[264]++;
    activeView = self.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[265]++;
    config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[266]++;
    nextView = self.createView(config);
    _$jscoverage['/navigation-view.js'].lineData[267]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[268]++;
    enterAnimCssClass = getAnimCss(self, visit29_268_1(nextView.get('animation').leave || activeView.get('animation').leave), true);
    _$jscoverage['/navigation-view.js'].lineData[269]++;
    leaveAnimCssClass = getAnimCss(self, activeView.get('animation').enter);
    _$jscoverage['/navigation-view.js'].lineData[271]++;
    processSwitchView(self, config, activeView, nextView, enterAnimCssClass, leaveAnimCssClass, true);
    _$jscoverage['/navigation-view.js'].lineData[273]++;
    postProcessSwitchView(self, activeView, nextView, true);
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  bar: {}, 
  barEl: {}, 
  animation: {
  value: {
  'enter': 'slide-right', 
  'leave': 'slide-left'}}, 
  handleMouseEvents: {
  value: false}, 
  viewCacheSize: {
  value: 20}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  handleMouseEvents: false, 
  allowTextSelection: true}}}});
});
