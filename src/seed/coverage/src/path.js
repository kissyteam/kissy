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
  _$jscoverage['/path.js'].lineData[10] = 0;
  _$jscoverage['/path.js'].lineData[19] = 0;
  _$jscoverage['/path.js'].lineData[21] = 0;
  _$jscoverage['/path.js'].lineData[28] = 0;
  _$jscoverage['/path.js'].lineData[29] = 0;
  _$jscoverage['/path.js'].lineData[30] = 0;
  _$jscoverage['/path.js'].lineData[31] = 0;
  _$jscoverage['/path.js'].lineData[32] = 0;
  _$jscoverage['/path.js'].lineData[33] = 0;
  _$jscoverage['/path.js'].lineData[34] = 0;
  _$jscoverage['/path.js'].lineData[36] = 0;
  _$jscoverage['/path.js'].lineData[41] = 0;
  _$jscoverage['/path.js'].lineData[42] = 0;
  _$jscoverage['/path.js'].lineData[43] = 0;
  _$jscoverage['/path.js'].lineData[47] = 0;
  _$jscoverage['/path.js'].lineData[49] = 0;
  _$jscoverage['/path.js'].lineData[57] = 0;
  _$jscoverage['/path.js'].lineData[65] = 0;
  _$jscoverage['/path.js'].lineData[72] = 0;
  _$jscoverage['/path.js'].lineData[73] = 0;
  _$jscoverage['/path.js'].lineData[74] = 0;
  _$jscoverage['/path.js'].lineData[75] = 0;
  _$jscoverage['/path.js'].lineData[77] = 0;
  _$jscoverage['/path.js'].lineData[78] = 0;
  _$jscoverage['/path.js'].lineData[81] = 0;
  _$jscoverage['/path.js'].lineData[82] = 0;
  _$jscoverage['/path.js'].lineData[85] = 0;
  _$jscoverage['/path.js'].lineData[100] = 0;
  _$jscoverage['/path.js'].lineData[103] = 0;
  _$jscoverage['/path.js'].lineData[104] = 0;
  _$jscoverage['/path.js'].lineData[107] = 0;
  _$jscoverage['/path.js'].lineData[108] = 0;
  _$jscoverage['/path.js'].lineData[111] = 0;
  _$jscoverage['/path.js'].lineData[112] = 0;
  _$jscoverage['/path.js'].lineData[116] = 0;
  _$jscoverage['/path.js'].lineData[124] = 0;
  _$jscoverage['/path.js'].lineData[125] = 0;
  _$jscoverage['/path.js'].lineData[126] = 0;
  _$jscoverage['/path.js'].lineData[143] = 0;
  _$jscoverage['/path.js'].lineData[144] = 0;
  _$jscoverage['/path.js'].lineData[146] = 0;
  _$jscoverage['/path.js'].lineData[147] = 0;
  _$jscoverage['/path.js'].lineData[153] = 0;
  _$jscoverage['/path.js'].lineData[156] = 0;
  _$jscoverage['/path.js'].lineData[157] = 0;
  _$jscoverage['/path.js'].lineData[158] = 0;
  _$jscoverage['/path.js'].lineData[162] = 0;
  _$jscoverage['/path.js'].lineData[164] = 0;
  _$jscoverage['/path.js'].lineData[165] = 0;
  _$jscoverage['/path.js'].lineData[166] = 0;
  _$jscoverage['/path.js'].lineData[169] = 0;
  _$jscoverage['/path.js'].lineData[171] = 0;
  _$jscoverage['/path.js'].lineData[173] = 0;
  _$jscoverage['/path.js'].lineData[183] = 0;
  _$jscoverage['/path.js'].lineData[185] = 0;
  _$jscoverage['/path.js'].lineData[186] = 0;
  _$jscoverage['/path.js'].lineData[187] = 0;
  _$jscoverage['/path.js'].lineData[189] = 0;
  _$jscoverage['/path.js'].lineData[197] = 0;
  _$jscoverage['/path.js'].lineData[201] = 0;
  _$jscoverage['/path.js'].lineData[203] = 0;
  _$jscoverage['/path.js'].lineData[206] = 0;
  _$jscoverage['/path.js'].lineData[208] = 0;
  _$jscoverage['/path.js'].lineData[211] = 0;
  _$jscoverage['/path.js'].lineData[220] = 0;
  _$jscoverage['/path.js'].lineData[224] = 0;
  _$jscoverage['/path.js'].lineData[225] = 0;
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
  _$jscoverage['/path.js'].branchData['28'] = [];
  _$jscoverage['/path.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['30'] = [];
  _$jscoverage['/path.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['31'] = [];
  _$jscoverage['/path.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['33'] = [];
  _$jscoverage['/path.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['41'] = [];
  _$jscoverage['/path.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['72'] = [];
  _$jscoverage['/path.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['74'] = [];
  _$jscoverage['/path.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['78'] = [];
  _$jscoverage['/path.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['85'] = [];
  _$jscoverage['/path.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['100'] = [];
  _$jscoverage['/path.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['101'] = [];
  _$jscoverage['/path.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['107'] = [];
  _$jscoverage['/path.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['111'] = [];
  _$jscoverage['/path.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['126'] = [];
  _$jscoverage['/path.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['156'] = [];
  _$jscoverage['/path.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['157'] = [];
  _$jscoverage['/path.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['164'] = [];
  _$jscoverage['/path.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['183'] = [];
  _$jscoverage['/path.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['185'] = [];
  _$jscoverage['/path.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['186'] = [];
  _$jscoverage['/path.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['186'][3] = new BranchData();
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
  _$jscoverage['/path.js'].branchData['224'] = [];
  _$jscoverage['/path.js'].branchData['224'][1] = new BranchData();
}
_$jscoverage['/path.js'].branchData['224'][1].init(6120, 4, 'Path');
function visit528_224_1(result) {
  _$jscoverage['/path.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['220'][2].init(22, 29, 'path.match(splitPathRe) || []');
function visit527_220_2(result) {
  _$jscoverage['/path.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['220'][1].init(22, 39, '(path.match(splitPathRe) || [])[4] || \'\'');
function visit526_220_1(result) {
  _$jscoverage['/path.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['206'][1].init(269, 3, 'dir');
function visit525_206_1(result) {
  _$jscoverage['/path.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['201'][1].init(158, 13, '!root && !dir');
function visit524_201_1(result) {
  _$jscoverage['/path.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['199'][1].init(107, 15, 'result[2] || \'\'');
function visit523_199_1(result) {
  _$jscoverage['/path.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['198'][1].init(67, 15, 'result[1] || \'\'');
function visit522_198_1(result) {
  _$jscoverage['/path.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['197'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit521_197_1(result) {
  _$jscoverage['/path.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['186'][3].init(162, 38, 'basename.slice(-1 * ext.length) == ext');
function visit520_186_3(result) {
  _$jscoverage['/path.js'].branchData['186'][3].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['186'][2].init(150, 50, 'basename && basename.slice(-1 * ext.length) == ext');
function visit519_186_2(result) {
  _$jscoverage['/path.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['186'][1].init(143, 57, 'ext && basename && basename.slice(-1 * ext.length) == ext');
function visit518_186_1(result) {
  _$jscoverage['/path.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['185'][1].init(109, 15, 'result[3] || \'\'');
function visit517_185_1(result) {
  _$jscoverage['/path.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['183'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit516_183_1(result) {
  _$jscoverage['/path.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['164'][1].init(737, 28, 'sameIndex < fromParts.length');
function visit515_164_1(result) {
  _$jscoverage['/path.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['157'][1].init(22, 42, 'fromParts[sameIndex] != toParts[sameIndex]');
function visit514_157_1(result) {
  _$jscoverage['/path.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['156'][1].init(506, 24, 'sameIndex < commonLength');
function visit513_156_1(result) {
  _$jscoverage['/path.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['126'][2].init(31, 20, 'typeof p == \'string\'');
function visit512_126_2(result) {
  _$jscoverage['/path.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['126'][1].init(25, 27, 'p && (typeof p == \'string\')');
function visit511_126_1(result) {
  _$jscoverage['/path.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['111'][1].init(358, 21, 'path && trailingSlash');
function visit510_111_1(result) {
  _$jscoverage['/path.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['107'][1].init(273, 18, '!path && !absolute');
function visit509_107_1(result) {
  _$jscoverage['/path.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['101'][1].init(70, 21, 'path.slice(-1) == \'/\'');
function visit508_101_1(result) {
  _$jscoverage['/path.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['100'][1].init(29, 21, 'path.charAt(0) == \'/\'');
function visit507_100_1(result) {
  _$jscoverage['/path.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['85'][1].init(705, 46, '((absolute ? \'/\' : \'\') + resolvedPathStr) || \'.\'');
function visit506_85_1(result) {
  _$jscoverage['/path.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['78'][1].init(228, 21, 'path.charAt(0) == \'/\'');
function visit505_78_1(result) {
  _$jscoverage['/path.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['74'][2].init(55, 23, 'typeof path != \'string\'');
function visit504_74_2(result) {
  _$jscoverage['/path.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['74'][1].init(55, 32, 'typeof path != \'string\' || !path');
function visit503_74_1(result) {
  _$jscoverage['/path.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['72'][2].init(223, 6, 'i >= 0');
function visit502_72_2(result) {
  _$jscoverage['/path.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['72'][1].init(223, 19, 'i >= 0 && !absolute');
function visit501_72_1(result) {
  _$jscoverage['/path.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['41'][1].init(585, 14, 'allowAboveRoot');
function visit500_41_1(result) {
  _$jscoverage['/path.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['33'][1].init(153, 2, 'up');
function visit499_33_1(result) {
  _$jscoverage['/path.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['31'][1].init(88, 13, 'last === \'..\'');
function visit498_31_1(result) {
  _$jscoverage['/path.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['30'][1].init(48, 11, 'last == \'.\'');
function visit497_30_1(result) {
  _$jscoverage['/path.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['28'][1].init(230, 6, 'i >= 0');
function visit496_28_1(result) {
  _$jscoverage['/path.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/path.js'].functionData[0]++;
  _$jscoverage['/path.js'].lineData[10]++;
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  _$jscoverage['/path.js'].lineData[19]++;
  function normalizeArray(parts, allowAboveRoot) {
    _$jscoverage['/path.js'].functionData[1]++;
    _$jscoverage['/path.js'].lineData[21]++;
    var up = 0, i = parts.length - 1, newParts = [], last;
    _$jscoverage['/path.js'].lineData[28]++;
    for (; visit496_28_1(i >= 0); i--) {
      _$jscoverage['/path.js'].lineData[29]++;
      last = parts[i];
      _$jscoverage['/path.js'].lineData[30]++;
      if (visit497_30_1(last == '.')) {
      } else {
        _$jscoverage['/path.js'].lineData[31]++;
        if (visit498_31_1(last === '..')) {
          _$jscoverage['/path.js'].lineData[32]++;
          up++;
        } else {
          _$jscoverage['/path.js'].lineData[33]++;
          if (visit499_33_1(up)) {
            _$jscoverage['/path.js'].lineData[34]++;
            up--;
          } else {
            _$jscoverage['/path.js'].lineData[36]++;
            newParts[newParts.length] = last;
          }
        }
      }
    }
    _$jscoverage['/path.js'].lineData[41]++;
    if (visit500_41_1(allowAboveRoot)) {
      _$jscoverage['/path.js'].lineData[42]++;
      for (; up--; up) {
        _$jscoverage['/path.js'].lineData[43]++;
        newParts[newParts.length] = '..';
      }
    }
    _$jscoverage['/path.js'].lineData[47]++;
    newParts = newParts.reverse();
    _$jscoverage['/path.js'].lineData[49]++;
    return newParts;
  }
  _$jscoverage['/path.js'].lineData[57]++;
  var Path = {
  resolve: function() {
  _$jscoverage['/path.js'].functionData[2]++;
  _$jscoverage['/path.js'].lineData[65]++;
  var resolvedPath = '', resolvedPathStr, i, args = (arguments), path, absolute = 0;
  _$jscoverage['/path.js'].lineData[72]++;
  for (i = args.length - 1; visit501_72_1(visit502_72_2(i >= 0) && !absolute); i--) {
    _$jscoverage['/path.js'].lineData[73]++;
    path = args[i];
    _$jscoverage['/path.js'].lineData[74]++;
    if (visit503_74_1(visit504_74_2(typeof path != 'string') || !path)) {
      _$jscoverage['/path.js'].lineData[75]++;
      continue;
    }
    _$jscoverage['/path.js'].lineData[77]++;
    resolvedPath = path + '/' + resolvedPath;
    _$jscoverage['/path.js'].lineData[78]++;
    absolute = visit505_78_1(path.charAt(0) == '/');
  }
  _$jscoverage['/path.js'].lineData[81]++;
  resolvedPathStr = normalizeArray(S.filter(resolvedPath.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[3]++;
  _$jscoverage['/path.js'].lineData[82]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[85]++;
  return visit506_85_1(((absolute ? '/' : '') + resolvedPathStr) || '.');
}, 
  normalize: function(path) {
  _$jscoverage['/path.js'].functionData[4]++;
  _$jscoverage['/path.js'].lineData[100]++;
  var absolute = visit507_100_1(path.charAt(0) == '/'), trailingSlash = visit508_101_1(path.slice(-1) == '/');
  _$jscoverage['/path.js'].lineData[103]++;
  path = normalizeArray(S.filter(path.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[5]++;
  _$jscoverage['/path.js'].lineData[104]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[107]++;
  if (visit509_107_1(!path && !absolute)) {
    _$jscoverage['/path.js'].lineData[108]++;
    path = '.';
  }
  _$jscoverage['/path.js'].lineData[111]++;
  if (visit510_111_1(path && trailingSlash)) {
    _$jscoverage['/path.js'].lineData[112]++;
    path += '/';
  }
  _$jscoverage['/path.js'].lineData[116]++;
  return (absolute ? '/' : '') + path;
}, 
  join: function() {
  _$jscoverage['/path.js'].functionData[6]++;
  _$jscoverage['/path.js'].lineData[124]++;
  var args = S.makeArray(arguments);
  _$jscoverage['/path.js'].lineData[125]++;
  return Path.normalize(S.filter(args, function(p) {
  _$jscoverage['/path.js'].functionData[7]++;
  _$jscoverage['/path.js'].lineData[126]++;
  return visit511_126_1(p && (visit512_126_2(typeof p == 'string')));
}).join('/'));
}, 
  relative: function(from, to) {
  _$jscoverage['/path.js'].functionData[8]++;
  _$jscoverage['/path.js'].lineData[143]++;
  from = Path.normalize(from);
  _$jscoverage['/path.js'].lineData[144]++;
  to = Path.normalize(to);
  _$jscoverage['/path.js'].lineData[146]++;
  var fromParts = S.filter(from.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[9]++;
  _$jscoverage['/path.js'].lineData[147]++;
  return !!p;
}), path = [], sameIndex, sameIndex2, toParts = S.filter(to.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[10]++;
  _$jscoverage['/path.js'].lineData[153]++;
  return !!p;
}), commonLength = Math.min(fromParts.length, toParts.length);
  _$jscoverage['/path.js'].lineData[156]++;
  for (sameIndex = 0; visit513_156_1(sameIndex < commonLength); sameIndex++) {
    _$jscoverage['/path.js'].lineData[157]++;
    if (visit514_157_1(fromParts[sameIndex] != toParts[sameIndex])) {
      _$jscoverage['/path.js'].lineData[158]++;
      break;
    }
  }
  _$jscoverage['/path.js'].lineData[162]++;
  sameIndex2 = sameIndex;
  _$jscoverage['/path.js'].lineData[164]++;
  while (visit515_164_1(sameIndex < fromParts.length)) {
    _$jscoverage['/path.js'].lineData[165]++;
    path.push('..');
    _$jscoverage['/path.js'].lineData[166]++;
    sameIndex++;
  }
  _$jscoverage['/path.js'].lineData[169]++;
  path = path.concat(toParts.slice(sameIndex2));
  _$jscoverage['/path.js'].lineData[171]++;
  path = path.join('/');
  _$jscoverage['/path.js'].lineData[173]++;
  return path;
}, 
  basename: function(path, ext) {
  _$jscoverage['/path.js'].functionData[11]++;
  _$jscoverage['/path.js'].lineData[183]++;
  var result = visit516_183_1(path.match(splitPathRe) || []), basename;
  _$jscoverage['/path.js'].lineData[185]++;
  basename = visit517_185_1(result[3] || '');
  _$jscoverage['/path.js'].lineData[186]++;
  if (visit518_186_1(ext && visit519_186_2(basename && visit520_186_3(basename.slice(-1 * ext.length) == ext)))) {
    _$jscoverage['/path.js'].lineData[187]++;
    basename = basename.slice(0, -1 * ext.length);
  }
  _$jscoverage['/path.js'].lineData[189]++;
  return basename;
}, 
  dirname: function(path) {
  _$jscoverage['/path.js'].functionData[12]++;
  _$jscoverage['/path.js'].lineData[197]++;
  var result = visit521_197_1(path.match(splitPathRe) || []), root = visit522_198_1(result[1] || ''), dir = visit523_199_1(result[2] || '');
  _$jscoverage['/path.js'].lineData[201]++;
  if (visit524_201_1(!root && !dir)) {
    _$jscoverage['/path.js'].lineData[203]++;
    return '.';
  }
  _$jscoverage['/path.js'].lineData[206]++;
  if (visit525_206_1(dir)) {
    _$jscoverage['/path.js'].lineData[208]++;
    dir = dir.substring(0, dir.length - 1);
  }
  _$jscoverage['/path.js'].lineData[211]++;
  return root + dir;
}, 
  extname: function(path) {
  _$jscoverage['/path.js'].functionData[13]++;
  _$jscoverage['/path.js'].lineData[220]++;
  return visit526_220_1((visit527_220_2(path.match(splitPathRe) || []))[4] || '');
}};
  _$jscoverage['/path.js'].lineData[224]++;
  if (visit528_224_1(Path)) {
    _$jscoverage['/path.js'].lineData[225]++;
    S.Path = Path;
  }
})(KISSY);
