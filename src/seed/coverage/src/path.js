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
if (! _$jscoverage['/path.js']) {
  _$jscoverage['/path.js'] = {};
  _$jscoverage['/path.js'].lineData = [];
  _$jscoverage['/path.js'].lineData[7] = 0;
  _$jscoverage['/path.js'].lineData[9] = 0;
  _$jscoverage['/path.js'].lineData[13] = 0;
  _$jscoverage['/path.js'].lineData[15] = 0;
  _$jscoverage['/path.js'].lineData[22] = 0;
  _$jscoverage['/path.js'].lineData[23] = 0;
  _$jscoverage['/path.js'].lineData[24] = 0;
  _$jscoverage['/path.js'].lineData[25] = 0;
  _$jscoverage['/path.js'].lineData[26] = 0;
  _$jscoverage['/path.js'].lineData[27] = 0;
  _$jscoverage['/path.js'].lineData[28] = 0;
  _$jscoverage['/path.js'].lineData[30] = 0;
  _$jscoverage['/path.js'].lineData[35] = 0;
  _$jscoverage['/path.js'].lineData[36] = 0;
  _$jscoverage['/path.js'].lineData[37] = 0;
  _$jscoverage['/path.js'].lineData[41] = 0;
  _$jscoverage['/path.js'].lineData[43] = 0;
  _$jscoverage['/path.js'].lineData[51] = 0;
  _$jscoverage['/path.js'].lineData[57] = 0;
  _$jscoverage['/path.js'].lineData[64] = 0;
  _$jscoverage['/path.js'].lineData[65] = 0;
  _$jscoverage['/path.js'].lineData[66] = 0;
  _$jscoverage['/path.js'].lineData[67] = 0;
  _$jscoverage['/path.js'].lineData[69] = 0;
  _$jscoverage['/path.js'].lineData[70] = 0;
  _$jscoverage['/path.js'].lineData[73] = 0;
  _$jscoverage['/path.js'].lineData[74] = 0;
  _$jscoverage['/path.js'].lineData[77] = 0;
  _$jscoverage['/path.js'].lineData[91] = 0;
  _$jscoverage['/path.js'].lineData[94] = 0;
  _$jscoverage['/path.js'].lineData[95] = 0;
  _$jscoverage['/path.js'].lineData[98] = 0;
  _$jscoverage['/path.js'].lineData[99] = 0;
  _$jscoverage['/path.js'].lineData[102] = 0;
  _$jscoverage['/path.js'].lineData[103] = 0;
  _$jscoverage['/path.js'].lineData[107] = 0;
  _$jscoverage['/path.js'].lineData[115] = 0;
  _$jscoverage['/path.js'].lineData[116] = 0;
  _$jscoverage['/path.js'].lineData[117] = 0;
  _$jscoverage['/path.js'].lineData[133] = 0;
  _$jscoverage['/path.js'].lineData[134] = 0;
  _$jscoverage['/path.js'].lineData[136] = 0;
  _$jscoverage['/path.js'].lineData[137] = 0;
  _$jscoverage['/path.js'].lineData[143] = 0;
  _$jscoverage['/path.js'].lineData[146] = 0;
  _$jscoverage['/path.js'].lineData[147] = 0;
  _$jscoverage['/path.js'].lineData[148] = 0;
  _$jscoverage['/path.js'].lineData[152] = 0;
  _$jscoverage['/path.js'].lineData[154] = 0;
  _$jscoverage['/path.js'].lineData[155] = 0;
  _$jscoverage['/path.js'].lineData[156] = 0;
  _$jscoverage['/path.js'].lineData[159] = 0;
  _$jscoverage['/path.js'].lineData[161] = 0;
  _$jscoverage['/path.js'].lineData[163] = 0;
  _$jscoverage['/path.js'].lineData[173] = 0;
  _$jscoverage['/path.js'].lineData[175] = 0;
  _$jscoverage['/path.js'].lineData[176] = 0;
  _$jscoverage['/path.js'].lineData[177] = 0;
  _$jscoverage['/path.js'].lineData[179] = 0;
  _$jscoverage['/path.js'].lineData[188] = 0;
  _$jscoverage['/path.js'].lineData[192] = 0;
  _$jscoverage['/path.js'].lineData[194] = 0;
  _$jscoverage['/path.js'].lineData[197] = 0;
  _$jscoverage['/path.js'].lineData[199] = 0;
  _$jscoverage['/path.js'].lineData[202] = 0;
  _$jscoverage['/path.js'].lineData[211] = 0;
}
if (! _$jscoverage['/path.js'].functionData) {
  _$jscoverage['/path.js'].functionData = [];
  _$jscoverage['/path.js'].functionData[0] = 0;
  _$jscoverage['/path.js'].functionData[1] = 0;
  _$jscoverage['/path.js'].functionData[2] = 0;
  _$jscoverage['/path.js'].functionData[3] = 0;
  _$jscoverage['/path.js'].functionData[4] = 0;
  _$jscoverage['/path.js'].functionData[5] = 0;
  _$jscoverage['/path.js'].functionData[6] = 0;
  _$jscoverage['/path.js'].functionData[7] = 0;
  _$jscoverage['/path.js'].functionData[8] = 0;
  _$jscoverage['/path.js'].functionData[9] = 0;
  _$jscoverage['/path.js'].functionData[10] = 0;
  _$jscoverage['/path.js'].functionData[11] = 0;
  _$jscoverage['/path.js'].functionData[12] = 0;
  _$jscoverage['/path.js'].functionData[13] = 0;
}
if (! _$jscoverage['/path.js'].branchData) {
  _$jscoverage['/path.js'].branchData = {};
  _$jscoverage['/path.js'].branchData['22'] = [];
  _$jscoverage['/path.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['24'] = [];
  _$jscoverage['/path.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['25'] = [];
  _$jscoverage['/path.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['27'] = [];
  _$jscoverage['/path.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['35'] = [];
  _$jscoverage['/path.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['64'] = [];
  _$jscoverage['/path.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['66'] = [];
  _$jscoverage['/path.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['70'] = [];
  _$jscoverage['/path.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['77'] = [];
  _$jscoverage['/path.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['91'] = [];
  _$jscoverage['/path.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['92'] = [];
  _$jscoverage['/path.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['98'] = [];
  _$jscoverage['/path.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['102'] = [];
  _$jscoverage['/path.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['117'] = [];
  _$jscoverage['/path.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['146'] = [];
  _$jscoverage['/path.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['147'] = [];
  _$jscoverage['/path.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['154'] = [];
  _$jscoverage['/path.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['173'] = [];
  _$jscoverage['/path.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['175'] = [];
  _$jscoverage['/path.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['176'] = [];
  _$jscoverage['/path.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['176'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['176'][3] = new BranchData();
  _$jscoverage['/path.js'].branchData['188'] = [];
  _$jscoverage['/path.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['189'] = [];
  _$jscoverage['/path.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['190'] = [];
  _$jscoverage['/path.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['192'] = [];
  _$jscoverage['/path.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['197'] = [];
  _$jscoverage['/path.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['211'] = [];
  _$jscoverage['/path.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['211'][2] = new BranchData();
}
_$jscoverage['/path.js'].branchData['211'][2].init(21, 29, 'path.match(splitPathRe) || []');
function visit552_211_2(result) {
  _$jscoverage['/path.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['211'][1].init(21, 39, '(path.match(splitPathRe) || [])[4] || \'\'');
function visit551_211_1(result) {
  _$jscoverage['/path.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['197'][1].init(259, 3, 'dir');
function visit550_197_1(result) {
  _$jscoverage['/path.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['192'][1].init(153, 13, '!root && !dir');
function visit549_192_1(result) {
  _$jscoverage['/path.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['190'][1].init(105, 15, 'result[2] || \'\'');
function visit548_190_1(result) {
  _$jscoverage['/path.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['189'][1].init(66, 15, 'result[1] || \'\'');
function visit547_189_1(result) {
  _$jscoverage['/path.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['188'][1].init(26, 29, 'path.match(splitPathRe) || []');
function visit546_188_1(result) {
  _$jscoverage['/path.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['176'][3].init(158, 38, 'basename.slice(-1 * ext.length) == ext');
function visit545_176_3(result) {
  _$jscoverage['/path.js'].branchData['176'][3].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['176'][2].init(146, 50, 'basename && basename.slice(-1 * ext.length) == ext');
function visit544_176_2(result) {
  _$jscoverage['/path.js'].branchData['176'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['176'][1].init(139, 57, 'ext && basename && basename.slice(-1 * ext.length) == ext');
function visit543_176_1(result) {
  _$jscoverage['/path.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['175'][1].init(106, 15, 'result[3] || \'\'');
function visit542_175_1(result) {
  _$jscoverage['/path.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['173'][1].init(26, 29, 'path.match(splitPathRe) || []');
function visit541_173_1(result) {
  _$jscoverage['/path.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['154'][1].init(715, 28, 'sameIndex < fromParts.length');
function visit540_154_1(result) {
  _$jscoverage['/path.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['147'][1].init(21, 42, 'fromParts[sameIndex] != toParts[sameIndex]');
function visit539_147_1(result) {
  _$jscoverage['/path.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['146'][1].init(492, 24, 'sameIndex < commonLength');
function visit538_146_1(result) {
  _$jscoverage['/path.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['117'][2].init(30, 20, 'typeof p == \'string\'');
function visit537_117_2(result) {
  _$jscoverage['/path.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['117'][1].init(24, 27, 'p && (typeof p == \'string\')');
function visit536_117_1(result) {
  _$jscoverage['/path.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['102'][1].init(346, 21, 'path && trailingSlash');
function visit535_102_1(result) {
  _$jscoverage['/path.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['98'][1].init(265, 18, '!path && !absolute');
function visit534_98_1(result) {
  _$jscoverage['/path.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['92'][1].init(69, 21, 'path.slice(-1) == \'/\'');
function visit533_92_1(result) {
  _$jscoverage['/path.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['91'][1].init(28, 21, 'path.charAt(0) == \'/\'');
function visit532_91_1(result) {
  _$jscoverage['/path.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['77'][1].init(684, 46, '((absolute ? \'/\' : \'\') + resolvedPathStr) || \'.\'');
function visit531_77_1(result) {
  _$jscoverage['/path.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['70'][1].init(222, 21, 'path.charAt(0) == \'/\'');
function visit530_70_1(result) {
  _$jscoverage['/path.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['66'][2].init(53, 23, 'typeof path != \'string\'');
function visit529_66_2(result) {
  _$jscoverage['/path.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['66'][1].init(53, 32, 'typeof path != \'string\' || !path');
function visit528_66_1(result) {
  _$jscoverage['/path.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['64'][2].init(215, 6, 'i >= 0');
function visit527_64_2(result) {
  _$jscoverage['/path.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['64'][1].init(215, 19, 'i >= 0 && !absolute');
function visit526_64_1(result) {
  _$jscoverage['/path.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['35'][1].init(555, 14, 'allowAboveRoot');
function visit525_35_1(result) {
  _$jscoverage['/path.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['27'][1].init(148, 2, 'up');
function visit524_27_1(result) {
  _$jscoverage['/path.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['25'][1].init(85, 13, 'last === \'..\'');
function visit523_25_1(result) {
  _$jscoverage['/path.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['24'][1].init(46, 11, 'last == \'.\'');
function visit522_24_1(result) {
  _$jscoverage['/path.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['22'][1].init(213, 6, 'i >= 0');
function visit521_22_1(result) {
  _$jscoverage['/path.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/path.js'].functionData[0]++;
  _$jscoverage['/path.js'].lineData[9]++;
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  _$jscoverage['/path.js'].lineData[13]++;
  function normalizeArray(parts, allowAboveRoot) {
    _$jscoverage['/path.js'].functionData[1]++;
    _$jscoverage['/path.js'].lineData[15]++;
    var up = 0, i = parts.length - 1, newParts = [], last;
    _$jscoverage['/path.js'].lineData[22]++;
    for (; visit521_22_1(i >= 0); i--) {
      _$jscoverage['/path.js'].lineData[23]++;
      last = parts[i];
      _$jscoverage['/path.js'].lineData[24]++;
      if (visit522_24_1(last == '.')) {
      } else {
        _$jscoverage['/path.js'].lineData[25]++;
        if (visit523_25_1(last === '..')) {
          _$jscoverage['/path.js'].lineData[26]++;
          up++;
        } else {
          _$jscoverage['/path.js'].lineData[27]++;
          if (visit524_27_1(up)) {
            _$jscoverage['/path.js'].lineData[28]++;
            up--;
          } else {
            _$jscoverage['/path.js'].lineData[30]++;
            newParts[newParts.length] = last;
          }
        }
      }
    }
    _$jscoverage['/path.js'].lineData[35]++;
    if (visit525_35_1(allowAboveRoot)) {
      _$jscoverage['/path.js'].lineData[36]++;
      for (; up--; up) {
        _$jscoverage['/path.js'].lineData[37]++;
        newParts[newParts.length] = '..';
      }
    }
    _$jscoverage['/path.js'].lineData[41]++;
    newParts = newParts.reverse();
    _$jscoverage['/path.js'].lineData[43]++;
    return newParts;
  }
  _$jscoverage['/path.js'].lineData[51]++;
  var Path = S.Path = {
  resolve: function() {
  _$jscoverage['/path.js'].functionData[2]++;
  _$jscoverage['/path.js'].lineData[57]++;
  var resolvedPath = '', resolvedPathStr, i, args = (arguments), path, absolute = 0;
  _$jscoverage['/path.js'].lineData[64]++;
  for (i = args.length - 1; visit526_64_1(visit527_64_2(i >= 0) && !absolute); i--) {
    _$jscoverage['/path.js'].lineData[65]++;
    path = args[i];
    _$jscoverage['/path.js'].lineData[66]++;
    if (visit528_66_1(visit529_66_2(typeof path != 'string') || !path)) {
      _$jscoverage['/path.js'].lineData[67]++;
      continue;
    }
    _$jscoverage['/path.js'].lineData[69]++;
    resolvedPath = path + '/' + resolvedPath;
    _$jscoverage['/path.js'].lineData[70]++;
    absolute = visit530_70_1(path.charAt(0) == '/');
  }
  _$jscoverage['/path.js'].lineData[73]++;
  resolvedPathStr = normalizeArray(S.filter(resolvedPath.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[3]++;
  _$jscoverage['/path.js'].lineData[74]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[77]++;
  return visit531_77_1(((absolute ? '/' : '') + resolvedPathStr) || '.');
}, 
  normalize: function(path) {
  _$jscoverage['/path.js'].functionData[4]++;
  _$jscoverage['/path.js'].lineData[91]++;
  var absolute = visit532_91_1(path.charAt(0) == '/'), trailingSlash = visit533_92_1(path.slice(-1) == '/');
  _$jscoverage['/path.js'].lineData[94]++;
  path = normalizeArray(S.filter(path.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[5]++;
  _$jscoverage['/path.js'].lineData[95]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[98]++;
  if (visit534_98_1(!path && !absolute)) {
    _$jscoverage['/path.js'].lineData[99]++;
    path = '.';
  }
  _$jscoverage['/path.js'].lineData[102]++;
  if (visit535_102_1(path && trailingSlash)) {
    _$jscoverage['/path.js'].lineData[103]++;
    path += '/';
  }
  _$jscoverage['/path.js'].lineData[107]++;
  return (absolute ? '/' : '') + path;
}, 
  join: function() {
  _$jscoverage['/path.js'].functionData[6]++;
  _$jscoverage['/path.js'].lineData[115]++;
  var args = S.makeArray(arguments);
  _$jscoverage['/path.js'].lineData[116]++;
  return Path.normalize(S.filter(args, function(p) {
  _$jscoverage['/path.js'].functionData[7]++;
  _$jscoverage['/path.js'].lineData[117]++;
  return visit536_117_1(p && (visit537_117_2(typeof p == 'string')));
}).join('/'));
}, 
  relative: function(from, to) {
  _$jscoverage['/path.js'].functionData[8]++;
  _$jscoverage['/path.js'].lineData[133]++;
  from = Path.normalize(from);
  _$jscoverage['/path.js'].lineData[134]++;
  to = Path.normalize(to);
  _$jscoverage['/path.js'].lineData[136]++;
  var fromParts = S.filter(from.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[9]++;
  _$jscoverage['/path.js'].lineData[137]++;
  return !!p;
}), path = [], sameIndex, sameIndex2, toParts = S.filter(to.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[10]++;
  _$jscoverage['/path.js'].lineData[143]++;
  return !!p;
}), commonLength = Math.min(fromParts.length, toParts.length);
  _$jscoverage['/path.js'].lineData[146]++;
  for (sameIndex = 0; visit538_146_1(sameIndex < commonLength); sameIndex++) {
    _$jscoverage['/path.js'].lineData[147]++;
    if (visit539_147_1(fromParts[sameIndex] != toParts[sameIndex])) {
      _$jscoverage['/path.js'].lineData[148]++;
      break;
    }
  }
  _$jscoverage['/path.js'].lineData[152]++;
  sameIndex2 = sameIndex;
  _$jscoverage['/path.js'].lineData[154]++;
  while (visit540_154_1(sameIndex < fromParts.length)) {
    _$jscoverage['/path.js'].lineData[155]++;
    path.push('..');
    _$jscoverage['/path.js'].lineData[156]++;
    sameIndex++;
  }
  _$jscoverage['/path.js'].lineData[159]++;
  path = path.concat(toParts.slice(sameIndex2));
  _$jscoverage['/path.js'].lineData[161]++;
  path = path.join('/');
  _$jscoverage['/path.js'].lineData[163]++;
  return path;
}, 
  basename: function(path, ext) {
  _$jscoverage['/path.js'].functionData[11]++;
  _$jscoverage['/path.js'].lineData[173]++;
  var result = visit541_173_1(path.match(splitPathRe) || []), basename;
  _$jscoverage['/path.js'].lineData[175]++;
  basename = visit542_175_1(result[3] || '');
  _$jscoverage['/path.js'].lineData[176]++;
  if (visit543_176_1(ext && visit544_176_2(basename && visit545_176_3(basename.slice(-1 * ext.length) == ext)))) {
    _$jscoverage['/path.js'].lineData[177]++;
    basename = basename.slice(0, -1 * ext.length);
  }
  _$jscoverage['/path.js'].lineData[179]++;
  return basename;
}, 
  dirname: function(path) {
  _$jscoverage['/path.js'].functionData[12]++;
  _$jscoverage['/path.js'].lineData[188]++;
  var result = visit546_188_1(path.match(splitPathRe) || []), root = visit547_189_1(result[1] || ''), dir = visit548_190_1(result[2] || '');
  _$jscoverage['/path.js'].lineData[192]++;
  if (visit549_192_1(!root && !dir)) {
    _$jscoverage['/path.js'].lineData[194]++;
    return '.';
  }
  _$jscoverage['/path.js'].lineData[197]++;
  if (visit550_197_1(dir)) {
    _$jscoverage['/path.js'].lineData[199]++;
    dir = dir.substring(0, dir.length - 1);
  }
  _$jscoverage['/path.js'].lineData[202]++;
  return root + dir;
}, 
  extname: function(path) {
  _$jscoverage['/path.js'].functionData[13]++;
  _$jscoverage['/path.js'].lineData[211]++;
  return visit551_211_1((visit552_211_2(path.match(splitPathRe) || []))[4] || '');
}};
})(KISSY);
