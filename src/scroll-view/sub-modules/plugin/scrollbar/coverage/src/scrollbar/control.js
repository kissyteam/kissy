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
  _$jscoverage['/scrollbar/control.js'].lineData[20] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[88] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[103] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[104] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[121] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[131] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[140] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[154] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[155] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[156] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[158] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[159] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[160] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[161] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[162] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[164] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[165] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[166] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[170] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[171] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[172] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[176] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[177] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[178] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[187] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[189] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[190] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[191] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[192] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[193] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[194] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[195] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[196] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[198] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[199] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[201] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[202] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[204] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[208] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[209] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[210] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[213] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[214] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[216] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[218] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[223] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[226] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[227] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[233] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[237] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[241] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[242] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[279] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[296] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[298] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[299] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[301] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[308] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[309] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[310] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[312] = 0;
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
  _$jscoverage['/scrollbar/control.js'].branchData['32'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['52'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['55'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['73'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['82'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['87'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['101'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['118'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['154'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['159'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['176'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['190'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['192'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['193'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['210'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['226'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['298'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['309'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['309'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['309'][1].init(84, 13, 'v < minLength');
function visit20_309_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['298'][1].init(85, 13, 'v < minLength');
function visit19_298_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['226'][1].init(141, 8, 'autoHide');
function visit18_226_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['210'][1].init(92, 21, '!self.get(\'autoHide\')');
function visit17_210_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['193'][1].init(290, 21, 'scrollType === \'left\'');
function visit16_193_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['192'][1].init(208, 21, 'scrollType === \'left\'');
function visit15_192_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['190'][1].init(77, 24, 'self.get(\'axis\') === \'x\'');
function visit14_190_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['176'][1].init(13, 14, 'self.hideTimer');
function visit13_176_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['159'][1].init(934, 15, 'val < minScroll');
function visit12_159_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['154'][1].init(632, 15, 'val > maxScroll');
function visit11_154_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['118'][2].init(139, 17, 'dragEl === target');
function visit10_118_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['118'][1].init(139, 45, 'dragEl === target || $dragEl.contains(target)');
function visit9_118_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['101'][2].init(270, 23, 'target === self.downBtn');
function visit8_101_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['101'][1].init(270, 57, 'target === self.downBtn || self.$downBtn.contains(target)');
function visit7_101_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['87'][1].init(264, 38, 'self.hideFn && !scrollView.isScrolling');
function visit6_87_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['82'][1].init(113, 40, '!scrollView.allowScroll[self.scrollType]');
function visit5_82_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['73'][1].init(38, 11, 'self.hideFn');
function visit4_73_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['55'][1].init(34, 22, 'whProperty === \'width\'');
function visit3_55_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['52'][1].init(382, 39, 'scrollView.allowScroll[self.scrollType]');
function visit2_52_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['32'][1].init(35, 31, 'self.pageXyProperty === \'pageX\'');
function visit1_32_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var UA = require('ua');
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/control.js'].lineData[10]++;
  var ScrollBarRender = require('./render');
  _$jscoverage['/scrollbar/control.js'].lineData[12]++;
  var DragType = require('event/gesture/drag');
  _$jscoverage['/scrollbar/control.js'].lineData[14]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[16]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[18]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[20]++;
  function preventDefault(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[1]++;
    _$jscoverage['/scrollbar/control.js'].lineData[21]++;
    e.preventDefault();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[24]++;
  function onDragStartHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[2]++;
    _$jscoverage['/scrollbar/control.js'].lineData[25]++;
    e.stopPropagation();
    _$jscoverage['/scrollbar/control.js'].lineData[26]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[27]++;
    self.startScroll = self.scrollView.get(self.scrollProperty);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[30]++;
  function onDragHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[3]++;
    _$jscoverage['/scrollbar/control.js'].lineData[31]++;
    var self = this, diff = visit1_32_1(self.pageXyProperty === 'pageX') ? e.deltaX : e.deltaY, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[36]++;
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[37]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[40]++;
  function onScrollViewReflow() {
    _$jscoverage['/scrollbar/control.js'].functionData[4]++;
    _$jscoverage['/scrollbar/control.js'].lineData[41]++;
    var self = this, scrollView = self.scrollView, trackEl = self.trackEl, scrollWHProperty = self.scrollWHProperty, whProperty = self.whProperty, clientWHProperty = self.clientWHProperty, dragWHProperty = self.dragWHProperty, ratio, trackElSize, barSize;
    _$jscoverage['/scrollbar/control.js'].lineData[52]++;
    if (visit2_52_1(scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[53]++;
      self.scrollLength = scrollView[scrollWHProperty];
      _$jscoverage['/scrollbar/control.js'].lineData[54]++;
      trackElSize = self.trackElSize = visit3_55_1(whProperty === 'width') ? trackEl.offsetWidth : trackEl.offsetHeight;
      _$jscoverage['/scrollbar/control.js'].lineData[56]++;
      ratio = scrollView[clientWHProperty] / self.scrollLength;
      _$jscoverage['/scrollbar/control.js'].lineData[57]++;
      barSize = ratio * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[58]++;
      self.set(dragWHProperty, barSize);
      _$jscoverage['/scrollbar/control.js'].lineData[59]++;
      self.barSize = barSize;
      _$jscoverage['/scrollbar/control.js'].lineData[60]++;
      syncOnScroll(self);
      _$jscoverage['/scrollbar/control.js'].lineData[61]++;
      self.set('visible', true);
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[63]++;
      self.set('visible', false);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[67]++;
  function onScrollViewDisabled(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[5]++;
    _$jscoverage['/scrollbar/control.js'].lineData[68]++;
    this.set('disabled', e.newVal);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[71]++;
  function onScrollEnd() {
    _$jscoverage['/scrollbar/control.js'].functionData[6]++;
    _$jscoverage['/scrollbar/control.js'].lineData[72]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[73]++;
    if (visit4_73_1(self.hideFn)) {
      _$jscoverage['/scrollbar/control.js'].lineData[74]++;
      startHideTimer(self);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[78]++;
  function afterScrollChange() {
    _$jscoverage['/scrollbar/control.js'].functionData[7]++;
    _$jscoverage['/scrollbar/control.js'].lineData[80]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[81]++;
    var scrollView = self.scrollView;
    _$jscoverage['/scrollbar/control.js'].lineData[82]++;
    if (visit5_82_1(!scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[83]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[85]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[86]++;
    self.set('visible', true);
    _$jscoverage['/scrollbar/control.js'].lineData[87]++;
    if (visit6_87_1(self.hideFn && !scrollView.isScrolling)) {
      _$jscoverage['/scrollbar/control.js'].lineData[88]++;
      startHideTimer(self);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[90]++;
    syncOnScroll(self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[93]++;
  function onUpDownBtnMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[8]++;
    _$jscoverage['/scrollbar/control.js'].lineData[94]++;
    e.halt();
    _$jscoverage['/scrollbar/control.js'].lineData[95]++;
    var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit7_101_1(visit8_101_2(target === self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
    _$jscoverage['/scrollbar/control.js'].lineData[102]++;
    clearInterval(self.mouseInterval);
    _$jscoverage['/scrollbar/control.js'].lineData[103]++;
    function doScroll() {
      _$jscoverage['/scrollbar/control.js'].functionData[9]++;
      _$jscoverage['/scrollbar/control.js'].lineData[104]++;
      var scrollCfg = {};
      _$jscoverage['/scrollbar/control.js'].lineData[105]++;
      scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
      _$jscoverage['/scrollbar/control.js'].lineData[106]++;
      scrollView.scrollToWithBounds(scrollCfg);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[109]++;
    self.mouseInterval = setInterval(doScroll, 100);
    _$jscoverage['/scrollbar/control.js'].lineData[110]++;
    doScroll();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[113]++;
  function onTrackElMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[10]++;
    _$jscoverage['/scrollbar/control.js'].lineData[114]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[115]++;
    var target = e.target;
    _$jscoverage['/scrollbar/control.js'].lineData[116]++;
    var dragEl = self.dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[117]++;
    var $dragEl = self.$dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[118]++;
    if (visit9_118_1(visit10_118_2(dragEl === target) || $dragEl.contains(target))) {
      _$jscoverage['/scrollbar/control.js'].lineData[119]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[121]++;
    var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[130]++;
    scrollCfg[scrollType] = per * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[131]++;
    scrollView.scrollToWithBounds(scrollCfg);
    _$jscoverage['/scrollbar/control.js'].lineData[133]++;
    e.halt();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[136]++;
  function onUpDownBtnMouseUp() {
    _$jscoverage['/scrollbar/control.js'].functionData[11]++;
    _$jscoverage['/scrollbar/control.js'].lineData[137]++;
    clearInterval(this.mouseInterval);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[140]++;
  function syncOnScroll(control) {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[141]++;
    var scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
    _$jscoverage['/scrollbar/control.js'].lineData[154]++;
    if (visit11_154_1(val > maxScroll)) {
      _$jscoverage['/scrollbar/control.js'].lineData[155]++;
      dragVal = maxScroll / contentSize * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[156]++;
      control.set(dragWHProperty, barSize - (val - maxScroll));
      _$jscoverage['/scrollbar/control.js'].lineData[158]++;
      control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[159]++;
      if (visit12_159_1(val < minScroll)) {
        _$jscoverage['/scrollbar/control.js'].lineData[160]++;
        dragVal = minScroll / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[161]++;
        control.set(dragWHProperty, barSize - (minScroll - val));
        _$jscoverage['/scrollbar/control.js'].lineData[162]++;
        control.set(dragLTProperty, dragVal);
      } else {
        _$jscoverage['/scrollbar/control.js'].lineData[164]++;
        dragVal = val / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[165]++;
        control.set(dragLTProperty, dragVal);
        _$jscoverage['/scrollbar/control.js'].lineData[166]++;
        control.set(dragWHProperty, barSize);
      }
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[170]++;
  function startHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[13]++;
    _$jscoverage['/scrollbar/control.js'].lineData[171]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[172]++;
    self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[175]++;
  function clearHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[14]++;
    _$jscoverage['/scrollbar/control.js'].lineData[176]++;
    if (visit13_176_1(self.hideTimer)) {
      _$jscoverage['/scrollbar/control.js'].lineData[177]++;
      clearTimeout(self.hideTimer);
      _$jscoverage['/scrollbar/control.js'].lineData[178]++;
      self.hideTimer = null;
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[187]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[189]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[190]++;
  var scrollType = self.scrollType = visit14_190_1(self.get('axis') === 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[191]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[192]++;
  self.pageXyProperty = visit15_192_1(scrollType === 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[193]++;
  var wh = self.whProperty = visit16_193_1(scrollType === 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[194]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[195]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[196]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[198]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[199]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[201]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[202]++;
  self.scrollWHProperty = 'scroll' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[204]++;
  self.scrollView = self.get('scrollView');
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[208]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[209]++;
  var action = v ? 'detach' : 'on';
  _$jscoverage['/scrollbar/control.js'].lineData[210]++;
  if (visit17_210_1(!self.get('autoHide'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[213]++;
    self.$dragEl[action]('dragstart mousedown', preventDefault)[action](DragType.DRAG_START, onDragStartHandler, self)[action](DragType.DRAG, onDragHandler, self);
    _$jscoverage['/scrollbar/control.js'].lineData[214]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[216]++;
  b[action](Gesture.start, onUpDownBtnMouseDown, self)[action](Gesture.end, onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[218]++;
    self.$trackEl[action](Gesture.start, onTrackElMouseDown, self);
  }
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[223]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[226]++;
  if (visit18_226_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[227]++;
    self.hideFn = S.bind(self.hide, self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[233]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on('scrollTouchEnd' + SCROLLBAR_EVENT_NS, onScrollEnd, self).on('afterDisabledChange' + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on('reflow' + SCROLLBAR_EVENT_NS, onScrollViewReflow, self);
}, 
  syncUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[237]++;
  onScrollViewReflow.call(this);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[241]++;
  this.scrollView.detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[242]++;
  clearHideTimer(this);
}}, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  axis: {
  view: 1}, 
  autoHide: {
  value: UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[21]++;
  _$jscoverage['/scrollbar/control.js'].lineData[279]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[22]++;
  _$jscoverage['/scrollbar/control.js'].lineData[296]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[298]++;
  if (visit19_298_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[299]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[301]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[23]++;
  _$jscoverage['/scrollbar/control.js'].lineData[308]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[309]++;
  if (visit20_309_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[310]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[312]++;
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
