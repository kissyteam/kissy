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
if (! _$jscoverage['/scrollbar/control.js']) {
  _$jscoverage['/scrollbar/control.js'] = {};
  _$jscoverage['/scrollbar/control.js'].lineData = [];
  _$jscoverage['/scrollbar/control.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[84] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[96] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[103] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[107] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[120] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[121] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[127] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[131] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[139] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[150] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[151] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[153] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[156] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[157] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[160] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[161] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[174] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[176] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[178] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[179] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[180] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[182] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[184] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[185] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[186] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[190] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[191] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[192] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[195] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[196] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[197] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[198] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[207] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[209] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[210] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[211] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[212] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[213] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[214] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[215] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[216] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[218] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[219] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[221] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[222] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[224] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[228] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[231] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[232] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[234] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[236] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[238] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[240] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[246] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[250] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[254] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[255] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[292] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[309] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[311] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[312] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[314] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[321] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[322] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[323] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[325] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].functionData) {
  _$jscoverage['/scrollbar/control.js'].functionData = [];
  _$jscoverage['/scrollbar/control.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[3] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[4] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[5] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[20] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[23] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].branchData) {
  _$jscoverage['/scrollbar/control.js'].branchData = {};
  _$jscoverage['/scrollbar/control.js'].branchData['24'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['28'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['65'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['68'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['86'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['95'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['100'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['108'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['118'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['132'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['138'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['174'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['179'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['196'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['210'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['212'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['213'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['231'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['311'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['322'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['322'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['322'][1].init(84, 13, 'v < minLength');
function visit22_322_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['311'][1].init(85, 13, 'v < minLength');
function visit21_311_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['231'][1].init(141, 8, 'autoHide');
function visit20_231_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['213'][1].init(290, 21, 'scrollType === \'left\'');
function visit19_213_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['212'][1].init(208, 21, 'scrollType === \'left\'');
function visit18_212_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['210'][1].init(77, 24, 'self.get(\'axis\') === \'x\'');
function visit17_210_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['196'][1].init(13, 14, 'self.hideTimer');
function visit16_196_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['179'][1].init(934, 15, 'val < minScroll');
function visit15_179_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['174'][1].init(632, 15, 'val > maxScroll');
function visit14_174_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['138'][2].init(205, 17, 'dragEl === target');
function visit13_138_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['138'][1].init(205, 45, 'dragEl === target || $dragEl.contains(target)');
function visit12_138_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['132'][1].init(38, 20, 'self.get(\'disabled\')');
function visit11_132_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['118'][2].init(270, 23, 'target === self.downBtn');
function visit10_118_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['118'][1].init(270, 57, 'target === self.downBtn || self.$downBtn.contains(target)');
function visit9_118_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['108'][1].init(13, 20, 'this.get(\'disabled\')');
function visit8_108_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['100'][1].init(264, 38, 'self.hideFn && !scrollView.isScrolling');
function visit7_100_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['95'][1].init(113, 40, '!scrollView.allowScroll[self.scrollType]');
function visit6_95_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['86'][1].init(38, 11, 'self.hideFn');
function visit5_86_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['68'][1].init(37, 22, 'whProperty === \'width\'');
function visit4_68_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['65'][1].init(403, 42, 'scrollView.allowScroll[control.scrollType]');
function visit3_65_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['28'][1].init(135, 20, 'self.get(\'disabled\')');
function visit2_28_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['24'][1].init(42, 10, '!e.isTouch');
function visit1_24_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var $document = Node.all(document);
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/control.js'].lineData[10]++;
  var ScrollBarRender = require('./render');
  _$jscoverage['/scrollbar/control.js'].lineData[12]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[14]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[16]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[18]++;
  function preventDefault(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[1]++;
    _$jscoverage['/scrollbar/control.js'].lineData[19]++;
    e.preventDefault();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[22]++;
  function onDragStartHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[2]++;
    _$jscoverage['/scrollbar/control.js'].lineData[23]++;
    e.stopPropagation();
    _$jscoverage['/scrollbar/control.js'].lineData[24]++;
    if (visit1_24_1(!e.isTouch)) {
      _$jscoverage['/scrollbar/control.js'].lineData[25]++;
      e.preventDefault();
    }
    _$jscoverage['/scrollbar/control.js'].lineData[27]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[28]++;
    if (visit2_28_1(self.get('disabled'))) {
      _$jscoverage['/scrollbar/control.js'].lineData[29]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[31]++;
    self.startMousePos = e[self.pageXyProperty];
    _$jscoverage['/scrollbar/control.js'].lineData[32]++;
    self.startScroll = self.scrollView.get(self.scrollProperty);
    _$jscoverage['/scrollbar/control.js'].lineData[35]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[38]++;
  function onDragHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[3]++;
    _$jscoverage['/scrollbar/control.js'].lineData[39]++;
    var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[44]++;
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[45]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[48]++;
  function onDragEndHandler() {
    _$jscoverage['/scrollbar/control.js'].functionData[4]++;
    _$jscoverage['/scrollbar/control.js'].lineData[50]++;
    $document.detach(Gesture.move, onDragHandler, this).detach(Gesture.end, onDragEndHandler, this);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[53]++;
  function onScrollViewReflow() {
    _$jscoverage['/scrollbar/control.js'].functionData[5]++;
    _$jscoverage['/scrollbar/control.js'].lineData[54]++;
    var control = this, scrollView = control.scrollView, trackEl = control.trackEl, scrollWHProperty = control.scrollWHProperty, whProperty = control.whProperty, clientWHProperty = control.clientWHProperty, dragWHProperty = control.dragWHProperty, ratio, trackElSize, barSize;
    _$jscoverage['/scrollbar/control.js'].lineData[65]++;
    if (visit3_65_1(scrollView.allowScroll[control.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[66]++;
      control.scrollLength = scrollView[scrollWHProperty];
      _$jscoverage['/scrollbar/control.js'].lineData[67]++;
      trackElSize = control.trackElSize = visit4_68_1(whProperty === 'width') ? trackEl.offsetWidth : trackEl.offsetHeight;
      _$jscoverage['/scrollbar/control.js'].lineData[69]++;
      ratio = scrollView[clientWHProperty] / control.scrollLength;
      _$jscoverage['/scrollbar/control.js'].lineData[70]++;
      barSize = ratio * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[71]++;
      control.set(dragWHProperty, barSize);
      _$jscoverage['/scrollbar/control.js'].lineData[72]++;
      control.barSize = barSize;
      _$jscoverage['/scrollbar/control.js'].lineData[73]++;
      syncOnScroll(control);
      _$jscoverage['/scrollbar/control.js'].lineData[74]++;
      control.set('visible', true);
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[76]++;
      control.set('visible', false);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[80]++;
  function onScrollViewDisabled(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[6]++;
    _$jscoverage['/scrollbar/control.js'].lineData[81]++;
    this.set('disabled', e.newVal);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[84]++;
  function onScrollEnd() {
    _$jscoverage['/scrollbar/control.js'].functionData[7]++;
    _$jscoverage['/scrollbar/control.js'].lineData[85]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[86]++;
    if (visit5_86_1(self.hideFn)) {
      _$jscoverage['/scrollbar/control.js'].lineData[87]++;
      startHideTimer(self);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[91]++;
  function afterScrollChange() {
    _$jscoverage['/scrollbar/control.js'].functionData[8]++;
    _$jscoverage['/scrollbar/control.js'].lineData[93]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[94]++;
    var scrollView = self.scrollView;
    _$jscoverage['/scrollbar/control.js'].lineData[95]++;
    if (visit6_95_1(!scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[96]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[98]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[99]++;
    self.set('visible', true);
    _$jscoverage['/scrollbar/control.js'].lineData[100]++;
    if (visit7_100_1(self.hideFn && !scrollView.isScrolling)) {
      _$jscoverage['/scrollbar/control.js'].lineData[101]++;
      startHideTimer(self);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[103]++;
    syncOnScroll(self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[107]++;
  function onUpDownBtnMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[9]++;
    _$jscoverage['/scrollbar/control.js'].lineData[108]++;
    if (visit8_108_1(this.get('disabled'))) {
      _$jscoverage['/scrollbar/control.js'].lineData[109]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[111]++;
    e.halt();
    _$jscoverage['/scrollbar/control.js'].lineData[112]++;
    var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit9_118_1(visit10_118_2(target === self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
    _$jscoverage['/scrollbar/control.js'].lineData[119]++;
    clearInterval(self.mouseInterval);
    _$jscoverage['/scrollbar/control.js'].lineData[120]++;
    function doScroll() {
      _$jscoverage['/scrollbar/control.js'].functionData[10]++;
      _$jscoverage['/scrollbar/control.js'].lineData[121]++;
      var scrollCfg = {};
      _$jscoverage['/scrollbar/control.js'].lineData[122]++;
      scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
      _$jscoverage['/scrollbar/control.js'].lineData[123]++;
      scrollView.scrollToWithBounds(scrollCfg);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[126]++;
    self.mouseInterval = setInterval(doScroll, 100);
    _$jscoverage['/scrollbar/control.js'].lineData[127]++;
    doScroll();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[130]++;
  function onTrackElMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[11]++;
    _$jscoverage['/scrollbar/control.js'].lineData[131]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[132]++;
    if (visit11_132_1(self.get('disabled'))) {
      _$jscoverage['/scrollbar/control.js'].lineData[133]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[135]++;
    var target = e.target;
    _$jscoverage['/scrollbar/control.js'].lineData[136]++;
    var dragEl = self.dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[137]++;
    var $dragEl = self.$dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[138]++;
    if (visit12_138_1(visit13_138_2(dragEl === target) || $dragEl.contains(target))) {
      _$jscoverage['/scrollbar/control.js'].lineData[139]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[141]++;
    var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[150]++;
    scrollCfg[scrollType] = per * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[151]++;
    scrollView.scrollToWithBounds(scrollCfg);
    _$jscoverage['/scrollbar/control.js'].lineData[153]++;
    e.halt();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[156]++;
  function onUpDownBtnMouseUp() {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[157]++;
    clearInterval(this.mouseInterval);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[160]++;
  function syncOnScroll(control) {
    _$jscoverage['/scrollbar/control.js'].functionData[13]++;
    _$jscoverage['/scrollbar/control.js'].lineData[161]++;
    var scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
    _$jscoverage['/scrollbar/control.js'].lineData[174]++;
    if (visit14_174_1(val > maxScroll)) {
      _$jscoverage['/scrollbar/control.js'].lineData[175]++;
      dragVal = maxScroll / contentSize * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[176]++;
      control.set(dragWHProperty, barSize - (val - maxScroll));
      _$jscoverage['/scrollbar/control.js'].lineData[178]++;
      control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[179]++;
      if (visit15_179_1(val < minScroll)) {
        _$jscoverage['/scrollbar/control.js'].lineData[180]++;
        dragVal = minScroll / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[181]++;
        control.set(dragWHProperty, barSize - (minScroll - val));
        _$jscoverage['/scrollbar/control.js'].lineData[182]++;
        control.set(dragLTProperty, dragVal);
      } else {
        _$jscoverage['/scrollbar/control.js'].lineData[184]++;
        dragVal = val / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[185]++;
        control.set(dragLTProperty, dragVal);
        _$jscoverage['/scrollbar/control.js'].lineData[186]++;
        control.set(dragWHProperty, barSize);
      }
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[190]++;
  function startHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[14]++;
    _$jscoverage['/scrollbar/control.js'].lineData[191]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[192]++;
    self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[195]++;
  function clearHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[15]++;
    _$jscoverage['/scrollbar/control.js'].lineData[196]++;
    if (visit16_196_1(self.hideTimer)) {
      _$jscoverage['/scrollbar/control.js'].lineData[197]++;
      clearTimeout(self.hideTimer);
      _$jscoverage['/scrollbar/control.js'].lineData[198]++;
      self.hideTimer = null;
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[207]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[209]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[210]++;
  var scrollType = self.scrollType = visit17_210_1(self.get('axis') === 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[211]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[212]++;
  self.pageXyProperty = visit18_212_1(scrollType === 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[213]++;
  var wh = self.whProperty = visit19_213_1(scrollType === 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[214]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[215]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[216]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[218]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[219]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[221]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[222]++;
  self.scrollWHProperty = 'scroll' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[224]++;
  self.scrollView = self.get('scrollView');
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[228]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[231]++;
  if (visit20_231_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[232]++;
    self.hideFn = S.bind(self.hide, self);
  } else {
    _$jscoverage['/scrollbar/control.js'].lineData[234]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[236]++;
  b.on(Gesture.start, onUpDownBtnMouseDown, self).on(Gesture.end, onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[238]++;
    self.$trackEl.on(Gesture.start, onTrackElMouseDown, self);
    _$jscoverage['/scrollbar/control.js'].lineData[240]++;
    self.$dragEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[246]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on('scrollEnd' + SCROLLBAR_EVENT_NS, onScrollEnd, self).on('afterDisabledChange' + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on('reflow' + SCROLLBAR_EVENT_NS, onScrollViewReflow, self);
}, 
  syncUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[250]++;
  onScrollViewReflow.call(this);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[254]++;
  this.scrollView.detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[255]++;
  clearHideTimer(this);
}}, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  axis: {
  view: 1}, 
  autoHide: {
  value: S.UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[21]++;
  _$jscoverage['/scrollbar/control.js'].lineData[292]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[22]++;
  _$jscoverage['/scrollbar/control.js'].lineData[309]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[311]++;
  if (visit21_311_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[312]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[314]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[23]++;
  _$jscoverage['/scrollbar/control.js'].lineData[321]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[322]++;
  if (visit22_322_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[323]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[325]++;
  return v;
}, 
  view: 1}, 
  dragLeft: {
  view: 1, 
  value: 0}, 
  dragTop: {
  view: 1, 
  value: 0}, 
  dragEl: {}, 
  downBtn: {}, 
  upBtn: {}, 
  trackEl: {}, 
  focusable: {
  value: false}, 
  xrender: {
  value: ScrollBarRender}}, 
  xclass: 'scrollbar'});
});
