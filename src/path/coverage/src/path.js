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
  _$jscoverage['/path.js'].lineData[11] = 0;
  _$jscoverage['/path.js'].lineData[12] = 0;
  _$jscoverage['/path.js'].lineData[13] = 0;
  _$jscoverage['/path.js'].lineData[14] = 0;
  _$jscoverage['/path.js'].lineData[15] = 0;
  _$jscoverage['/path.js'].lineData[18] = 0;
  _$jscoverage['/path.js'].lineData[22] = 0;
  _$jscoverage['/path.js'].lineData[24] = 0;
  _$jscoverage['/path.js'].lineData[31] = 0;
  _$jscoverage['/path.js'].lineData[32] = 0;
  _$jscoverage['/path.js'].lineData[33] = 0;
  _$jscoverage['/path.js'].lineData[34] = 0;
  _$jscoverage['/path.js'].lineData[35] = 0;
  _$jscoverage['/path.js'].lineData[36] = 0;
  _$jscoverage['/path.js'].lineData[37] = 0;
  _$jscoverage['/path.js'].lineData[39] = 0;
  _$jscoverage['/path.js'].lineData[45] = 0;
  _$jscoverage['/path.js'].lineData[46] = 0;
  _$jscoverage['/path.js'].lineData[47] = 0;
  _$jscoverage['/path.js'].lineData[51] = 0;
  _$jscoverage['/path.js'].lineData[53] = 0;
  _$jscoverage['/path.js'].lineData[61] = 0;
  _$jscoverage['/path.js'].lineData[67] = 0;
  _$jscoverage['/path.js'].lineData[74] = 0;
  _$jscoverage['/path.js'].lineData[75] = 0;
  _$jscoverage['/path.js'].lineData[76] = 0;
  _$jscoverage['/path.js'].lineData[77] = 0;
  _$jscoverage['/path.js'].lineData[79] = 0;
  _$jscoverage['/path.js'].lineData[80] = 0;
  _$jscoverage['/path.js'].lineData[83] = 0;
  _$jscoverage['/path.js'].lineData[84] = 0;
  _$jscoverage['/path.js'].lineData[87] = 0;
  _$jscoverage['/path.js'].lineData[101] = 0;
  _$jscoverage['/path.js'].lineData[104] = 0;
  _$jscoverage['/path.js'].lineData[105] = 0;
  _$jscoverage['/path.js'].lineData[108] = 0;
  _$jscoverage['/path.js'].lineData[109] = 0;
  _$jscoverage['/path.js'].lineData[112] = 0;
  _$jscoverage['/path.js'].lineData[113] = 0;
  _$jscoverage['/path.js'].lineData[116] = 0;
  _$jscoverage['/path.js'].lineData[124] = 0;
  _$jscoverage['/path.js'].lineData[125] = 0;
  _$jscoverage['/path.js'].lineData[126] = 0;
  _$jscoverage['/path.js'].lineData[142] = 0;
  _$jscoverage['/path.js'].lineData[143] = 0;
  _$jscoverage['/path.js'].lineData[145] = 0;
  _$jscoverage['/path.js'].lineData[146] = 0;
  _$jscoverage['/path.js'].lineData[152] = 0;
  _$jscoverage['/path.js'].lineData[155] = 0;
  _$jscoverage['/path.js'].lineData[156] = 0;
  _$jscoverage['/path.js'].lineData[157] = 0;
  _$jscoverage['/path.js'].lineData[161] = 0;
  _$jscoverage['/path.js'].lineData[163] = 0;
  _$jscoverage['/path.js'].lineData[164] = 0;
  _$jscoverage['/path.js'].lineData[165] = 0;
  _$jscoverage['/path.js'].lineData[168] = 0;
  _$jscoverage['/path.js'].lineData[170] = 0;
  _$jscoverage['/path.js'].lineData[172] = 0;
  _$jscoverage['/path.js'].lineData[182] = 0;
  _$jscoverage['/path.js'].lineData[184] = 0;
  _$jscoverage['/path.js'].lineData[185] = 0;
  _$jscoverage['/path.js'].lineData[186] = 0;
  _$jscoverage['/path.js'].lineData[188] = 0;
  _$jscoverage['/path.js'].lineData[197] = 0;
  _$jscoverage['/path.js'].lineData[201] = 0;
  _$jscoverage['/path.js'].lineData[203] = 0;
  _$jscoverage['/path.js'].lineData[206] = 0;
  _$jscoverage['/path.js'].lineData[208] = 0;
  _$jscoverage['/path.js'].lineData[211] = 0;
  _$jscoverage['/path.js'].lineData[220] = 0;
  _$jscoverage['/path.js'].lineData[224] = 0;
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
  _$jscoverage['/path.js'].functionData[14] = 0;
  _$jscoverage['/path.js'].functionData[15] = 0;
}
if (! _$jscoverage['/path.js'].branchData) {
  _$jscoverage['/path.js'].branchData = {};
  _$jscoverage['/path.js'].branchData['14'] = [];
  _$jscoverage['/path.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['31'] = [];
  _$jscoverage['/path.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['33'] = [];
  _$jscoverage['/path.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['34'] = [];
  _$jscoverage['/path.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['36'] = [];
  _$jscoverage['/path.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['45'] = [];
  _$jscoverage['/path.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['74'] = [];
  _$jscoverage['/path.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['76'] = [];
  _$jscoverage['/path.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['80'] = [];
  _$jscoverage['/path.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['87'] = [];
  _$jscoverage['/path.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['101'] = [];
  _$jscoverage['/path.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['102'] = [];
  _$jscoverage['/path.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['108'] = [];
  _$jscoverage['/path.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['112'] = [];
  _$jscoverage['/path.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['126'] = [];
  _$jscoverage['/path.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['155'] = [];
  _$jscoverage['/path.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['156'] = [];
  _$jscoverage['/path.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['163'] = [];
  _$jscoverage['/path.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['182'] = [];
  _$jscoverage['/path.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['184'] = [];
  _$jscoverage['/path.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['185'] = [];
  _$jscoverage['/path.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['185'][3] = new BranchData();
  _$jscoverage['/path.js'].branchData['197'] = [];
  _$jscoverage['/path.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['198'] = [];
  _$jscoverage['/path.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['199'] = [];
  _$jscoverage['/path.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['201'] = [];
  _$jscoverage['/path.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['206'] = [];
  _$jscoverage['/path.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['220'] = [];
  _$jscoverage['/path.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['220'][2] = new BranchData();
}
_$jscoverage['/path.js'].branchData['220'][2].init(22, 29, 'path.match(splitPathRe) || []');
function visit34_220_2(result) {
  _$jscoverage['/path.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['220'][1].init(22, 39, '(path.match(splitPathRe) || [])[4] || \'\'');
function visit33_220_1(result) {
  _$jscoverage['/path.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['206'][1].init(269, 3, 'dir');
function visit32_206_1(result) {
  _$jscoverage['/path.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['201'][1].init(158, 13, '!root && !dir');
function visit31_201_1(result) {
  _$jscoverage['/path.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['199'][1].init(107, 15, 'result[2] || \'\'');
function visit30_199_1(result) {
  _$jscoverage['/path.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['198'][1].init(67, 15, 'result[1] || \'\'');
function visit29_198_1(result) {
  _$jscoverage['/path.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['197'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit28_197_1(result) {
  _$jscoverage['/path.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['185'][3].init(162, 39, 'basename.slice(ext.length * -1) === ext');
function visit27_185_3(result) {
  _$jscoverage['/path.js'].branchData['185'][3].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['185'][2].init(150, 51, 'basename && basename.slice(ext.length * -1) === ext');
function visit26_185_2(result) {
  _$jscoverage['/path.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['185'][1].init(143, 58, 'ext && basename && basename.slice(ext.length * -1) === ext');
function visit25_185_1(result) {
  _$jscoverage['/path.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['184'][1].init(109, 15, 'result[3] || \'\'');
function visit24_184_1(result) {
  _$jscoverage['/path.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['182'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit23_182_1(result) {
  _$jscoverage['/path.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['163'][1].init(734, 28, 'sameIndex < fromParts.length');
function visit22_163_1(result) {
  _$jscoverage['/path.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['156'][1].init(22, 43, 'fromParts[sameIndex] !== toParts[sameIndex]');
function visit21_156_1(result) {
  _$jscoverage['/path.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['155'][1].init(502, 24, 'sameIndex < commonLength');
function visit20_155_1(result) {
  _$jscoverage['/path.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['126'][2].init(31, 21, 'typeof p === \'string\'');
function visit19_126_2(result) {
  _$jscoverage['/path.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['126'][1].init(25, 28, 'p && (typeof p === \'string\')');
function visit18_126_1(result) {
  _$jscoverage['/path.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['112'][1].init(361, 21, 'path && trailingSlash');
function visit17_112_1(result) {
  _$jscoverage['/path.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['108'][1].init(276, 18, '!path && !absolute');
function visit16_108_1(result) {
  _$jscoverage['/path.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['102'][1].init(71, 25, 'path.slice(0 - 1) === \'/\'');
function visit15_102_1(result) {
  _$jscoverage['/path.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['101'][1].init(29, 22, 'path.charAt(0) === \'/\'');
function visit14_101_1(result) {
  _$jscoverage['/path.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['87'][1].init(705, 46, '((absolute ? \'/\' : \'\') + resolvedPathStr) || \'.\'');
function visit13_87_1(result) {
  _$jscoverage['/path.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['80'][1].init(229, 22, 'path.charAt(0) === \'/\'');
function visit12_80_1(result) {
  _$jscoverage['/path.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['76'][2].init(55, 24, 'typeof path !== \'string\'');
function visit11_76_2(result) {
  _$jscoverage['/path.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['76'][1].init(55, 33, 'typeof path !== \'string\' || !path');
function visit10_76_1(result) {
  _$jscoverage['/path.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['74'][2].init(223, 6, 'i >= 0');
function visit9_74_2(result) {
  _$jscoverage['/path.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['74'][1].init(223, 19, 'i >= 0 && !absolute');
function visit8_74_1(result) {
  _$jscoverage['/path.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['45'][1].init(614, 14, 'allowAboveRoot');
function visit7_45_1(result) {
  _$jscoverage['/path.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['36'][1].init(95, 2, 'up');
function visit6_36_1(result) {
  _$jscoverage['/path.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['34'][1].init(22, 13, 'last === \'..\'');
function visit5_34_1(result) {
  _$jscoverage['/path.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['33'][1].init(48, 12, 'last !== \'.\'');
function visit4_33_1(result) {
  _$jscoverage['/path.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['31'][1].init(222, 6, 'i >= 0');
function visit3_31_1(result) {
  _$jscoverage['/path.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['14'][2].init(26, 15, 'context || this');
function visit2_14_2(result) {
  _$jscoverage['/path.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['14'][1].init(18, 38, 'fn.call(context || this, item, i, arr)');
function visit1_14_1(result) {
  _$jscoverage['/path.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].lineData[7]++;
KISSY.add(function(S) {
  _$jscoverage['/path.js'].functionData[0]++;
  _$jscoverage['/path.js'].lineData[9]++;
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  _$jscoverage['/path.js'].lineData[11]++;
  function filter(arr, fn, context) {
    _$jscoverage['/path.js'].functionData[1]++;
    _$jscoverage['/path.js'].lineData[12]++;
    var ret = [];
    _$jscoverage['/path.js'].lineData[13]++;
    S.each(arr, function(item, i, arr) {
  _$jscoverage['/path.js'].functionData[2]++;
  _$jscoverage['/path.js'].lineData[14]++;
  if (visit1_14_1(fn.call(visit2_14_2(context || this), item, i, arr))) {
    _$jscoverage['/path.js'].lineData[15]++;
    ret.push(item);
  }
});
    _$jscoverage['/path.js'].lineData[18]++;
    return ret;
  }
  _$jscoverage['/path.js'].lineData[22]++;
  function normalizeArray(parts, allowAboveRoot) {
    _$jscoverage['/path.js'].functionData[3]++;
    _$jscoverage['/path.js'].lineData[24]++;
    var up = 0, i = parts.length - 1, newParts = [], last;
    _$jscoverage['/path.js'].lineData[31]++;
    for (; visit3_31_1(i >= 0); i--) {
      _$jscoverage['/path.js'].lineData[32]++;
      last = parts[i];
      _$jscoverage['/path.js'].lineData[33]++;
      if (visit4_33_1(last !== '.')) {
        _$jscoverage['/path.js'].lineData[34]++;
        if (visit5_34_1(last === '..')) {
          _$jscoverage['/path.js'].lineData[35]++;
          up++;
        } else {
          _$jscoverage['/path.js'].lineData[36]++;
          if (visit6_36_1(up)) {
            _$jscoverage['/path.js'].lineData[37]++;
            up--;
          } else {
            _$jscoverage['/path.js'].lineData[39]++;
            newParts[newParts.length] = last;
          }
        }
      }
    }
    _$jscoverage['/path.js'].lineData[45]++;
    if (visit7_45_1(allowAboveRoot)) {
      _$jscoverage['/path.js'].lineData[46]++;
      for (; up--; up) {
        _$jscoverage['/path.js'].lineData[47]++;
        newParts[newParts.length] = '..';
      }
    }
    _$jscoverage['/path.js'].lineData[51]++;
    newParts = newParts.reverse();
    _$jscoverage['/path.js'].lineData[53]++;
    return newParts;
  }
  _$jscoverage['/path.js'].lineData[61]++;
  var Path = S.Path = {
  resolve: function() {
  _$jscoverage['/path.js'].functionData[4]++;
  _$jscoverage['/path.js'].lineData[67]++;
  var resolvedPath = '', resolvedPathStr, i, args = (arguments), path, absolute = 0;
  _$jscoverage['/path.js'].lineData[74]++;
  for (i = args.length - 1; visit8_74_1(visit9_74_2(i >= 0) && !absolute); i--) {
    _$jscoverage['/path.js'].lineData[75]++;
    path = args[i];
    _$jscoverage['/path.js'].lineData[76]++;
    if (visit10_76_1(visit11_76_2(typeof path !== 'string') || !path)) {
      _$jscoverage['/path.js'].lineData[77]++;
      continue;
    }
    _$jscoverage['/path.js'].lineData[79]++;
    resolvedPath = path + '/' + resolvedPath;
    _$jscoverage['/path.js'].lineData[80]++;
    absolute = visit12_80_1(path.charAt(0) === '/');
  }
  _$jscoverage['/path.js'].lineData[83]++;
  resolvedPathStr = normalizeArray(filter(resolvedPath.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[5]++;
  _$jscoverage['/path.js'].lineData[84]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[87]++;
  return visit13_87_1(((absolute ? '/' : '') + resolvedPathStr) || '.');
}, 
  normalize: function(path) {
  _$jscoverage['/path.js'].functionData[6]++;
  _$jscoverage['/path.js'].lineData[101]++;
  var absolute = visit14_101_1(path.charAt(0) === '/'), trailingSlash = visit15_102_1(path.slice(0 - 1) === '/');
  _$jscoverage['/path.js'].lineData[104]++;
  path = normalizeArray(filter(path.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[7]++;
  _$jscoverage['/path.js'].lineData[105]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[108]++;
  if (visit16_108_1(!path && !absolute)) {
    _$jscoverage['/path.js'].lineData[109]++;
    path = '.';
  }
  _$jscoverage['/path.js'].lineData[112]++;
  if (visit17_112_1(path && trailingSlash)) {
    _$jscoverage['/path.js'].lineData[113]++;
    path += '/';
  }
  _$jscoverage['/path.js'].lineData[116]++;
  return (absolute ? '/' : '') + path;
}, 
  join: function() {
  _$jscoverage['/path.js'].functionData[8]++;
  _$jscoverage['/path.js'].lineData[124]++;
  var args = Array.prototype.slice.call(arguments);
  _$jscoverage['/path.js'].lineData[125]++;
  return Path.normalize(filter(args, function(p) {
  _$jscoverage['/path.js'].functionData[9]++;
  _$jscoverage['/path.js'].lineData[126]++;
  return visit18_126_1(p && (visit19_126_2(typeof p === 'string')));
}).join('/'));
}, 
  relative: function(from, to) {
  _$jscoverage['/path.js'].functionData[10]++;
  _$jscoverage['/path.js'].lineData[142]++;
  from = Path.normalize(from);
  _$jscoverage['/path.js'].lineData[143]++;
  to = Path.normalize(to);
  _$jscoverage['/path.js'].lineData[145]++;
  var fromParts = filter(from.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[11]++;
  _$jscoverage['/path.js'].lineData[146]++;
  return !!p;
}), path = [], sameIndex, sameIndex2, toParts = filter(to.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[12]++;
  _$jscoverage['/path.js'].lineData[152]++;
  return !!p;
}), commonLength = Math.min(fromParts.length, toParts.length);
  _$jscoverage['/path.js'].lineData[155]++;
  for (sameIndex = 0; visit20_155_1(sameIndex < commonLength); sameIndex++) {
    _$jscoverage['/path.js'].lineData[156]++;
    if (visit21_156_1(fromParts[sameIndex] !== toParts[sameIndex])) {
      _$jscoverage['/path.js'].lineData[157]++;
      break;
    }
  }
  _$jscoverage['/path.js'].lineData[161]++;
  sameIndex2 = sameIndex;
  _$jscoverage['/path.js'].lineData[163]++;
  while (visit22_163_1(sameIndex < fromParts.length)) {
    _$jscoverage['/path.js'].lineData[164]++;
    path.push('..');
    _$jscoverage['/path.js'].lineData[165]++;
    sameIndex++;
  }
  _$jscoverage['/path.js'].lineData[168]++;
  path = path.concat(toParts.slice(sameIndex2));
  _$jscoverage['/path.js'].lineData[170]++;
  path = path.join('/');
  _$jscoverage['/path.js'].lineData[172]++;
  return path;
}, 
  basename: function(path, ext) {
  _$jscoverage['/path.js'].functionData[13]++;
  _$jscoverage['/path.js'].lineData[182]++;
  var result = visit23_182_1(path.match(splitPathRe) || []), basename;
  _$jscoverage['/path.js'].lineData[184]++;
  basename = visit24_184_1(result[3] || '');
  _$jscoverage['/path.js'].lineData[185]++;
  if (visit25_185_1(ext && visit26_185_2(basename && visit27_185_3(basename.slice(ext.length * -1) === ext)))) {
    _$jscoverage['/path.js'].lineData[186]++;
    basename = basename.slice(0, -1 * ext.length);
  }
  _$jscoverage['/path.js'].lineData[188]++;
  return basename;
}, 
  dirname: function(path) {
  _$jscoverage['/path.js'].functionData[14]++;
  _$jscoverage['/path.js'].lineData[197]++;
  var result = visit28_197_1(path.match(splitPathRe) || []), root = visit29_198_1(result[1] || ''), dir = visit30_199_1(result[2] || '');
  _$jscoverage['/path.js'].lineData[201]++;
  if (visit31_201_1(!root && !dir)) {
    _$jscoverage['/path.js'].lineData[203]++;
    return '.';
  }
  _$jscoverage['/path.js'].lineData[206]++;
  if (visit32_206_1(dir)) {
    _$jscoverage['/path.js'].lineData[208]++;
    dir = dir.substring(0, dir.length - 1);
  }
  _$jscoverage['/path.js'].lineData[211]++;
  return root + dir;
}, 
  extname: function(path) {
  _$jscoverage['/path.js'].functionData[15]++;
  _$jscoverage['/path.js'].lineData[220]++;
  return visit33_220_1((visit34_220_2(path.match(splitPathRe) || []))[4] || '');
}};
  _$jscoverage['/path.js'].lineData[224]++;
  return Path;
});
