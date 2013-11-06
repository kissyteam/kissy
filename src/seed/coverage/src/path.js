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
  _$jscoverage['/path.js'].lineData[58] = 0;
  _$jscoverage['/path.js'].lineData[65] = 0;
  _$jscoverage['/path.js'].lineData[66] = 0;
  _$jscoverage['/path.js'].lineData[67] = 0;
  _$jscoverage['/path.js'].lineData[68] = 0;
  _$jscoverage['/path.js'].lineData[70] = 0;
  _$jscoverage['/path.js'].lineData[71] = 0;
  _$jscoverage['/path.js'].lineData[74] = 0;
  _$jscoverage['/path.js'].lineData[75] = 0;
  _$jscoverage['/path.js'].lineData[78] = 0;
  _$jscoverage['/path.js'].lineData[92] = 0;
  _$jscoverage['/path.js'].lineData[95] = 0;
  _$jscoverage['/path.js'].lineData[96] = 0;
  _$jscoverage['/path.js'].lineData[99] = 0;
  _$jscoverage['/path.js'].lineData[100] = 0;
  _$jscoverage['/path.js'].lineData[103] = 0;
  _$jscoverage['/path.js'].lineData[104] = 0;
  _$jscoverage['/path.js'].lineData[108] = 0;
  _$jscoverage['/path.js'].lineData[116] = 0;
  _$jscoverage['/path.js'].lineData[117] = 0;
  _$jscoverage['/path.js'].lineData[118] = 0;
  _$jscoverage['/path.js'].lineData[134] = 0;
  _$jscoverage['/path.js'].lineData[135] = 0;
  _$jscoverage['/path.js'].lineData[137] = 0;
  _$jscoverage['/path.js'].lineData[138] = 0;
  _$jscoverage['/path.js'].lineData[144] = 0;
  _$jscoverage['/path.js'].lineData[147] = 0;
  _$jscoverage['/path.js'].lineData[148] = 0;
  _$jscoverage['/path.js'].lineData[149] = 0;
  _$jscoverage['/path.js'].lineData[153] = 0;
  _$jscoverage['/path.js'].lineData[155] = 0;
  _$jscoverage['/path.js'].lineData[156] = 0;
  _$jscoverage['/path.js'].lineData[157] = 0;
  _$jscoverage['/path.js'].lineData[160] = 0;
  _$jscoverage['/path.js'].lineData[162] = 0;
  _$jscoverage['/path.js'].lineData[164] = 0;
  _$jscoverage['/path.js'].lineData[174] = 0;
  _$jscoverage['/path.js'].lineData[176] = 0;
  _$jscoverage['/path.js'].lineData[177] = 0;
  _$jscoverage['/path.js'].lineData[178] = 0;
  _$jscoverage['/path.js'].lineData[180] = 0;
  _$jscoverage['/path.js'].lineData[189] = 0;
  _$jscoverage['/path.js'].lineData[193] = 0;
  _$jscoverage['/path.js'].lineData[195] = 0;
  _$jscoverage['/path.js'].lineData[198] = 0;
  _$jscoverage['/path.js'].lineData[200] = 0;
  _$jscoverage['/path.js'].lineData[203] = 0;
  _$jscoverage['/path.js'].lineData[212] = 0;
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
  _$jscoverage['/path.js'].branchData['65'] = [];
  _$jscoverage['/path.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['67'] = [];
  _$jscoverage['/path.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['71'] = [];
  _$jscoverage['/path.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['78'] = [];
  _$jscoverage['/path.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['92'] = [];
  _$jscoverage['/path.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['93'] = [];
  _$jscoverage['/path.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['99'] = [];
  _$jscoverage['/path.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['103'] = [];
  _$jscoverage['/path.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['118'] = [];
  _$jscoverage['/path.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['147'] = [];
  _$jscoverage['/path.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['148'] = [];
  _$jscoverage['/path.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['155'] = [];
  _$jscoverage['/path.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['174'] = [];
  _$jscoverage['/path.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['176'] = [];
  _$jscoverage['/path.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['177'] = [];
  _$jscoverage['/path.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['177'][3] = new BranchData();
  _$jscoverage['/path.js'].branchData['189'] = [];
  _$jscoverage['/path.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['190'] = [];
  _$jscoverage['/path.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['191'] = [];
  _$jscoverage['/path.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['193'] = [];
  _$jscoverage['/path.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['198'] = [];
  _$jscoverage['/path.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['212'] = [];
  _$jscoverage['/path.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['212'][2] = new BranchData();
}
_$jscoverage['/path.js'].branchData['212'][2].init(22, 29, 'path.match(splitPathRe) || []');
function visit546_212_2(result) {
  _$jscoverage['/path.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['212'][1].init(22, 39, '(path.match(splitPathRe) || [])[4] || \'\'');
function visit545_212_1(result) {
  _$jscoverage['/path.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['198'][1].init(269, 3, 'dir');
function visit544_198_1(result) {
  _$jscoverage['/path.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['193'][1].init(158, 13, '!root && !dir');
function visit543_193_1(result) {
  _$jscoverage['/path.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['191'][1].init(107, 15, 'result[2] || \'\'');
function visit542_191_1(result) {
  _$jscoverage['/path.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['190'][1].init(67, 15, 'result[1] || \'\'');
function visit541_190_1(result) {
  _$jscoverage['/path.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['189'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit540_189_1(result) {
  _$jscoverage['/path.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['177'][3].init(162, 38, 'basename.slice(-1 * ext.length) == ext');
function visit539_177_3(result) {
  _$jscoverage['/path.js'].branchData['177'][3].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['177'][2].init(150, 50, 'basename && basename.slice(-1 * ext.length) == ext');
function visit538_177_2(result) {
  _$jscoverage['/path.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['177'][1].init(143, 57, 'ext && basename && basename.slice(-1 * ext.length) == ext');
function visit537_177_1(result) {
  _$jscoverage['/path.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['176'][1].init(109, 15, 'result[3] || \'\'');
function visit536_176_1(result) {
  _$jscoverage['/path.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['174'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit535_174_1(result) {
  _$jscoverage['/path.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['155'][1].init(737, 28, 'sameIndex < fromParts.length');
function visit534_155_1(result) {
  _$jscoverage['/path.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['148'][1].init(22, 42, 'fromParts[sameIndex] != toParts[sameIndex]');
function visit533_148_1(result) {
  _$jscoverage['/path.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['147'][1].init(506, 24, 'sameIndex < commonLength');
function visit532_147_1(result) {
  _$jscoverage['/path.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['118'][2].init(31, 20, 'typeof p == \'string\'');
function visit531_118_2(result) {
  _$jscoverage['/path.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['118'][1].init(25, 27, 'p && (typeof p == \'string\')');
function visit530_118_1(result) {
  _$jscoverage['/path.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['103'][1].init(358, 21, 'path && trailingSlash');
function visit529_103_1(result) {
  _$jscoverage['/path.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['99'][1].init(273, 18, '!path && !absolute');
function visit528_99_1(result) {
  _$jscoverage['/path.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['93'][1].init(70, 21, 'path.slice(-1) == \'/\'');
function visit527_93_1(result) {
  _$jscoverage['/path.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['92'][1].init(29, 21, 'path.charAt(0) == \'/\'');
function visit526_92_1(result) {
  _$jscoverage['/path.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['78'][1].init(705, 46, '((absolute ? \'/\' : \'\') + resolvedPathStr) || \'.\'');
function visit525_78_1(result) {
  _$jscoverage['/path.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['71'][1].init(228, 21, 'path.charAt(0) == \'/\'');
function visit524_71_1(result) {
  _$jscoverage['/path.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['67'][2].init(55, 23, 'typeof path != \'string\'');
function visit523_67_2(result) {
  _$jscoverage['/path.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['67'][1].init(55, 32, 'typeof path != \'string\' || !path');
function visit522_67_1(result) {
  _$jscoverage['/path.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['65'][2].init(223, 6, 'i >= 0');
function visit521_65_2(result) {
  _$jscoverage['/path.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['65'][1].init(223, 19, 'i >= 0 && !absolute');
function visit520_65_1(result) {
  _$jscoverage['/path.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['35'][1].init(577, 14, 'allowAboveRoot');
function visit519_35_1(result) {
  _$jscoverage['/path.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['27'][1].init(153, 2, 'up');
function visit518_27_1(result) {
  _$jscoverage['/path.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['25'][1].init(88, 13, 'last === \'..\'');
function visit517_25_1(result) {
  _$jscoverage['/path.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['24'][1].init(48, 11, 'last == \'.\'');
function visit516_24_1(result) {
  _$jscoverage['/path.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['22'][1].init(222, 6, 'i >= 0');
function visit515_22_1(result) {
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
    for (; visit515_22_1(i >= 0); i--) {
      _$jscoverage['/path.js'].lineData[23]++;
      last = parts[i];
      _$jscoverage['/path.js'].lineData[24]++;
      if (visit516_24_1(last == '.')) {
      } else {
        _$jscoverage['/path.js'].lineData[25]++;
        if (visit517_25_1(last === '..')) {
          _$jscoverage['/path.js'].lineData[26]++;
          up++;
        } else {
          _$jscoverage['/path.js'].lineData[27]++;
          if (visit518_27_1(up)) {
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
    if (visit519_35_1(allowAboveRoot)) {
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
  _$jscoverage['/path.js'].lineData[58]++;
  var resolvedPath = '', resolvedPathStr, i, args = (arguments), path, absolute = 0;
  _$jscoverage['/path.js'].lineData[65]++;
  for (i = args.length - 1; visit520_65_1(visit521_65_2(i >= 0) && !absolute); i--) {
    _$jscoverage['/path.js'].lineData[66]++;
    path = args[i];
    _$jscoverage['/path.js'].lineData[67]++;
    if (visit522_67_1(visit523_67_2(typeof path != 'string') || !path)) {
      _$jscoverage['/path.js'].lineData[68]++;
      continue;
    }
    _$jscoverage['/path.js'].lineData[70]++;
    resolvedPath = path + '/' + resolvedPath;
    _$jscoverage['/path.js'].lineData[71]++;
    absolute = visit524_71_1(path.charAt(0) == '/');
  }
  _$jscoverage['/path.js'].lineData[74]++;
  resolvedPathStr = normalizeArray(S.filter(resolvedPath.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[3]++;
  _$jscoverage['/path.js'].lineData[75]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[78]++;
  return visit525_78_1(((absolute ? '/' : '') + resolvedPathStr) || '.');
}, 
  normalize: function(path) {
  _$jscoverage['/path.js'].functionData[4]++;
  _$jscoverage['/path.js'].lineData[92]++;
  var absolute = visit526_92_1(path.charAt(0) == '/'), trailingSlash = visit527_93_1(path.slice(-1) == '/');
  _$jscoverage['/path.js'].lineData[95]++;
  path = normalizeArray(S.filter(path.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[5]++;
  _$jscoverage['/path.js'].lineData[96]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[99]++;
  if (visit528_99_1(!path && !absolute)) {
    _$jscoverage['/path.js'].lineData[100]++;
    path = '.';
  }
  _$jscoverage['/path.js'].lineData[103]++;
  if (visit529_103_1(path && trailingSlash)) {
    _$jscoverage['/path.js'].lineData[104]++;
    path += '/';
  }
  _$jscoverage['/path.js'].lineData[108]++;
  return (absolute ? '/' : '') + path;
}, 
  join: function() {
  _$jscoverage['/path.js'].functionData[6]++;
  _$jscoverage['/path.js'].lineData[116]++;
  var args = S.makeArray(arguments);
  _$jscoverage['/path.js'].lineData[117]++;
  return Path.normalize(S.filter(args, function(p) {
  _$jscoverage['/path.js'].functionData[7]++;
  _$jscoverage['/path.js'].lineData[118]++;
  return visit530_118_1(p && (visit531_118_2(typeof p == 'string')));
}).join('/'));
}, 
  relative: function(from, to) {
  _$jscoverage['/path.js'].functionData[8]++;
  _$jscoverage['/path.js'].lineData[134]++;
  from = Path.normalize(from);
  _$jscoverage['/path.js'].lineData[135]++;
  to = Path.normalize(to);
  _$jscoverage['/path.js'].lineData[137]++;
  var fromParts = S.filter(from.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[9]++;
  _$jscoverage['/path.js'].lineData[138]++;
  return !!p;
}), path = [], sameIndex, sameIndex2, toParts = S.filter(to.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[10]++;
  _$jscoverage['/path.js'].lineData[144]++;
  return !!p;
}), commonLength = Math.min(fromParts.length, toParts.length);
  _$jscoverage['/path.js'].lineData[147]++;
  for (sameIndex = 0; visit532_147_1(sameIndex < commonLength); sameIndex++) {
    _$jscoverage['/path.js'].lineData[148]++;
    if (visit533_148_1(fromParts[sameIndex] != toParts[sameIndex])) {
      _$jscoverage['/path.js'].lineData[149]++;
      break;
    }
  }
  _$jscoverage['/path.js'].lineData[153]++;
  sameIndex2 = sameIndex;
  _$jscoverage['/path.js'].lineData[155]++;
  while (visit534_155_1(sameIndex < fromParts.length)) {
    _$jscoverage['/path.js'].lineData[156]++;
    path.push('..');
    _$jscoverage['/path.js'].lineData[157]++;
    sameIndex++;
  }
  _$jscoverage['/path.js'].lineData[160]++;
  path = path.concat(toParts.slice(sameIndex2));
  _$jscoverage['/path.js'].lineData[162]++;
  path = path.join('/');
  _$jscoverage['/path.js'].lineData[164]++;
  return path;
}, 
  basename: function(path, ext) {
  _$jscoverage['/path.js'].functionData[11]++;
  _$jscoverage['/path.js'].lineData[174]++;
  var result = visit535_174_1(path.match(splitPathRe) || []), basename;
  _$jscoverage['/path.js'].lineData[176]++;
  basename = visit536_176_1(result[3] || '');
  _$jscoverage['/path.js'].lineData[177]++;
  if (visit537_177_1(ext && visit538_177_2(basename && visit539_177_3(basename.slice(-1 * ext.length) == ext)))) {
    _$jscoverage['/path.js'].lineData[178]++;
    basename = basename.slice(0, -1 * ext.length);
  }
  _$jscoverage['/path.js'].lineData[180]++;
  return basename;
}, 
  dirname: function(path) {
  _$jscoverage['/path.js'].functionData[12]++;
  _$jscoverage['/path.js'].lineData[189]++;
  var result = visit540_189_1(path.match(splitPathRe) || []), root = visit541_190_1(result[1] || ''), dir = visit542_191_1(result[2] || '');
  _$jscoverage['/path.js'].lineData[193]++;
  if (visit543_193_1(!root && !dir)) {
    _$jscoverage['/path.js'].lineData[195]++;
    return '.';
  }
  _$jscoverage['/path.js'].lineData[198]++;
  if (visit544_198_1(dir)) {
    _$jscoverage['/path.js'].lineData[200]++;
    dir = dir.substring(0, dir.length - 1);
  }
  _$jscoverage['/path.js'].lineData[203]++;
  return root + dir;
}, 
  extname: function(path) {
  _$jscoverage['/path.js'].functionData[13]++;
  _$jscoverage['/path.js'].lineData[212]++;
  return visit545_212_1((visit546_212_2(path.match(splitPathRe) || []))[4] || '');
}};
})(KISSY);
