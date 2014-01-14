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
  _$jscoverage['/navigation-view.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view.js'].lineData[19] = 0;
  _$jscoverage['/navigation-view.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[36] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view.js'].lineData[76] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[82] = 0;
  _$jscoverage['/navigation-view.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view.js'].lineData[94] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[98] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[115] = 0;
  _$jscoverage['/navigation-view.js'].lineData[117] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[126] = 0;
  _$jscoverage['/navigation-view.js'].lineData[127] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[145] = 0;
  _$jscoverage['/navigation-view.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view.js'].lineData[157] = 0;
  _$jscoverage['/navigation-view.js'].lineData[159] = 0;
  _$jscoverage['/navigation-view.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[168] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[170] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[172] = 0;
  _$jscoverage['/navigation-view.js'].lineData[173] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[175] = 0;
  _$jscoverage['/navigation-view.js'].lineData[176] = 0;
  _$jscoverage['/navigation-view.js'].lineData[183] = 0;
  _$jscoverage['/navigation-view.js'].lineData[185] = 0;
  _$jscoverage['/navigation-view.js'].lineData[189] = 0;
  _$jscoverage['/navigation-view.js'].lineData[191] = 0;
  _$jscoverage['/navigation-view.js'].lineData[192] = 0;
  _$jscoverage['/navigation-view.js'].lineData[193] = 0;
  _$jscoverage['/navigation-view.js'].lineData[194] = 0;
  _$jscoverage['/navigation-view.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view.js'].lineData[196] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view.js'].lineData[203] = 0;
  _$jscoverage['/navigation-view.js'].lineData[204] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[207] = 0;
  _$jscoverage['/navigation-view.js'].lineData[208] = 0;
  _$jscoverage['/navigation-view.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view.js'].lineData[210] = 0;
  _$jscoverage['/navigation-view.js'].lineData[217] = 0;
  _$jscoverage['/navigation-view.js'].lineData[218] = 0;
  _$jscoverage['/navigation-view.js'].lineData[219] = 0;
  _$jscoverage['/navigation-view.js'].lineData[220] = 0;
  _$jscoverage['/navigation-view.js'].lineData[221] = 0;
  _$jscoverage['/navigation-view.js'].lineData[222] = 0;
  _$jscoverage['/navigation-view.js'].lineData[230] = 0;
  _$jscoverage['/navigation-view.js'].lineData[231] = 0;
  _$jscoverage['/navigation-view.js'].lineData[232] = 0;
  _$jscoverage['/navigation-view.js'].lineData[233] = 0;
  _$jscoverage['/navigation-view.js'].lineData[234] = 0;
  _$jscoverage['/navigation-view.js'].lineData[241] = 0;
  _$jscoverage['/navigation-view.js'].lineData[244] = 0;
  _$jscoverage['/navigation-view.js'].lineData[245] = 0;
  _$jscoverage['/navigation-view.js'].lineData[246] = 0;
  _$jscoverage['/navigation-view.js'].lineData[247] = 0;
  _$jscoverage['/navigation-view.js'].lineData[250] = 0;
  _$jscoverage['/navigation-view.js'].lineData[251] = 0;
  _$jscoverage['/navigation-view.js'].lineData[253] = 0;
  _$jscoverage['/navigation-view.js'].lineData[254] = 0;
  _$jscoverage['/navigation-view.js'].lineData[255] = 0;
  _$jscoverage['/navigation-view.js'].lineData[256] = 0;
  _$jscoverage['/navigation-view.js'].lineData[257] = 0;
  _$jscoverage['/navigation-view.js'].lineData[258] = 0;
  _$jscoverage['/navigation-view.js'].lineData[259] = 0;
  _$jscoverage['/navigation-view.js'].lineData[260] = 0;
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
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['30'] = [];
  _$jscoverage['/navigation-view.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['38'] = [];
  _$jscoverage['/navigation-view.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['39'] = [];
  _$jscoverage['/navigation-view.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['40'] = [];
  _$jscoverage['/navigation-view.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['41'] = [];
  _$jscoverage['/navigation-view.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['55'] = [];
  _$jscoverage['/navigation-view.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['62'] = [];
  _$jscoverage['/navigation-view.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['76'] = [];
  _$jscoverage['/navigation-view.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['96'] = [];
  _$jscoverage['/navigation-view.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['114'] = [];
  _$jscoverage['/navigation-view.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['117'] = [];
  _$jscoverage['/navigation-view.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['120'] = [];
  _$jscoverage['/navigation-view.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['124'] = [];
  _$jscoverage['/navigation-view.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['134'] = [];
  _$jscoverage['/navigation-view.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['159'] = [];
  _$jscoverage['/navigation-view.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['162'] = [];
  _$jscoverage['/navigation-view.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['169'] = [];
  _$jscoverage['/navigation-view.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['172'] = [];
  _$jscoverage['/navigation-view.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['175'] = [];
  _$jscoverage['/navigation-view.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['191'] = [];
  _$jscoverage['/navigation-view.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['199'] = [];
  _$jscoverage['/navigation-view.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['203'] = [];
  _$jscoverage['/navigation-view.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['207'] = [];
  _$jscoverage['/navigation-view.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['217'] = [];
  _$jscoverage['/navigation-view.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['244'] = [];
  _$jscoverage['/navigation-view.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['251'] = [];
  _$jscoverage['/navigation-view.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['253'] = [];
  _$jscoverage['/navigation-view.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['256'] = [];
  _$jscoverage['/navigation-view.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['256'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['259'] = [];
  _$jscoverage['/navigation-view.js'].branchData['259'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['259'][1].init(156, 27, 'nextView.get(\'title\') || \'\'');
function visit56_259_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['256'][2].init(110, 33, 'activeView.uuid === nextView.uuid');
function visit55_256_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['256'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['256'][1].init(96, 47, 'activeView && activeView.uuid === nextView.uuid');
function visit54_256_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['253'][1].init(2721, 7, 'promise');
function visit53_253_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['251'][2].init(2675, 20, 'viewStack.length > 1');
function visit52_251_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['251'][1].init(2646, 27, 'nextView.get(\'title\') || \'\'');
function visit51_251_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['244'][1].init(26, 8, '!promise');
function visit50_244_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['217'][1].init(461, 7, 'promise');
function visit49_217_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['207'][1].init(668, 17, '!self.isLoading()');
function visit48_207_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['203'][1].init(522, 14, 'nextView.enter');
function visit47_203_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['199'][1].init(368, 30, 'activeView && activeView.leave');
function visit46_199_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['191'][1].init(93, 20, 'viewStack.length > 1');
function visit45_191_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['175'][1].init(144, 27, 'nextView.get(\'title\') || \'\'');
function visit44_175_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['172'][2].init(102, 33, 'activeView.uuid === nextView.uuid');
function visit43_172_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['172'][1].init(88, 47, 'activeView && activeView.uuid === nextView.uuid');
function visit42_172_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['169'][1].init(2589, 7, 'promise');
function visit41_169_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['162'][1].init(80, 8, '!promise');
function visit40_162_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['159'][1].init(1450, 27, 'nextView.get(\'title\') || \'\'');
function visit39_159_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['134'][1].init(410, 7, 'promise');
function visit38_134_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['124'][1].init(746, 17, '!self.isLoading()');
function visit37_124_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['120'][1].init(616, 14, 'nextView.enter');
function visit36_120_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['117'][1].init(535, 6, 'config');
function visit35_117_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['114'][1].init(432, 30, 'activeView && activeView.leave');
function visit34_114_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['96'][1].init(107, 9, '!nextView');
function visit33_96_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['76'][1].init(21, 40, 'this.loadingEl.css(\'display\') !== \'none\'');
function visit32_76_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['62'][1].init(387, 15, 'i < removedSize');
function visit31_62_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['55'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit30_55_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['41'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit29_41_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['40'][1].init(22, 6, 'viewId');
function visit28_40_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['39'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit27_39_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['38'][1].init(119, 19, 'i < children.length');
function visit26_38_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['30'][1].init(14, 28, 'e.target === this.get(\'bar\')');
function visit25_30_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var Bar = require('navigation-view/bar');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[11]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[17]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[19]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[21]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[24]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[25]++;
  this.control.loadingEl = loadingEl;
}});
  _$jscoverage['/navigation-view.js'].lineData[29]++;
  function onBack(e) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[30]++;
    if (visit25_30_1(e.target === this.get('bar'))) {
      _$jscoverage['/navigation-view.js'].lineData[31]++;
      this.pop();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[35]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[36]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[37]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[38]++;
    for (var i = 0; visit26_38_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[39]++;
      if (visit27_39_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[40]++;
        if (visit28_40_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[41]++;
          if (visit29_41_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[42]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[45]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[49]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[52]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[4]++;
    _$jscoverage['/navigation-view.js'].lineData[53]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[54]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    if (visit30_55_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[56]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[58]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[59]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[60]++;
  return a.uuid - b.uuid;
});
    _$jscoverage['/navigation-view.js'].lineData[62]++;
    for (var i = 0; visit31_62_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[63]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[67]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[69]++;
  this.publish('back', {
  defaultFn: onBack, 
  defaultTargetOnly: false});
}, 
  isLoading: function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[76]++;
  return visit32_76_1(this.loadingEl.css('display') !== 'none');
}, 
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[8]++;
  _$jscoverage['/navigation-view.js'].lineData[80]++;
  this.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[81]++;
  var bar;
  _$jscoverage['/navigation-view.js'].lineData[82]++;
  var barCfg = this.get('barCfg');
  _$jscoverage['/navigation-view.js'].lineData[83]++;
  barCfg.elBefore = this.get('el')[0].firstChild;
  _$jscoverage['/navigation-view.js'].lineData[84]++;
  this.setInternal('bar', bar = new Bar(barCfg).render());
  _$jscoverage['/navigation-view.js'].lineData[85]++;
  bar.addTarget(this);
}, 
  createView: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[9]++;
  _$jscoverage['/navigation-view.js'].lineData[94]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[95]++;
  var nextView = getViewInstance(self, config);
  _$jscoverage['/navigation-view.js'].lineData[96]++;
  if (visit33_96_1(!nextView)) {
    _$jscoverage['/navigation-view.js'].lineData[97]++;
    nextView = self.addChild(config);
    _$jscoverage['/navigation-view.js'].lineData[98]++;
    nextView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
  }
  _$jscoverage['/navigation-view.js'].lineData[100]++;
  return nextView;
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[10]++;
  _$jscoverage['/navigation-view.js'].lineData[104]++;
  var self = this, nextView, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[107]++;
  var bar = self.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[108]++;
  nextView = self.createView(config);
  _$jscoverage['/navigation-view.js'].lineData[109]++;
  var nextViewEl = nextView.get('el');
  _$jscoverage['/navigation-view.js'].lineData[110]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[111]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[112]++;
  var loadingEl = this.loadingEl;
  _$jscoverage['/navigation-view.js'].lineData[113]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[114]++;
  if (visit34_114_1(activeView && activeView.leave)) {
    _$jscoverage['/navigation-view.js'].lineData[115]++;
    activeView.leave();
  }
  _$jscoverage['/navigation-view.js'].lineData[117]++;
  if (visit35_117_1(config)) {
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    nextView.set(config);
  }
  _$jscoverage['/navigation-view.js'].lineData[120]++;
  if (visit36_120_1(nextView.enter)) {
    _$jscoverage['/navigation-view.js'].lineData[121]++;
    nextView.enter();
  }
  _$jscoverage['/navigation-view.js'].lineData[123]++;
  var promise = nextView.promise;
  _$jscoverage['/navigation-view.js'].lineData[124]++;
  if (visit37_124_1(!self.isLoading())) {
    _$jscoverage['/navigation-view.js'].lineData[125]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[126]++;
    activeEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[127]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[134]++;
    if (visit38_134_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[135]++;
      loadingEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[136]++;
      loadingEl.css('left', '100%');
      _$jscoverage['/navigation-view.js'].lineData[137]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[138]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[145]++;
      self.set('activeView', null);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[147]++;
      gc(self);
      _$jscoverage['/navigation-view.js'].lineData[148]++;
      nextViewEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[149]++;
      nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
      _$jscoverage['/navigation-view.js'].lineData[150]++;
      nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[157]++;
      self.set('activeView', nextView);
    }
    _$jscoverage['/navigation-view.js'].lineData[159]++;
    bar.forward(visit39_159_1(nextView.get('title') || ''));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[161]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[162]++;
    if (visit40_162_1(!promise)) {
      _$jscoverage['/navigation-view.js'].lineData[163]++;
      gc(self);
      _$jscoverage['/navigation-view.js'].lineData[164]++;
      nextView.get('el').css('transform', '');
      _$jscoverage['/navigation-view.js'].lineData[165]++;
      loadingEl.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[168]++;
  self.set('activeView', nextView);
  _$jscoverage['/navigation-view.js'].lineData[169]++;
  if (visit41_169_1(promise)) {
    _$jscoverage['/navigation-view.js'].lineData[170]++;
    promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[11]++;
  _$jscoverage['/navigation-view.js'].lineData[171]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[172]++;
  if (visit42_172_1(activeView && visit43_172_2(activeView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[173]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[174]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[175]++;
    bar.set('title', visit44_175_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[176]++;
    loadingEl.hide();
  }
});
  }
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[12]++;
  _$jscoverage['/navigation-view.js'].lineData[183]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[185]++;
  S.mix(viewStack[viewStack.length - 1], config);
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[13]++;
  _$jscoverage['/navigation-view.js'].lineData[189]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[191]++;
  if (visit45_191_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[192]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[193]++;
    var config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[194]++;
    var nextView = self.createView(config);
    _$jscoverage['/navigation-view.js'].lineData[195]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[196]++;
    var activeView = self.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[197]++;
    var loadingEl = self.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[198]++;
    var bar = self.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[199]++;
    if (visit46_199_1(activeView && activeView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[200]++;
      activeView.leave();
    }
    _$jscoverage['/navigation-view.js'].lineData[202]++;
    nextView.set(config);
    _$jscoverage['/navigation-view.js'].lineData[203]++;
    if (visit47_203_1(nextView.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[204]++;
      nextView.enter();
    }
    _$jscoverage['/navigation-view.js'].lineData[206]++;
    var promise = nextView.promise;
    _$jscoverage['/navigation-view.js'].lineData[207]++;
    if (visit48_207_1(!self.isLoading())) {
      _$jscoverage['/navigation-view.js'].lineData[208]++;
      var activeEl = activeView.get('el');
      _$jscoverage['/navigation-view.js'].lineData[209]++;
      activeEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[210]++;
      activeEl.animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[217]++;
      if (visit49_217_1(promise)) {
        _$jscoverage['/navigation-view.js'].lineData[218]++;
        self.set('activeView', null);
        _$jscoverage['/navigation-view.js'].lineData[219]++;
        loadingEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[220]++;
        loadingEl.css('left', '-100%');
        _$jscoverage['/navigation-view.js'].lineData[221]++;
        loadingEl.show();
        _$jscoverage['/navigation-view.js'].lineData[222]++;
        loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      } else {
        _$jscoverage['/navigation-view.js'].lineData[230]++;
        gc(self);
        _$jscoverage['/navigation-view.js'].lineData[231]++;
        var nextViewEl = nextView.get('el');
        _$jscoverage['/navigation-view.js'].lineData[232]++;
        nextViewEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[233]++;
        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
        _$jscoverage['/navigation-view.js'].lineData[234]++;
        nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
        _$jscoverage['/navigation-view.js'].lineData[241]++;
        self.set('activeView', nextView);
      }
    } else {
      _$jscoverage['/navigation-view.js'].lineData[244]++;
      if (visit50_244_1(!promise)) {
        _$jscoverage['/navigation-view.js'].lineData[245]++;
        gc(self);
        _$jscoverage['/navigation-view.js'].lineData[246]++;
        nextView.get('el').css('transform', '');
        _$jscoverage['/navigation-view.js'].lineData[247]++;
        loadingEl.hide();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[250]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[251]++;
    bar.back(visit51_251_1(nextView.get('title') || ''), visit52_251_2(viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[253]++;
    if (visit53_253_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[254]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[14]++;
  _$jscoverage['/navigation-view.js'].lineData[255]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[256]++;
  if (visit54_256_1(activeView && visit55_256_2(activeView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[257]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[258]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[259]++;
    bar.set('title', visit56_259_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[260]++;
    loadingEl.hide();
  }
});
    }
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  barCfg: {
  value: {}}, 
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
