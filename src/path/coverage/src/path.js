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
  _$jscoverage['/path.js'].lineData[8] = 0;
  _$jscoverage['/path.js'].lineData[10] = 0;
  _$jscoverage['/path.js'].lineData[12] = 0;
  _$jscoverage['/path.js'].lineData[13] = 0;
  _$jscoverage['/path.js'].lineData[14] = 0;
  _$jscoverage['/path.js'].lineData[15] = 0;
  _$jscoverage['/path.js'].lineData[16] = 0;
  _$jscoverage['/path.js'].lineData[19] = 0;
  _$jscoverage['/path.js'].lineData[23] = 0;
  _$jscoverage['/path.js'].lineData[25] = 0;
  _$jscoverage['/path.js'].lineData[32] = 0;
  _$jscoverage['/path.js'].lineData[33] = 0;
  _$jscoverage['/path.js'].lineData[34] = 0;
  _$jscoverage['/path.js'].lineData[35] = 0;
  _$jscoverage['/path.js'].lineData[36] = 0;
  _$jscoverage['/path.js'].lineData[37] = 0;
  _$jscoverage['/path.js'].lineData[38] = 0;
  _$jscoverage['/path.js'].lineData[40] = 0;
  _$jscoverage['/path.js'].lineData[46] = 0;
  _$jscoverage['/path.js'].lineData[47] = 0;
  _$jscoverage['/path.js'].lineData[48] = 0;
  _$jscoverage['/path.js'].lineData[52] = 0;
  _$jscoverage['/path.js'].lineData[54] = 0;
  _$jscoverage['/path.js'].lineData[62] = 0;
  _$jscoverage['/path.js'].lineData[68] = 0;
  _$jscoverage['/path.js'].lineData[75] = 0;
  _$jscoverage['/path.js'].lineData[76] = 0;
  _$jscoverage['/path.js'].lineData[77] = 0;
  _$jscoverage['/path.js'].lineData[78] = 0;
  _$jscoverage['/path.js'].lineData[80] = 0;
  _$jscoverage['/path.js'].lineData[81] = 0;
  _$jscoverage['/path.js'].lineData[84] = 0;
  _$jscoverage['/path.js'].lineData[85] = 0;
  _$jscoverage['/path.js'].lineData[88] = 0;
  _$jscoverage['/path.js'].lineData[102] = 0;
  _$jscoverage['/path.js'].lineData[105] = 0;
  _$jscoverage['/path.js'].lineData[106] = 0;
  _$jscoverage['/path.js'].lineData[109] = 0;
  _$jscoverage['/path.js'].lineData[110] = 0;
  _$jscoverage['/path.js'].lineData[113] = 0;
  _$jscoverage['/path.js'].lineData[114] = 0;
  _$jscoverage['/path.js'].lineData[117] = 0;
  _$jscoverage['/path.js'].lineData[125] = 0;
  _$jscoverage['/path.js'].lineData[126] = 0;
  _$jscoverage['/path.js'].lineData[127] = 0;
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
  _$jscoverage['/path.js'].lineData[198] = 0;
  _$jscoverage['/path.js'].lineData[202] = 0;
  _$jscoverage['/path.js'].lineData[204] = 0;
  _$jscoverage['/path.js'].lineData[207] = 0;
  _$jscoverage['/path.js'].lineData[209] = 0;
  _$jscoverage['/path.js'].lineData[212] = 0;
  _$jscoverage['/path.js'].lineData[221] = 0;
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
  _$jscoverage['/path.js'].functionData[14] = 0;
  _$jscoverage['/path.js'].functionData[15] = 0;
}
if (! _$jscoverage['/path.js'].branchData) {
  _$jscoverage['/path.js'].branchData = {};
  _$jscoverage['/path.js'].branchData['15'] = [];
  _$jscoverage['/path.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['32'] = [];
  _$jscoverage['/path.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['34'] = [];
  _$jscoverage['/path.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['35'] = [];
  _$jscoverage['/path.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['37'] = [];
  _$jscoverage['/path.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['46'] = [];
  _$jscoverage['/path.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['75'] = [];
  _$jscoverage['/path.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['77'] = [];
  _$jscoverage['/path.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['81'] = [];
  _$jscoverage['/path.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['88'] = [];
  _$jscoverage['/path.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['102'] = [];
  _$jscoverage['/path.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['103'] = [];
  _$jscoverage['/path.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['109'] = [];
  _$jscoverage['/path.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['113'] = [];
  _$jscoverage['/path.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['127'] = [];
  _$jscoverage['/path.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['127'][2] = new BranchData();
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
  _$jscoverage['/path.js'].branchData['198'] = [];
  _$jscoverage['/path.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['199'] = [];
  _$jscoverage['/path.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['200'] = [];
  _$jscoverage['/path.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['202'] = [];
  _$jscoverage['/path.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['207'] = [];
  _$jscoverage['/path.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['221'] = [];
  _$jscoverage['/path.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['221'][2] = new BranchData();
}
_$jscoverage['/path.js'].branchData['221'][2].init(22, 29, 'path.match(splitPathRe) || []');
function visit34_221_2(result) {
  _$jscoverage['/path.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['221'][1].init(22, 39, '(path.match(splitPathRe) || [])[4] || \'\'');
function visit33_221_1(result) {
  _$jscoverage['/path.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['207'][1].init(269, 3, 'dir');
function visit32_207_1(result) {
  _$jscoverage['/path.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['202'][1].init(158, 13, '!root && !dir');
function visit31_202_1(result) {
  _$jscoverage['/path.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['200'][1].init(107, 15, 'result[2] || \'\'');
function visit30_200_1(result) {
  _$jscoverage['/path.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['199'][1].init(67, 15, 'result[1] || \'\'');
function visit29_199_1(result) {
  _$jscoverage['/path.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['198'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit28_198_1(result) {
  _$jscoverage['/path.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['186'][3].init(162, 39, 'basename.slice(ext.length * -1) === ext');
function visit27_186_3(result) {
  _$jscoverage['/path.js'].branchData['186'][3].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['186'][2].init(150, 51, 'basename && basename.slice(ext.length * -1) === ext');
function visit26_186_2(result) {
  _$jscoverage['/path.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['186'][1].init(143, 58, 'ext && basename && basename.slice(ext.length * -1) === ext');
function visit25_186_1(result) {
  _$jscoverage['/path.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['185'][1].init(109, 15, 'result[3] || \'\'');
function visit24_185_1(result) {
  _$jscoverage['/path.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['183'][1].init(27, 29, 'path.match(splitPathRe) || []');
function visit23_183_1(result) {
  _$jscoverage['/path.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['164'][1].init(734, 28, 'sameIndex < fromParts.length');
function visit22_164_1(result) {
  _$jscoverage['/path.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['157'][1].init(22, 43, 'fromParts[sameIndex] !== toParts[sameIndex]');
function visit21_157_1(result) {
  _$jscoverage['/path.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['156'][1].init(502, 24, 'sameIndex < commonLength');
function visit20_156_1(result) {
  _$jscoverage['/path.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['127'][2].init(31, 21, 'typeof p === \'string\'');
function visit19_127_2(result) {
  _$jscoverage['/path.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['127'][1].init(25, 28, 'p && (typeof p === \'string\')');
function visit18_127_1(result) {
  _$jscoverage['/path.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['113'][1].init(361, 21, 'path && trailingSlash');
function visit17_113_1(result) {
  _$jscoverage['/path.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['109'][1].init(276, 18, '!path && !absolute');
function visit16_109_1(result) {
  _$jscoverage['/path.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['103'][1].init(71, 25, 'path.slice(0 - 1) === \'/\'');
function visit15_103_1(result) {
  _$jscoverage['/path.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['102'][1].init(29, 22, 'path.charAt(0) === \'/\'');
function visit14_102_1(result) {
  _$jscoverage['/path.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['88'][1].init(705, 46, '((absolute ? \'/\' : \'\') + resolvedPathStr) || \'.\'');
function visit13_88_1(result) {
  _$jscoverage['/path.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['81'][1].init(229, 22, 'path.charAt(0) === \'/\'');
function visit12_81_1(result) {
  _$jscoverage['/path.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['77'][2].init(55, 24, 'typeof path !== \'string\'');
function visit11_77_2(result) {
  _$jscoverage['/path.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['77'][1].init(55, 33, 'typeof path !== \'string\' || !path');
function visit10_77_1(result) {
  _$jscoverage['/path.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['75'][2].init(223, 6, 'i >= 0');
function visit9_75_2(result) {
  _$jscoverage['/path.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['75'][1].init(223, 19, 'i >= 0 && !absolute');
function visit8_75_1(result) {
  _$jscoverage['/path.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['46'][1].init(614, 14, 'allowAboveRoot');
function visit7_46_1(result) {
  _$jscoverage['/path.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['37'][1].init(95, 2, 'up');
function visit6_37_1(result) {
  _$jscoverage['/path.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['35'][1].init(22, 13, 'last === \'..\'');
function visit5_35_1(result) {
  _$jscoverage['/path.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['34'][1].init(48, 12, 'last !== \'.\'');
function visit4_34_1(result) {
  _$jscoverage['/path.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['32'][1].init(222, 6, 'i >= 0');
function visit3_32_1(result) {
  _$jscoverage['/path.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['15'][2].init(26, 15, 'context || this');
function visit2_15_2(result) {
  _$jscoverage['/path.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['15'][1].init(18, 38, 'fn.call(context || this, item, i, arr)');
function visit1_15_1(result) {
  _$jscoverage['/path.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/path.js'].functionData[0]++;
  _$jscoverage['/path.js'].lineData[8]++;
  require('util');
  _$jscoverage['/path.js'].lineData[10]++;
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  _$jscoverage['/path.js'].lineData[12]++;
  function filter(arr, fn, context) {
    _$jscoverage['/path.js'].functionData[1]++;
    _$jscoverage['/path.js'].lineData[13]++;
    var ret = [];
    _$jscoverage['/path.js'].lineData[14]++;
    S.each(arr, function(item, i, arr) {
  _$jscoverage['/path.js'].functionData[2]++;
  _$jscoverage['/path.js'].lineData[15]++;
  if (visit1_15_1(fn.call(visit2_15_2(context || this), item, i, arr))) {
    _$jscoverage['/path.js'].lineData[16]++;
    ret.push(item);
  }
});
    _$jscoverage['/path.js'].lineData[19]++;
    return ret;
  }
  _$jscoverage['/path.js'].lineData[23]++;
  function normalizeArray(parts, allowAboveRoot) {
    _$jscoverage['/path.js'].functionData[3]++;
    _$jscoverage['/path.js'].lineData[25]++;
    var up = 0, i = parts.length - 1, newParts = [], last;
    _$jscoverage['/path.js'].lineData[32]++;
    for (; visit3_32_1(i >= 0); i--) {
      _$jscoverage['/path.js'].lineData[33]++;
      last = parts[i];
      _$jscoverage['/path.js'].lineData[34]++;
      if (visit4_34_1(last !== '.')) {
        _$jscoverage['/path.js'].lineData[35]++;
        if (visit5_35_1(last === '..')) {
          _$jscoverage['/path.js'].lineData[36]++;
          up++;
        } else {
          _$jscoverage['/path.js'].lineData[37]++;
          if (visit6_37_1(up)) {
            _$jscoverage['/path.js'].lineData[38]++;
            up--;
          } else {
            _$jscoverage['/path.js'].lineData[40]++;
            newParts[newParts.length] = last;
          }
        }
      }
    }
    _$jscoverage['/path.js'].lineData[46]++;
    if (visit7_46_1(allowAboveRoot)) {
      _$jscoverage['/path.js'].lineData[47]++;
      for (; up--; up) {
        _$jscoverage['/path.js'].lineData[48]++;
        newParts[newParts.length] = '..';
      }
    }
    _$jscoverage['/path.js'].lineData[52]++;
    newParts = newParts.reverse();
    _$jscoverage['/path.js'].lineData[54]++;
    return newParts;
  }
  _$jscoverage['/path.js'].lineData[62]++;
  var Path = {
  resolve: function() {
  _$jscoverage['/path.js'].functionData[4]++;
  _$jscoverage['/path.js'].lineData[68]++;
  var resolvedPath = '', resolvedPathStr, i, args = (arguments), path, absolute = 0;
  _$jscoverage['/path.js'].lineData[75]++;
  for (i = args.length - 1; visit8_75_1(visit9_75_2(i >= 0) && !absolute); i--) {
    _$jscoverage['/path.js'].lineData[76]++;
    path = args[i];
    _$jscoverage['/path.js'].lineData[77]++;
    if (visit10_77_1(visit11_77_2(typeof path !== 'string') || !path)) {
      _$jscoverage['/path.js'].lineData[78]++;
      continue;
    }
    _$jscoverage['/path.js'].lineData[80]++;
    resolvedPath = path + '/' + resolvedPath;
    _$jscoverage['/path.js'].lineData[81]++;
    absolute = visit12_81_1(path.charAt(0) === '/');
  }
  _$jscoverage['/path.js'].lineData[84]++;
  resolvedPathStr = normalizeArray(filter(resolvedPath.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[5]++;
  _$jscoverage['/path.js'].lineData[85]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[88]++;
  return visit13_88_1(((absolute ? '/' : '') + resolvedPathStr) || '.');
}, 
  normalize: function(path) {
  _$jscoverage['/path.js'].functionData[6]++;
  _$jscoverage['/path.js'].lineData[102]++;
  var absolute = visit14_102_1(path.charAt(0) === '/'), trailingSlash = visit15_103_1(path.slice(0 - 1) === '/');
  _$jscoverage['/path.js'].lineData[105]++;
  path = normalizeArray(filter(path.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[7]++;
  _$jscoverage['/path.js'].lineData[106]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[109]++;
  if (visit16_109_1(!path && !absolute)) {
    _$jscoverage['/path.js'].lineData[110]++;
    path = '.';
  }
  _$jscoverage['/path.js'].lineData[113]++;
  if (visit17_113_1(path && trailingSlash)) {
    _$jscoverage['/path.js'].lineData[114]++;
    path += '/';
  }
  _$jscoverage['/path.js'].lineData[117]++;
  return (absolute ? '/' : '') + path;
}, 
  join: function() {
  _$jscoverage['/path.js'].functionData[8]++;
  _$jscoverage['/path.js'].lineData[125]++;
  var args = Array.prototype.slice.call(arguments);
  _$jscoverage['/path.js'].lineData[126]++;
  return Path.normalize(filter(args, function(p) {
  _$jscoverage['/path.js'].functionData[9]++;
  _$jscoverage['/path.js'].lineData[127]++;
  return visit18_127_1(p && (visit19_127_2(typeof p === 'string')));
}).join('/'));
}, 
  relative: function(from, to) {
  _$jscoverage['/path.js'].functionData[10]++;
  _$jscoverage['/path.js'].lineData[143]++;
  from = Path.normalize(from);
  _$jscoverage['/path.js'].lineData[144]++;
  to = Path.normalize(to);
  _$jscoverage['/path.js'].lineData[146]++;
  var fromParts = filter(from.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[11]++;
  _$jscoverage['/path.js'].lineData[147]++;
  return !!p;
}), path = [], sameIndex, sameIndex2, toParts = filter(to.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[12]++;
  _$jscoverage['/path.js'].lineData[153]++;
  return !!p;
}), commonLength = Math.min(fromParts.length, toParts.length);
  _$jscoverage['/path.js'].lineData[156]++;
  for (sameIndex = 0; visit20_156_1(sameIndex < commonLength); sameIndex++) {
    _$jscoverage['/path.js'].lineData[157]++;
    if (visit21_157_1(fromParts[sameIndex] !== toParts[sameIndex])) {
      _$jscoverage['/path.js'].lineData[158]++;
      break;
    }
  }
  _$jscoverage['/path.js'].lineData[162]++;
  sameIndex2 = sameIndex;
  _$jscoverage['/path.js'].lineData[164]++;
  while (visit22_164_1(sameIndex < fromParts.length)) {
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
  _$jscoverage['/path.js'].functionData[13]++;
  _$jscoverage['/path.js'].lineData[183]++;
  var result = visit23_183_1(path.match(splitPathRe) || []), basename;
  _$jscoverage['/path.js'].lineData[185]++;
  basename = visit24_185_1(result[3] || '');
  _$jscoverage['/path.js'].lineData[186]++;
  if (visit25_186_1(ext && visit26_186_2(basename && visit27_186_3(basename.slice(ext.length * -1) === ext)))) {
    _$jscoverage['/path.js'].lineData[187]++;
    basename = basename.slice(0, -1 * ext.length);
  }
  _$jscoverage['/path.js'].lineData[189]++;
  return basename;
}, 
  dirname: function(path) {
  _$jscoverage['/path.js'].functionData[14]++;
  _$jscoverage['/path.js'].lineData[198]++;
  var result = visit28_198_1(path.match(splitPathRe) || []), root = visit29_199_1(result[1] || ''), dir = visit30_200_1(result[2] || '');
  _$jscoverage['/path.js'].lineData[202]++;
  if (visit31_202_1(!root && !dir)) {
    _$jscoverage['/path.js'].lineData[204]++;
    return '.';
  }
  _$jscoverage['/path.js'].lineData[207]++;
  if (visit32_207_1(dir)) {
    _$jscoverage['/path.js'].lineData[209]++;
    dir = dir.substring(0, dir.length - 1);
  }
  _$jscoverage['/path.js'].lineData[212]++;
  return root + dir;
}, 
  extname: function(path) {
  _$jscoverage['/path.js'].functionData[15]++;
  _$jscoverage['/path.js'].lineData[221]++;
  return visit33_221_1((visit34_221_2(path.match(splitPathRe) || []))[4] || '');
}};
  _$jscoverage['/path.js'].lineData[225]++;
  return Path;
});
