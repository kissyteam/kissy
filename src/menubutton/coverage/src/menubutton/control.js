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
if (! _$jscoverage['/menubutton/control.js']) {
  _$jscoverage['/menubutton/control.js'] = {};
  _$jscoverage['/menubutton/control.js'].lineData = [];
  _$jscoverage['/menubutton/control.js'].lineData[6] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[7] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[8] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[9] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[10] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[11] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[19] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[23] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[25] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[26] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[27] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[28] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[30] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[37] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[44] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[46] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[47] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[48] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[49] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[50] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[52] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[55] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[63] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[64] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[65] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[66] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[67] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[70] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[72] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[73] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[79] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[80] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[82] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[95] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[101] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[103] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[104] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[105] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[107] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[108] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[111] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[112] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[114] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[115] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[116] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[118] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[122] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[125] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[126] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[128] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[139] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[142] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[154] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[155] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[157] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[166] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[167] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[176] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[177] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[185] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[186] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[187] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[188] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[189] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[190] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[200] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[201] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[206] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[207] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[208] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[213] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[258] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[259] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[260] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[261] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[263] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[266] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[267] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[292] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[293] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[294] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[298] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[299] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[300] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[302] = 0;
}
if (! _$jscoverage['/menubutton/control.js'].functionData) {
  _$jscoverage['/menubutton/control.js'].functionData = [];
  _$jscoverage['/menubutton/control.js'].functionData[0] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[1] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[2] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[3] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[4] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[5] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[6] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[7] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[8] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[9] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[10] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[11] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[12] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[13] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[14] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[15] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[16] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[17] = 0;
}
if (! _$jscoverage['/menubutton/control.js'].branchData) {
  _$jscoverage['/menubutton/control.js'].branchData = {};
  _$jscoverage['/menubutton/control.js'].branchData['49'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['52'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['64'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['68'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['69'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['101'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['104'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['107'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['111'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['114'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['122'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['123'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['124'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['186'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['187'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['189'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['201'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['207'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['258'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['259'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['266'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['293'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['299'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['302'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['302'][2] = new BranchData();
}
_$jscoverage['/menubutton/control.js'].branchData['302'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit27_302_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['302'][1].init(124, 32, 'menuItem && menuItem.el.id || \'\'');
function visit26_302_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['299'][1].init(14, 15, 'e.target.isMenu');
function visit25_299_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['293'][1].init(14, 50, 'e.target.isMenuItem && this.get(\'collapseOnClick\')');
function visit24_293_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['266'][1].init(26, 11, 'm.isControl');
function visit23_266_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['259'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit22_259_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['258'][1].init(26, 12, '!v.isControl');
function visit21_258_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['207'][1].init(50, 2, '!v');
function visit20_207_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['201'][1].init(63, 46, 'menu.get(\'rendered\') && menu.getChildAt(index)');
function visit19_201_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['189'][1].init(125, 13, 'menu.children');
function visit18_189_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['187'][1].init(22, 19, 'menu.removeChildren');
function visit17_187_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['186'][1].init(60, 4, 'menu');
function visit16_186_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['124'][1].init(44, 22, 'keyCode === KeyCode.UP');
function visit15_124_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['123'][2].init(1058, 24, 'keyCode === KeyCode.DOWN');
function visit14_123_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['123'][1].init(45, 67, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit13_123_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['122'][2].init(1010, 25, 'keyCode === KeyCode.SPACE');
function visit12_122_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['122'][1].init(1010, 113, 'keyCode === KeyCode.SPACE || keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit11_122_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['114'][1].init(114, 23, 'keyCode === KeyCode.ESC');
function visit10_114_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['111'][1].init(564, 43, 'menu.get(\'rendered\') && menu.get(\'visible\')');
function visit9_111_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['107'][1].init(449, 18, 'type !== \'keydown\'');
function visit8_107_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['104'][1].init(113, 16, 'type !== \'keyup\'');
function visit7_104_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['101'][1].init(205, 25, 'keyCode === KeyCode.SPACE');
function visit6_101_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['69'][1].init(81, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit5_69_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['68'][1].init(43, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit4_68_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['64'][1].init(490, 24, 'self.get(\'matchElWidth\')');
function visit3_64_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['52'][1].init(22, 20, '!menu.get(\'visible\')');
function visit2_52_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['49'][1].init(255, 1, 'v');
function visit1_49_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menubutton/control.js'].functionData[0]++;
  _$jscoverage['/menubutton/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/menubutton/control.js'].lineData[8]++;
  var Button = require('button');
  _$jscoverage['/menubutton/control.js'].lineData[9]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/menubutton/control.js'].lineData[10]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/menubutton/control.js'].lineData[11]++;
  var MenuButtonTpl = require('./menubutton-xtpl');
  _$jscoverage['/menubutton/control.js'].lineData[19]++;
  return Button.extend([ContentBox], {
  isMenuButton: 1, 
  decorateDom: function(el) {
  _$jscoverage['/menubutton/control.js'].functionData[1]++;
  _$jscoverage['/menubutton/control.js'].lineData[23]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/menubutton/control.js'].lineData[25]++;
  var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
  _$jscoverage['/menubutton/control.js'].lineData[26]++;
  var docBody = popupMenuEl[0].ownerDocument.body;
  _$jscoverage['/menubutton/control.js'].lineData[27]++;
  docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
  _$jscoverage['/menubutton/control.js'].lineData[28]++;
  var PopupMenuClass = this.getComponentConstructorByNode(prefixCls, popupMenuEl);
  _$jscoverage['/menubutton/control.js'].lineData[30]++;
  self.setInternal('menu', new PopupMenuClass({
  srcNode: popupMenuEl, 
  prefixCls: prefixCls}));
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/menubutton/control.js'].functionData[2]++;
  _$jscoverage['/menubutton/control.js'].lineData[37]++;
  S.mix(renderData.elAttrs, {
  'aria-expanded': false, 
  'aria-haspopup': true});
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[3]++;
  _$jscoverage['/menubutton/control.js'].lineData[44]++;
  var self = this, menu = self.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[46]++;
  var el = self.$el;
  _$jscoverage['/menubutton/control.js'].lineData[47]++;
  var cls = self.getBaseCssClass('open');
  _$jscoverage['/menubutton/control.js'].lineData[48]++;
  el[v ? 'removeClass' : 'addClass'](cls).attr('aria-expanded', !v);
  _$jscoverage['/menubutton/control.js'].lineData[49]++;
  if (visit1_49_1(v)) {
    _$jscoverage['/menubutton/control.js'].lineData[50]++;
    menu.hide();
  } else {
    _$jscoverage['/menubutton/control.js'].lineData[52]++;
    if (visit2_52_1(!menu.get('visible'))) {
      _$jscoverage['/menubutton/control.js'].lineData[55]++;
      var align = {
  node: el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
      _$jscoverage['/menubutton/control.js'].lineData[63]++;
      S.mix(menu.get('align'), align, false);
      _$jscoverage['/menubutton/control.js'].lineData[64]++;
      if (visit3_64_1(self.get('matchElWidth'))) {
        _$jscoverage['/menubutton/control.js'].lineData[65]++;
        menu.render();
        _$jscoverage['/menubutton/control.js'].lineData[66]++;
        var menuEl = menu.get('el');
        _$jscoverage['/menubutton/control.js'].lineData[67]++;
        var borderWidth = (visit4_68_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit5_69_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/menubutton/control.js'].lineData[70]++;
        menu.set('width', menu.get('align').node[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/menubutton/control.js'].lineData[72]++;
      menu.show();
      _$jscoverage['/menubutton/control.js'].lineData[73]++;
      el.attr('aria-haspopup', menu.get('el').attr('id'));
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/menubutton/control.js'].functionData[4]++;
  _$jscoverage['/menubutton/control.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[80]++;
  self.on('afterHighlightedItemChange', onMenuAfterHighlightedItemChange, self);
  _$jscoverage['/menubutton/control.js'].lineData[82]++;
  self.on('click', onMenuItemClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menubutton/control.js'].functionData[5]++;
  _$jscoverage['/menubutton/control.js'].lineData[95]++;
  var self = this, keyCode = e.keyCode, type = String(e.type), menu = self.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[101]++;
  if (visit6_101_1(keyCode === KeyCode.SPACE)) {
    _$jscoverage['/menubutton/control.js'].lineData[103]++;
    e.preventDefault();
    _$jscoverage['/menubutton/control.js'].lineData[104]++;
    if (visit7_104_1(type !== 'keyup')) {
      _$jscoverage['/menubutton/control.js'].lineData[105]++;
      return undefined;
    }
  } else {
    _$jscoverage['/menubutton/control.js'].lineData[107]++;
    if (visit8_107_1(type !== 'keydown')) {
      _$jscoverage['/menubutton/control.js'].lineData[108]++;
      return undefined;
    }
  }
  _$jscoverage['/menubutton/control.js'].lineData[111]++;
  if (visit9_111_1(menu.get('rendered') && menu.get('visible'))) {
    _$jscoverage['/menubutton/control.js'].lineData[112]++;
    var handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/menubutton/control.js'].lineData[114]++;
    if (visit10_114_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/menubutton/control.js'].lineData[115]++;
      self.set('collapsed', true);
      _$jscoverage['/menubutton/control.js'].lineData[116]++;
      return true;
    }
    _$jscoverage['/menubutton/control.js'].lineData[118]++;
    return handledByMenu;
  }
  _$jscoverage['/menubutton/control.js'].lineData[122]++;
  if (visit11_122_1(visit12_122_2(keyCode === KeyCode.SPACE) || visit13_123_1(visit14_123_2(keyCode === KeyCode.DOWN) || visit15_124_1(keyCode === KeyCode.UP)))) {
    _$jscoverage['/menubutton/control.js'].lineData[125]++;
    self.set('collapsed', false);
    _$jscoverage['/menubutton/control.js'].lineData[126]++;
    return true;
  }
  _$jscoverage['/menubutton/control.js'].lineData[128]++;
  return undefined;
}, 
  handleClickInternal: function() {
  _$jscoverage['/menubutton/control.js'].functionData[6]++;
  _$jscoverage['/menubutton/control.js'].lineData[139]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[142]++;
  self.set('collapsed', !self.get('collapsed'));
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menubutton/control.js'].functionData[7]++;
  _$jscoverage['/menubutton/control.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[155]++;
  self.callSuper(e);
  _$jscoverage['/menubutton/control.js'].lineData[157]++;
  self.set('collapsed', true);
}, 
  addItem: function(item, index) {
  _$jscoverage['/menubutton/control.js'].functionData[8]++;
  _$jscoverage['/menubutton/control.js'].lineData[166]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[167]++;
  menu.addChild(item, index);
}, 
  removeItem: function(c, destroy) {
  _$jscoverage['/menubutton/control.js'].functionData[9]++;
  _$jscoverage['/menubutton/control.js'].lineData[176]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[177]++;
  menu.removeChild(c, destroy);
}, 
  removeItems: function(destroy) {
  _$jscoverage['/menubutton/control.js'].functionData[10]++;
  _$jscoverage['/menubutton/control.js'].lineData[185]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[186]++;
  if (visit16_186_1(menu)) {
    _$jscoverage['/menubutton/control.js'].lineData[187]++;
    if (visit17_187_1(menu.removeChildren)) {
      _$jscoverage['/menubutton/control.js'].lineData[188]++;
      menu.removeChildren(destroy);
    } else {
      _$jscoverage['/menubutton/control.js'].lineData[189]++;
      if (visit18_189_1(menu.children)) {
        _$jscoverage['/menubutton/control.js'].lineData[190]++;
        menu.children = [];
      }
    }
  }
}, 
  getItemAt: function(index) {
  _$jscoverage['/menubutton/control.js'].functionData[11]++;
  _$jscoverage['/menubutton/control.js'].lineData[200]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[201]++;
  return visit19_201_1(menu.get('rendered') && menu.getChildAt(index));
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[12]++;
  _$jscoverage['/menubutton/control.js'].lineData[206]++;
  this.callSuper(v);
  _$jscoverage['/menubutton/control.js'].lineData[207]++;
  if (visit20_207_1(!v)) {
    _$jscoverage['/menubutton/control.js'].lineData[208]++;
    this.set('collapsed', true);
  }
}, 
  destructor: function() {
  _$jscoverage['/menubutton/control.js'].functionData[13]++;
  _$jscoverage['/menubutton/control.js'].lineData[213]++;
  this.get('menu').destroy();
}}, {
  ATTRS: {
  matchElWidth: {
  value: true}, 
  collapseOnClick: {
  value: false}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[14]++;
  _$jscoverage['/menubutton/control.js'].lineData[258]++;
  if (visit21_258_1(!v.isControl)) {
    _$jscoverage['/menubutton/control.js'].lineData[259]++;
    v.xclass = visit22_259_1(v.xclass || 'popupmenu');
    _$jscoverage['/menubutton/control.js'].lineData[260]++;
    v = this.createComponent(v);
    _$jscoverage['/menubutton/control.js'].lineData[261]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/menubutton/control.js'].lineData[263]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/menubutton/control.js'].functionData[15]++;
  _$jscoverage['/menubutton/control.js'].lineData[266]++;
  if (visit23_266_1(m.isControl)) {
    _$jscoverage['/menubutton/control.js'].lineData[267]++;
    m.setInternal('parent', this);
  }
}}, 
  collapsed: {
  value: true, 
  render: 1, 
  sync: 0}, 
  contentTpl: {
  value: MenuButtonTpl}}, 
  xclass: 'menu-button'});
  _$jscoverage['/menubutton/control.js'].lineData[292]++;
  function onMenuItemClick(e) {
    _$jscoverage['/menubutton/control.js'].functionData[16]++;
    _$jscoverage['/menubutton/control.js'].lineData[293]++;
    if (visit24_293_1(e.target.isMenuItem && this.get('collapseOnClick'))) {
      _$jscoverage['/menubutton/control.js'].lineData[294]++;
      this.set('collapsed', true);
    }
  }
  _$jscoverage['/menubutton/control.js'].lineData[298]++;
  function onMenuAfterHighlightedItemChange(e) {
    _$jscoverage['/menubutton/control.js'].functionData[17]++;
    _$jscoverage['/menubutton/control.js'].lineData[299]++;
    if (visit25_299_1(e.target.isMenu)) {
      _$jscoverage['/menubutton/control.js'].lineData[300]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menubutton/control.js'].lineData[302]++;
      el.setAttribute('aria-activedescendant', visit26_302_1(visit27_302_2(menuItem && menuItem.el.id) || ''));
    }
  }
});
