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
if (! _$jscoverage['/mvc/collection.js']) {
  _$jscoverage['/mvc/collection.js'] = {};
  _$jscoverage['/mvc/collection.js'].lineData = [];
  _$jscoverage['/mvc/collection.js'].lineData[5] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[7] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[8] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[9] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[10] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[11] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[12] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[13] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[14] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[18] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[26] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[31] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[32] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[33] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[34] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[44] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[45] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[56] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[58] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[59] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[60] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[61] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[62] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[65] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[67] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[77] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[78] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[79] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[80] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[81] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[83] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[84] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[93] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[97] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[98] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[99] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[101] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[102] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[106] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[118] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[119] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[120] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[124] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[125] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[126] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[127] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[128] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[132] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[133] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[135] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[137] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[138] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[151] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[152] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[153] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[154] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[155] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[156] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[157] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[158] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[159] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[161] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[163] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[167] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[168] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[169] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[170] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[171] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[172] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[173] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[174] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[179] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[187] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[188] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[189] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[190] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[191] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[193] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[194] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[205] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[206] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[207] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[208] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[209] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[212] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[220] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[221] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[222] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[223] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[224] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[227] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[249] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[250] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[251] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[252] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[276] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[286] = 0;
}
if (! _$jscoverage['/mvc/collection.js'].functionData) {
  _$jscoverage['/mvc/collection.js'].functionData = [];
  _$jscoverage['/mvc/collection.js'].functionData[0] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[1] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[2] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[3] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[4] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[5] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[6] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[7] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[8] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[9] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[10] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[11] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[12] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[13] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[14] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[15] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[16] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[17] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[18] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[19] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[20] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[21] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[22] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[23] = 0;
}
if (! _$jscoverage['/mvc/collection.js'].branchData) {
  _$jscoverage['/mvc/collection.js'].branchData = {};
  _$jscoverage['/mvc/collection.js'].branchData['9'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['11'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['13'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['32'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['58'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['62'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['78'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['83'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['98'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['106'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['119'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['125'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['127'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['135'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['152'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['154'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['159'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['168'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['169'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['173'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['187'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['189'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['193'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['206'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['208'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['221'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['223'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['223'][1] = new BranchData();
}
_$jscoverage['/mvc/collection.js'].branchData['223'][1].init(62, 29, 'model.get("clientId") === cid');
function visit27_223_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['221'][1].init(76, 17, 'i < models.length');
function visit26_221_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['208'][1].init(62, 20, 'model.getId() === id');
function visit25_208_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['206'][1].init(76, 17, 'i < models.length');
function visit24_206_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['193'][1].init(265, 15, '!opts[\'silent\']');
function visit23_193_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['189'][1].init(113, 11, 'index != -1');
function visit22_189_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['187'][1].init(21, 10, 'opts || {}');
function visit21_187_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['173'][1].init(261, 15, '!opts[\'silent\']');
function visit20_173_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['169'][1].init(25, 10, 'opts || {}');
function visit19_169_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['168'][1].init(63, 5, 'model');
function visit18_168_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['159'][1].init(66, 20, 'success && success()');
function visit17_159_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['154'][1].init(125, 5, 'model');
function visit16_154_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['152'][1].init(51, 10, 'opts || {}');
function visit15_152_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['135'][1].init(425, 41, 'success && success.apply(this, arguments)');
function visit14_135_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['127'][1].init(91, 1, 'v');
function visit13_127_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['125'][1].init(22, 4, 'resp');
function visit12_125_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['119'][1].init(51, 10, 'opts || {}');
function visit11_119_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['106'][1].init(347, 12, 'ret && model');
function visit10_106_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['98'][1].init(47, 25, '!(model instanceof Model)');
function visit9_98_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['83'][1].init(249, 5, 'model');
function visit8_83_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['78'][1].init(48, 16, 'S.isArray(model)');
function visit7_78_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['62'][1].init(77, 8, 'ret && t');
function visit6_62_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['58'][1].init(77, 16, 'S.isArray(model)');
function visit5_58_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['32'][1].init(72, 10, 'comparator');
function visit4_32_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['13'][1].init(69, 6, 'k < k2');
function visit3_13_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['11'][1].init(64, 15, 'i < mods.length');
function visit2_11_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['9'][1].init(44, 10, 'comparator');
function visit1_9_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].lineData[5]++;
KISSY.add("mvc/collection", function(S, Model, Base) {
  _$jscoverage['/mvc/collection.js'].functionData[0]++;
  _$jscoverage['/mvc/collection.js'].lineData[7]++;
  function findModelIndex(mods, mod, comparator) {
    _$jscoverage['/mvc/collection.js'].functionData[1]++;
    _$jscoverage['/mvc/collection.js'].lineData[8]++;
    var i = mods.length;
    _$jscoverage['/mvc/collection.js'].lineData[9]++;
    if (visit1_9_1(comparator)) {
      _$jscoverage['/mvc/collection.js'].lineData[10]++;
      var k = comparator(mod);
      _$jscoverage['/mvc/collection.js'].lineData[11]++;
      for (i = 0; visit2_11_1(i < mods.length); i++) {
        _$jscoverage['/mvc/collection.js'].lineData[12]++;
        var k2 = comparator(mods[i]);
        _$jscoverage['/mvc/collection.js'].lineData[13]++;
        if (visit3_13_1(k < k2)) {
          _$jscoverage['/mvc/collection.js'].lineData[14]++;
          break;
        }
      }
    }
    _$jscoverage['/mvc/collection.js'].lineData[18]++;
    return i;
  }
  _$jscoverage['/mvc/collection.js'].lineData[26]++;
  return Base.extend({
  sort: function() {
  _$jscoverage['/mvc/collection.js'].functionData[2]++;
  _$jscoverage['/mvc/collection.js'].lineData[31]++;
  var comparator = this.get("comparator");
  _$jscoverage['/mvc/collection.js'].lineData[32]++;
  if (visit4_32_1(comparator)) {
    _$jscoverage['/mvc/collection.js'].lineData[33]++;
    this.get("models").sort(function(a, b) {
  _$jscoverage['/mvc/collection.js'].functionData[3]++;
  _$jscoverage['/mvc/collection.js'].lineData[34]++;
  return comparator(a) - comparator(b);
});
  }
}, 
  toJSON: function() {
  _$jscoverage['/mvc/collection.js'].functionData[4]++;
  _$jscoverage['/mvc/collection.js'].lineData[44]++;
  return S.map(this.get("models"), function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[5]++;
  _$jscoverage['/mvc/collection.js'].lineData[45]++;
  return m.toJSON();
});
}, 
  add: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[6]++;
  _$jscoverage['/mvc/collection.js'].lineData[56]++;
  var self = this, ret = true;
  _$jscoverage['/mvc/collection.js'].lineData[58]++;
  if (visit5_58_1(S.isArray(model))) {
    _$jscoverage['/mvc/collection.js'].lineData[59]++;
    var orig = [].concat(model);
    _$jscoverage['/mvc/collection.js'].lineData[60]++;
    S.each(orig, function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[7]++;
  _$jscoverage['/mvc/collection.js'].lineData[61]++;
  var t = self._add(m, opts);
  _$jscoverage['/mvc/collection.js'].lineData[62]++;
  ret = visit6_62_1(ret && t);
});
  } else {
    _$jscoverage['/mvc/collection.js'].lineData[65]++;
    ret = self._add(model, opts);
  }
  _$jscoverage['/mvc/collection.js'].lineData[67]++;
  return ret;
}, 
  remove: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[8]++;
  _$jscoverage['/mvc/collection.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/mvc/collection.js'].lineData[78]++;
  if (visit7_78_1(S.isArray(model))) {
    _$jscoverage['/mvc/collection.js'].lineData[79]++;
    var orig = [].concat(model);
    _$jscoverage['/mvc/collection.js'].lineData[80]++;
    S.each(orig, function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[9]++;
  _$jscoverage['/mvc/collection.js'].lineData[81]++;
  self._remove(m, opts);
});
  } else {
    _$jscoverage['/mvc/collection.js'].lineData[83]++;
    if (visit8_83_1(model)) {
      _$jscoverage['/mvc/collection.js'].lineData[84]++;
      self._remove(model, opts);
    }
  }
}, 
  at: function(i) {
  _$jscoverage['/mvc/collection.js'].functionData[10]++;
  _$jscoverage['/mvc/collection.js'].lineData[93]++;
  return this.get("models")[i];
}, 
  _normModel: function(model) {
  _$jscoverage['/mvc/collection.js'].functionData[11]++;
  _$jscoverage['/mvc/collection.js'].lineData[97]++;
  var ret = true;
  _$jscoverage['/mvc/collection.js'].lineData[98]++;
  if (visit9_98_1(!(model instanceof Model))) {
    _$jscoverage['/mvc/collection.js'].lineData[99]++;
    var data = model, modelConstructor = this.get("model");
    _$jscoverage['/mvc/collection.js'].lineData[101]++;
    model = new modelConstructor();
    _$jscoverage['/mvc/collection.js'].lineData[102]++;
    ret = model.set(data, {
  silent: 1});
  }
  _$jscoverage['/mvc/collection.js'].lineData[106]++;
  return visit10_106_1(ret && model);
}, 
  load: function(opts) {
  _$jscoverage['/mvc/collection.js'].functionData[12]++;
  _$jscoverage['/mvc/collection.js'].lineData[118]++;
  var self = this;
  _$jscoverage['/mvc/collection.js'].lineData[119]++;
  opts = visit11_119_1(opts || {});
  _$jscoverage['/mvc/collection.js'].lineData[120]++;
  var success = opts.success;
  _$jscoverage['/mvc/collection.js'].lineData[124]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/collection.js'].functionData[13]++;
  _$jscoverage['/mvc/collection.js'].lineData[125]++;
  if (visit12_125_1(resp)) {
    _$jscoverage['/mvc/collection.js'].lineData[126]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/collection.js'].lineData[127]++;
    if (visit13_127_1(v)) {
      _$jscoverage['/mvc/collection.js'].lineData[128]++;
      self.set("models", v, opts);
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[132]++;
  S.each(self.get("models"), function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[14]++;
  _$jscoverage['/mvc/collection.js'].lineData[133]++;
  m.__isModified = 0;
});
  _$jscoverage['/mvc/collection.js'].lineData[135]++;
  visit14_135_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/collection.js'].lineData[137]++;
  self.get("sync").call(self, self, 'read', opts);
  _$jscoverage['/mvc/collection.js'].lineData[138]++;
  return self;
}, 
  create: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[15]++;
  _$jscoverage['/mvc/collection.js'].lineData[151]++;
  var self = this;
  _$jscoverage['/mvc/collection.js'].lineData[152]++;
  opts = visit15_152_1(opts || {});
  _$jscoverage['/mvc/collection.js'].lineData[153]++;
  model = this._normModel(model);
  _$jscoverage['/mvc/collection.js'].lineData[154]++;
  if (visit16_154_1(model)) {
    _$jscoverage['/mvc/collection.js'].lineData[155]++;
    model.addToCollection(self);
    _$jscoverage['/mvc/collection.js'].lineData[156]++;
    var success = opts.success;
    _$jscoverage['/mvc/collection.js'].lineData[157]++;
    opts.success = function() {
  _$jscoverage['/mvc/collection.js'].functionData[16]++;
  _$jscoverage['/mvc/collection.js'].lineData[158]++;
  self.add(model, opts);
  _$jscoverage['/mvc/collection.js'].lineData[159]++;
  visit17_159_1(success && success());
};
    _$jscoverage['/mvc/collection.js'].lineData[161]++;
    model.save(opts);
  }
  _$jscoverage['/mvc/collection.js'].lineData[163]++;
  return model;
}, 
  _add: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[17]++;
  _$jscoverage['/mvc/collection.js'].lineData[167]++;
  model = this._normModel(model);
  _$jscoverage['/mvc/collection.js'].lineData[168]++;
  if (visit18_168_1(model)) {
    _$jscoverage['/mvc/collection.js'].lineData[169]++;
    opts = visit19_169_1(opts || {});
    _$jscoverage['/mvc/collection.js'].lineData[170]++;
    var index = findModelIndex(this.get("models"), model, this.get("comparator"));
    _$jscoverage['/mvc/collection.js'].lineData[171]++;
    this.get("models").splice(index, 0, model);
    _$jscoverage['/mvc/collection.js'].lineData[172]++;
    model.addToCollection(this);
    _$jscoverage['/mvc/collection.js'].lineData[173]++;
    if (visit20_173_1(!opts['silent'])) {
      _$jscoverage['/mvc/collection.js'].lineData[174]++;
      this.fire("add", {
  model: model});
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[179]++;
  return model;
}, 
  _remove: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[18]++;
  _$jscoverage['/mvc/collection.js'].lineData[187]++;
  opts = visit21_187_1(opts || {});
  _$jscoverage['/mvc/collection.js'].lineData[188]++;
  var index = S.indexOf(model, this.get("models"));
  _$jscoverage['/mvc/collection.js'].lineData[189]++;
  if (visit22_189_1(index != -1)) {
    _$jscoverage['/mvc/collection.js'].lineData[190]++;
    this.get("models").splice(index, 1);
    _$jscoverage['/mvc/collection.js'].lineData[191]++;
    model.removeFromCollection(this);
  }
  _$jscoverage['/mvc/collection.js'].lineData[193]++;
  if (visit23_193_1(!opts['silent'])) {
    _$jscoverage['/mvc/collection.js'].lineData[194]++;
    this.fire("remove", {
  model: model});
  }
}, 
  getById: function(id) {
  _$jscoverage['/mvc/collection.js'].functionData[19]++;
  _$jscoverage['/mvc/collection.js'].lineData[205]++;
  var models = this.get("models");
  _$jscoverage['/mvc/collection.js'].lineData[206]++;
  for (var i = 0; visit24_206_1(i < models.length); i++) {
    _$jscoverage['/mvc/collection.js'].lineData[207]++;
    var model = models[i];
    _$jscoverage['/mvc/collection.js'].lineData[208]++;
    if (visit25_208_1(model.getId() === id)) {
      _$jscoverage['/mvc/collection.js'].lineData[209]++;
      return model;
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[212]++;
  return null;
}, 
  getByCid: function(cid) {
  _$jscoverage['/mvc/collection.js'].functionData[20]++;
  _$jscoverage['/mvc/collection.js'].lineData[220]++;
  var models = this.get("models");
  _$jscoverage['/mvc/collection.js'].lineData[221]++;
  for (var i = 0; visit26_221_1(i < models.length); i++) {
    _$jscoverage['/mvc/collection.js'].lineData[222]++;
    var model = models[i];
    _$jscoverage['/mvc/collection.js'].lineData[223]++;
    if (visit27_223_1(model.get("clientId") === cid)) {
      _$jscoverage['/mvc/collection.js'].lineData[224]++;
      return model;
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[227]++;
  return null;
}}, {
  ATTRS: {
  model: {
  value: Model}, 
  models: {
  setter: function(models) {
  _$jscoverage['/mvc/collection.js'].functionData[21]++;
  _$jscoverage['/mvc/collection.js'].lineData[249]++;
  var prev = this.get("models");
  _$jscoverage['/mvc/collection.js'].lineData[250]++;
  this.remove(prev, {
  silent: 1});
  _$jscoverage['/mvc/collection.js'].lineData[251]++;
  this.add(models, {
  silent: 1});
  _$jscoverage['/mvc/collection.js'].lineData[252]++;
  return this.get("models");
}, 
  value: []}, 
  url: {
  value: ""}, 
  comparator: {}, 
  sync: {
  value: function() {
  _$jscoverage['/mvc/collection.js'].functionData[22]++;
  _$jscoverage['/mvc/collection.js'].lineData[276]++;
  S.require("mvc").sync.apply(this, arguments);
}}, 
  parse: {
  value: function(resp) {
  _$jscoverage['/mvc/collection.js'].functionData[23]++;
  _$jscoverage['/mvc/collection.js'].lineData[286]++;
  return resp;
}}}});
}, {
  requires: ['./model', 'base']});
