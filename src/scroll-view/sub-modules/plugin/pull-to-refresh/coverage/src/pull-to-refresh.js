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
if (! _$jscoverage['/pull-to-refresh.js']) {
  _$jscoverage['/pull-to-refresh.js'] = {};
  _$jscoverage['/pull-to-refresh.js'].lineData = [];
  _$jscoverage['/pull-to-refresh.js'].lineData[6] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[7] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[8] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[9] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[10] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[11] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[12] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[13] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[15] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[16] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[17] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[19] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[22] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[30] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[34] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[38] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[42] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[46] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[47] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[51] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[55] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[59] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[60] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[61] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[63] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[64] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[65] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[66] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[68] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[69] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[70] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[76] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[77] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[78] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[80] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[81] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[82] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[83] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[84] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[85] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[86] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[87] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[89] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[91] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[94] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[100] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[102] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[103] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[104] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[105] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[107] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[109] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[112] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[118] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[122] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[123] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[128] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[129] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[130] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[132] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[134] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[135] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[136] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[137] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[139] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[141] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[148] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[149] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[150] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[151] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[152] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[154] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[155] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[157] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[158] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[159] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[168] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[170] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[171] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[172] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[177] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[178] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[179] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[180] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[184] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[185] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[186] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[188] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[189] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[191] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[192] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[193] = 0;
}
if (! _$jscoverage['/pull-to-refresh.js'].functionData) {
  _$jscoverage['/pull-to-refresh.js'].functionData = [];
  _$jscoverage['/pull-to-refresh.js'].functionData[0] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[1] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[2] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[3] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[4] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[5] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[6] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[7] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[8] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[9] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[10] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[11] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[12] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[13] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[14] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[15] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[16] = 0;
}
if (! _$jscoverage['/pull-to-refresh.js'].branchData) {
  _$jscoverage['/pull-to-refresh.js'].branchData = {};
  _$jscoverage['/pull-to-refresh.js'].branchData['13'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['16'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['60'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['64'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['65'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['66'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['68'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['69'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['70'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['77'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['84'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['102'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['122'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['130'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['134'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['136'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['139'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['151'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['154'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['185'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['188'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['188'][1] = new BranchData();
}
_$jscoverage['/pull-to-refresh.js'].branchData['188'][1].init(146, 19, 'self.get$El(\'down\')');
function visit24_188_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['185'][1].init(48, 17, 'self.get$El(\'up\')');
function visit23_185_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['154'][1].init(223, 26, 'self.get(\'pullDownLoadFn\')');
function visit22_154_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['151'][1].init(124, 24, 'self.get(\'pullUpLoadFn\')');
function visit21_151_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['139'][1].init(193, 10, 'v > maxTop');
function visit20_139_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['136'][1].init(83, 14, 'self.isLoading');
function visit19_136_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['134'][1].init(292, 17, 'self.get$El(\'up\')');
function visit18_134_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['130'][2].init(98, 5, 'v < 0');
function visit17_130_2(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['130'][1].init(75, 28, 'self.get$El(\'down\') && v < 0');
function visit16_130_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['122'][1].init(1968, 6, 'loadFn');
function visit15_122_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['102'][2].init(1118, 50, 'b > scrollView.maxScroll.top + self.pullupElHeight');
function visit14_102_2(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['102'][1].init(1097, 71, 'self.get$El(\'up\') && b > scrollView.maxScroll.top + self.pullupElHeight');
function visit13_102_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['84'][2].init(295, 26, 'b < -self.pulldownElHeight');
function visit12_84_2(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['84'][1].init(272, 49, 'self.get$El(\'down\') && b < -self.pulldownElHeight');
function visit11_84_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['77'][1].init(48, 14, 'self.isLoading');
function visit10_77_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['70'][1].init(47, 55, 'b < self.scrollView.maxScroll.top + self.pullupElHeight');
function visit9_70_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['69'][1].init(22, 17, 'self.get$El(\'up\')');
function visit8_69_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['68'][1].init(379, 33, 'b > self.scrollView.maxScroll.top');
function visit7_68_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['66'][1].init(49, 26, 'b > -self.pulldownElHeight');
function visit6_66_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['65'][1].init(22, 19, 'self.get$El(\'down\')');
function visit5_65_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['64'][1].init(178, 5, 'b < 0');
function visit4_64_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['60'][1].init(48, 14, 'self.isLoading');
function visit3_60_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['16'][1].init(27, 19, 'state === \'loading\'');
function visit2_16_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['13'][1].init(283, 55, 'transformVendorInfo && transformVendorInfo.propertyName');
function visit1_13_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/pull-to-refresh.js'].functionData[0]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[7]++;
  var Base = require('base');
  _$jscoverage['/pull-to-refresh.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/pull-to-refresh.js'].lineData[9]++;
  var util = require('util');
  _$jscoverage['/pull-to-refresh.js'].lineData[10]++;
  var $ = Node.all;
  _$jscoverage['/pull-to-refresh.js'].lineData[11]++;
  var substitute = require('util').substitute;
  _$jscoverage['/pull-to-refresh.js'].lineData[12]++;
  var transformVendorInfo = require('feature').getCssVendorInfo('transform');
  _$jscoverage['/pull-to-refresh.js'].lineData[13]++;
  var transformProperty = visit1_13_1(transformVendorInfo && transformVendorInfo.propertyName);
  _$jscoverage['/pull-to-refresh.js'].lineData[15]++;
  function setState(self, state, direction) {
    _$jscoverage['/pull-to-refresh.js'].functionData[1]++;
    _$jscoverage['/pull-to-refresh.js'].lineData[16]++;
    self.isLoading = visit2_16_1(state === 'loading');
    _$jscoverage['/pull-to-refresh.js'].lineData[17]++;
    var prefixCls = self.scrollView.get('prefixCls'), $el = self.get$El(direction);
    _$jscoverage['/pull-to-refresh.js'].lineData[19]++;
    $el.attr('class', prefixCls + 'scroll-view-pull-' + direction + '-to-refresh ' + prefixCls + 'scroll-view-' + state);
    _$jscoverage['/pull-to-refresh.js'].lineData[22]++;
    self.get$LabelEl(direction).html(self.getStateHtml(direction, state));
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[30]++;
  return Base.extend({
  pluginId: this.name, 
  get$El: function(direction) {
  _$jscoverage['/pull-to-refresh.js'].functionData[2]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[34]++;
  return this['$' + direction + 'El'];
}, 
  getEl: function(direction) {
  _$jscoverage['/pull-to-refresh.js'].functionData[3]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[38]++;
  return this.get$El(direction)[0];
}, 
  get$LabelEl: function(direction) {
  _$jscoverage['/pull-to-refresh.js'].functionData[4]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[42]++;
  return this['$' + direction + 'LabelEl'];
}, 
  getStateHtml: function(direction, state) {
  _$jscoverage['/pull-to-refresh.js'].functionData[5]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[46]++;
  direction = util.ucfirst(direction);
  _$jscoverage['/pull-to-refresh.js'].lineData[47]++;
  return this.get(state + direction + 'Html');
}, 
  _onSetPullUpState: function(state) {
  _$jscoverage['/pull-to-refresh.js'].functionData[6]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[51]++;
  setState(this, state, 'up');
}, 
  _onSetPullDownState: function(state) {
  _$jscoverage['/pull-to-refresh.js'].functionData[7]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[55]++;
  setState(this, state, 'down');
}, 
  _onScrollMove: function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[8]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[60]++;
  if (visit3_60_1(self.isLoading)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[61]++;
    return;
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[63]++;
  var b = self.scrollView.get('scrollTop');
  _$jscoverage['/pull-to-refresh.js'].lineData[64]++;
  if (visit4_64_1(b < 0)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[65]++;
    if (visit5_65_1(self.get$El('down'))) {
      _$jscoverage['/pull-to-refresh.js'].lineData[66]++;
      self.set('pullDownState', (visit6_66_1(b > -self.pulldownElHeight)) ? 'pulling' : 'releasing');
    }
  } else {
    _$jscoverage['/pull-to-refresh.js'].lineData[68]++;
    if (visit7_68_1(b > self.scrollView.maxScroll.top)) {
      _$jscoverage['/pull-to-refresh.js'].lineData[69]++;
      if (visit8_69_1(self.get$El('up'))) {
        _$jscoverage['/pull-to-refresh.js'].lineData[70]++;
        self.set('pullUpState', (visit9_70_1(b < self.scrollView.maxScroll.top + self.pullupElHeight)) ? 'pulling' : 'releasing');
      }
    }
  }
}, 
  _onDragEnd: function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[9]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[76]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[77]++;
  if (visit10_77_1(self.isLoading)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[78]++;
    return;
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[80]++;
  var loadFn;
  _$jscoverage['/pull-to-refresh.js'].lineData[81]++;
  var callback;
  _$jscoverage['/pull-to-refresh.js'].lineData[82]++;
  var scrollView = self.scrollView;
  _$jscoverage['/pull-to-refresh.js'].lineData[83]++;
  var b = scrollView.get('scrollTop');
  _$jscoverage['/pull-to-refresh.js'].lineData[84]++;
  if (visit11_84_1(self.get$El('down') && visit12_84_2(b < -self.pulldownElHeight))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[85]++;
    scrollView.minScroll.top = -self.pulldownElHeight;
    _$jscoverage['/pull-to-refresh.js'].lineData[86]++;
    loadFn = self.get('pullDownLoadFn');
    _$jscoverage['/pull-to-refresh.js'].lineData[87]++;
    self.set('pullDownState', 'loading');
    _$jscoverage['/pull-to-refresh.js'].lineData[89]++;
    callback = function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[10]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[91]++;
  scrollView.scrollTo({
  top: -self.pulldownElHeight});
  _$jscoverage['/pull-to-refresh.js'].lineData[94]++;
  scrollView.scrollTo({
  top: scrollView.minScroll.top}, {
  duration: scrollView.get('snapDuration'), 
  easing: scrollView.get('snapEasing')});
  _$jscoverage['/pull-to-refresh.js'].lineData[100]++;
  self.set('pullDownState', 'pulling');
};
  } else {
    _$jscoverage['/pull-to-refresh.js'].lineData[102]++;
    if (visit13_102_1(self.get$El('up') && visit14_102_2(b > scrollView.maxScroll.top + self.pullupElHeight))) {
      _$jscoverage['/pull-to-refresh.js'].lineData[103]++;
      scrollView.maxScroll.top += self.pullupElHeight;
      _$jscoverage['/pull-to-refresh.js'].lineData[104]++;
      loadFn = self.get('pullUpLoadFn');
      _$jscoverage['/pull-to-refresh.js'].lineData[105]++;
      self.set('pullUpState', 'loading');
      _$jscoverage['/pull-to-refresh.js'].lineData[107]++;
      callback = function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[11]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[109]++;
  scrollView.scrollTo({
  top: scrollView.maxScroll.top + self.pullupElHeight});
  _$jscoverage['/pull-to-refresh.js'].lineData[112]++;
  scrollView.scrollTo({
  top: scrollView.maxScroll.top}, {
  duration: scrollView.get('snapDuration'), 
  easing: scrollView.get('snapEasing')});
  _$jscoverage['/pull-to-refresh.js'].lineData[118]++;
  self.set('pullUpState', 'pulling');
};
    }
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[122]++;
  if (visit15_122_1(loadFn)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[123]++;
    loadFn.call(self, callback);
  }
}, 
  _onSetScrollTop: function(v) {
  _$jscoverage['/pull-to-refresh.js'].functionData[12]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[128]++;
  v = v.newVal;
  _$jscoverage['/pull-to-refresh.js'].lineData[129]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[130]++;
  if (visit16_130_1(self.get$El('down') && visit17_130_2(v < 0))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[132]++;
    self.getEl('down').style[transformProperty] = 'translate3d(0,' + -v + 'px,0)';
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[134]++;
  if (visit18_134_1(self.get$El('up'))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[135]++;
    var maxTop = self.scrollView.maxScroll.top;
    _$jscoverage['/pull-to-refresh.js'].lineData[136]++;
    if (visit19_136_1(self.isLoading)) {
      _$jscoverage['/pull-to-refresh.js'].lineData[137]++;
      maxTop -= self.pullupElHeight;
    }
    _$jscoverage['/pull-to-refresh.js'].lineData[139]++;
    if (visit20_139_1(v > maxTop)) {
      _$jscoverage['/pull-to-refresh.js'].lineData[141]++;
      self.getEl('up').style[transformProperty] = 'translate3d(0,' + (maxTop - v) + 'px,0)';
    }
  }
}, 
  pluginRenderUI: function(scrollView) {
  _$jscoverage['/pull-to-refresh.js'].functionData[13]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[148]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[149]++;
  self.scrollView = scrollView;
  _$jscoverage['/pull-to-refresh.js'].lineData[150]++;
  var direction = [];
  _$jscoverage['/pull-to-refresh.js'].lineData[151]++;
  if (visit21_151_1(self.get('pullUpLoadFn'))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[152]++;
    direction.push('up');
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[154]++;
  if (visit22_154_1(self.get('pullDownLoadFn'))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[155]++;
    direction.push('down');
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[157]++;
  var prefixCls = scrollView.get('prefixCls');
  _$jscoverage['/pull-to-refresh.js'].lineData[158]++;
  util.each(direction, function(d) {
  _$jscoverage['/pull-to-refresh.js'].functionData[14]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[159]++;
  var $el = $(substitute('<div class="{prefixCls}scroll-view-pull-{d}-to-refresh">' + '<div class="{prefixCls}scroll-view-pull-{d}-to-refresh-content">' + '<span class="{prefixCls}scroll-view-pull-{d}-icon"></span>' + '<span class="{prefixCls}scroll-view-pull-{d}-label"></span>' + '</div>' + '</div>', {
  prefixCls: prefixCls, 
  d: d}));
  _$jscoverage['/pull-to-refresh.js'].lineData[168]++;
  self['$' + d + 'LabelEl'] = $el.one('.' + prefixCls + 'scroll-view-pull-' + d + '-label');
  _$jscoverage['/pull-to-refresh.js'].lineData[170]++;
  scrollView.get('el').prepend($el);
  _$jscoverage['/pull-to-refresh.js'].lineData[171]++;
  self['$' + d + 'El'] = $el;
  _$jscoverage['/pull-to-refresh.js'].lineData[172]++;
  self['pull' + d + 'ElHeight'] = $el.height();
});
}, 
  pluginBindUI: function(scrollView) {
  _$jscoverage['/pull-to-refresh.js'].functionData[15]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[177]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[178]++;
  scrollView.on('touchMove', self._onScrollMove, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[179]++;
  scrollView.on('touchEnd', self._onDragEnd, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[180]++;
  scrollView.on('afterScrollTopChange', self._onSetScrollTop, self);
}, 
  pluginDestructor: function(scrollView) {
  _$jscoverage['/pull-to-refresh.js'].functionData[16]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[185]++;
  if (visit23_185_1(self.get$El('up'))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[186]++;
    self.get$El('up').remove();
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[188]++;
  if (visit24_188_1(self.get$El('down'))) {
    _$jscoverage['/pull-to-refresh.js'].lineData[189]++;
    self.get$El('down').remove();
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[191]++;
  scrollView.detach('touchMove', self._onScrollMove, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[192]++;
  scrollView.detach('touchEnd', self._onDragEnd, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[193]++;
  scrollView.detach('afterScrollTopChange', self._onSetScrollTop, self);
}}, {
  ATTRS: {
  pullingDownHtml: {
  value: 'Pull down to refresh...'}, 
  pullingUpHtml: {
  value: 'Pull up to refresh...'}, 
  releasingUpHtml: {
  value: 'release to refresh...'}, 
  releasingDownHtml: {
  value: 'release to refresh...'}, 
  loadingUpHtml: {
  value: 'loading...'}, 
  loadingDownHtml: {
  value: 'loading...'}, 
  pullUpLoadFn: {}, 
  pullDownLoadFn: {}, 
  pullUpState: {}, 
  pullDownState: {}}});
});
