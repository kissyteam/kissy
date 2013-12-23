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
  _$jscoverage['/path.js'].lineData[12] = 0;
  _$jscoverage['/path.js'].lineData[14] = 0;
  _$jscoverage['/path.js'].lineData[21] = 0;
  _$jscoverage['/path.js'].lineData[22] = 0;
  _$jscoverage['/path.js'].lineData[23] = 0;
  _$jscoverage['/path.js'].lineData[24] = 0;
  _$jscoverage['/path.js'].lineData[25] = 0;
  _$jscoverage['/path.js'].lineData[26] = 0;
  _$jscoverage['/path.js'].lineData[27] = 0;
  _$jscoverage['/path.js'].lineData[29] = 0;
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
  _$jscoverage['/path.js'].lineData[106] = 0;
  _$jscoverage['/path.js'].lineData[114] = 0;
  _$jscoverage['/path.js'].lineData[115] = 0;
  _$jscoverage['/path.js'].lineData[116] = 0;
  _$jscoverage['/path.js'].lineData[132] = 0;
  _$jscoverage['/path.js'].lineData[133] = 0;
  _$jscoverage['/path.js'].lineData[135] = 0;
  _$jscoverage['/path.js'].lineData[136] = 0;
  _$jscoverage['/path.js'].lineData[142] = 0;
  _$jscoverage['/path.js'].lineData[145] = 0;
  _$jscoverage['/path.js'].lineData[146] = 0;
  _$jscoverage['/path.js'].lineData[147] = 0;
  _$jscoverage['/path.js'].lineData[151] = 0;
  _$jscoverage['/path.js'].lineData[153] = 0;
  _$jscoverage['/path.js'].lineData[154] = 0;
  _$jscoverage['/path.js'].lineData[155] = 0;
  _$jscoverage['/path.js'].lineData[158] = 0;
  _$jscoverage['/path.js'].lineData[160] = 0;
  _$jscoverage['/path.js'].lineData[162] = 0;
  _$jscoverage['/path.js'].lineData[172] = 0;
  _$jscoverage['/path.js'].lineData[174] = 0;
  _$jscoverage['/path.js'].lineData[175] = 0;
  _$jscoverage['/path.js'].lineData[176] = 0;
  _$jscoverage['/path.js'].lineData[178] = 0;
  _$jscoverage['/path.js'].lineData[187] = 0;
  _$jscoverage['/path.js'].lineData[191] = 0;
  _$jscoverage['/path.js'].lineData[193] = 0;
  _$jscoverage['/path.js'].lineData[196] = 0;
  _$jscoverage['/path.js'].lineData[198] = 0;
  _$jscoverage['/path.js'].lineData[201] = 0;
  _$jscoverage['/path.js'].lineData[210] = 0;
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
  _$jscoverage['/path.js'].branchData['21'] = [];
  _$jscoverage['/path.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['23'] = [];
  _$jscoverage['/path.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['24'] = [];
  _$jscoverage['/path.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['26'] = [];
  _$jscoverage['/path.js'].branchData['26'][1] = new BranchData();
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
  _$jscoverage['/path.js'].branchData['116'] = [];
  _$jscoverage['/path.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['145'] = [];
  _$jscoverage['/path.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['146'] = [];
  _$jscoverage['/path.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['153'] = [];
  _$jscoverage['/path.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['172'] = [];
  _$jscoverage['/path.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['174'] = [];
  _$jscoverage['/path.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['175'] = [];
  _$jscoverage['/path.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/path.js'].branchData['175'][3] = new BranchData();
  _$jscoverage['/path.js'].branchData['187'] = [];
  _$jscoverage['/path.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['188'] = [];
  _$jscoverage['/path.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['189'] = [];
  _$jscoverage['/path.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['191'] = [];
  _$jscoverage['/path.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['196'] = [];
  _$jscoverage['/path.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['210'] = [];
  _$jscoverage['/path.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/path.js'].branchData['210'][2] = new BranchData();
}
_$jscoverage['/path.js'].branchData['210'][2].init(21, 29, 'path.match(splitPathRe) || []');
function visit558_210_2(result) {
  _$jscoverage['/path.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['210'][1].init(21, 39, '(path.match(splitPathRe) || [])[4] || \'\'');
function visit557_210_1(result) {
  _$jscoverage['/path.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['196'][1].init(259, 3, 'dir');
function visit556_196_1(result) {
  _$jscoverage['/path.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['191'][1].init(153, 13, '!root && !dir');
function visit555_191_1(result) {
  _$jscoverage['/path.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['189'][1].init(105, 15, 'result[2] || \'\'');
function visit554_189_1(result) {
  _$jscoverage['/path.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['188'][1].init(66, 15, 'result[1] || \'\'');
function visit553_188_1(result) {
  _$jscoverage['/path.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['187'][1].init(26, 29, 'path.match(splitPathRe) || []');
function visit552_187_1(result) {
  _$jscoverage['/path.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['175'][3].init(158, 39, 'basename.slice(ext.length * -1) === ext');
function visit551_175_3(result) {
  _$jscoverage['/path.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['175'][2].init(146, 51, 'basename && basename.slice(ext.length * -1) === ext');
function visit550_175_2(result) {
  _$jscoverage['/path.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['175'][1].init(139, 58, 'ext && basename && basename.slice(ext.length * -1) === ext');
function visit549_175_1(result) {
  _$jscoverage['/path.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['174'][1].init(106, 15, 'result[3] || \'\'');
function visit548_174_1(result) {
  _$jscoverage['/path.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['172'][1].init(26, 29, 'path.match(splitPathRe) || []');
function visit547_172_1(result) {
  _$jscoverage['/path.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['153'][1].init(716, 28, 'sameIndex < fromParts.length');
function visit546_153_1(result) {
  _$jscoverage['/path.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['146'][1].init(21, 43, 'fromParts[sameIndex] !== toParts[sameIndex]');
function visit545_146_1(result) {
  _$jscoverage['/path.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['145'][1].init(492, 24, 'sameIndex < commonLength');
function visit544_145_1(result) {
  _$jscoverage['/path.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['116'][2].init(30, 21, 'typeof p === \'string\'');
function visit543_116_2(result) {
  _$jscoverage['/path.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['116'][1].init(24, 28, 'p && (typeof p === \'string\')');
function visit542_116_1(result) {
  _$jscoverage['/path.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['102'][1].init(351, 21, 'path && trailingSlash');
function visit541_102_1(result) {
  _$jscoverage['/path.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['98'][1].init(270, 18, '!path && !absolute');
function visit540_98_1(result) {
  _$jscoverage['/path.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['92'][1].init(70, 25, 'path.slice(0 - 1) === \'/\'');
function visit539_92_1(result) {
  _$jscoverage['/path.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['91'][1].init(28, 22, 'path.charAt(0) === \'/\'');
function visit538_91_1(result) {
  _$jscoverage['/path.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['77'][1].init(686, 46, '((absolute ? \'/\' : \'\') + resolvedPathStr) || \'.\'');
function visit537_77_1(result) {
  _$jscoverage['/path.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['70'][1].init(223, 22, 'path.charAt(0) === \'/\'');
function visit536_70_1(result) {
  _$jscoverage['/path.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['66'][2].init(53, 24, 'typeof path !== \'string\'');
function visit535_66_2(result) {
  _$jscoverage['/path.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['66'][1].init(53, 33, 'typeof path !== \'string\' || !path');
function visit534_66_1(result) {
  _$jscoverage['/path.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['64'][2].init(215, 6, 'i >= 0');
function visit533_64_2(result) {
  _$jscoverage['/path.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['64'][1].init(215, 19, 'i >= 0 && !absolute');
function visit532_64_1(result) {
  _$jscoverage['/path.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['35'][1].init(591, 14, 'allowAboveRoot');
function visit531_35_1(result) {
  _$jscoverage['/path.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['26'][1].init(92, 2, 'up');
function visit530_26_1(result) {
  _$jscoverage['/path.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['24'][1].init(21, 13, 'last === \'..\'');
function visit529_24_1(result) {
  _$jscoverage['/path.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['23'][1].init(46, 12, 'last !== \'.\'');
function visit528_23_1(result) {
  _$jscoverage['/path.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].branchData['21'][1].init(213, 6, 'i >= 0');
function visit527_21_1(result) {
  _$jscoverage['/path.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/path.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/path.js'].functionData[0]++;
  _$jscoverage['/path.js'].lineData[9]++;
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  _$jscoverage['/path.js'].lineData[12]++;
  function normalizeArray(parts, allowAboveRoot) {
    _$jscoverage['/path.js'].functionData[1]++;
    _$jscoverage['/path.js'].lineData[14]++;
    var up = 0, i = parts.length - 1, newParts = [], last;
    _$jscoverage['/path.js'].lineData[21]++;
    for (; visit527_21_1(i >= 0); i--) {
      _$jscoverage['/path.js'].lineData[22]++;
      last = parts[i];
      _$jscoverage['/path.js'].lineData[23]++;
      if (visit528_23_1(last !== '.')) {
        _$jscoverage['/path.js'].lineData[24]++;
        if (visit529_24_1(last === '..')) {
          _$jscoverage['/path.js'].lineData[25]++;
          up++;
        } else {
          _$jscoverage['/path.js'].lineData[26]++;
          if (visit530_26_1(up)) {
            _$jscoverage['/path.js'].lineData[27]++;
            up--;
          } else {
            _$jscoverage['/path.js'].lineData[29]++;
            newParts[newParts.length] = last;
          }
        }
      }
    }
    _$jscoverage['/path.js'].lineData[35]++;
    if (visit531_35_1(allowAboveRoot)) {
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
  for (i = args.length - 1; visit532_64_1(visit533_64_2(i >= 0) && !absolute); i--) {
    _$jscoverage['/path.js'].lineData[65]++;
    path = args[i];
    _$jscoverage['/path.js'].lineData[66]++;
    if (visit534_66_1(visit535_66_2(typeof path !== 'string') || !path)) {
      _$jscoverage['/path.js'].lineData[67]++;
      continue;
    }
    _$jscoverage['/path.js'].lineData[69]++;
    resolvedPath = path + '/' + resolvedPath;
    _$jscoverage['/path.js'].lineData[70]++;
    absolute = visit536_70_1(path.charAt(0) === '/');
  }
  _$jscoverage['/path.js'].lineData[73]++;
  resolvedPathStr = normalizeArray(S.filter(resolvedPath.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[3]++;
  _$jscoverage['/path.js'].lineData[74]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[77]++;
  return visit537_77_1(((absolute ? '/' : '') + resolvedPathStr) || '.');
}, 
  normalize: function(path) {
  _$jscoverage['/path.js'].functionData[4]++;
  _$jscoverage['/path.js'].lineData[91]++;
  var absolute = visit538_91_1(path.charAt(0) === '/'), trailingSlash = visit539_92_1(path.slice(0 - 1) === '/');
  _$jscoverage['/path.js'].lineData[94]++;
  path = normalizeArray(S.filter(path.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[5]++;
  _$jscoverage['/path.js'].lineData[95]++;
  return !!p;
}), !absolute).join('/');
  _$jscoverage['/path.js'].lineData[98]++;
  if (visit540_98_1(!path && !absolute)) {
    _$jscoverage['/path.js'].lineData[99]++;
    path = '.';
  }
  _$jscoverage['/path.js'].lineData[102]++;
  if (visit541_102_1(path && trailingSlash)) {
    _$jscoverage['/path.js'].lineData[103]++;
    path += '/';
  }
  _$jscoverage['/path.js'].lineData[106]++;
  return (absolute ? '/' : '') + path;
}, 
  join: function() {
  _$jscoverage['/path.js'].functionData[6]++;
  _$jscoverage['/path.js'].lineData[114]++;
  var args = S.makeArray(arguments);
  _$jscoverage['/path.js'].lineData[115]++;
  return Path.normalize(S.filter(args, function(p) {
  _$jscoverage['/path.js'].functionData[7]++;
  _$jscoverage['/path.js'].lineData[116]++;
  return visit542_116_1(p && (visit543_116_2(typeof p === 'string')));
}).join('/'));
}, 
  relative: function(from, to) {
  _$jscoverage['/path.js'].functionData[8]++;
  _$jscoverage['/path.js'].lineData[132]++;
  from = Path.normalize(from);
  _$jscoverage['/path.js'].lineData[133]++;
  to = Path.normalize(to);
  _$jscoverage['/path.js'].lineData[135]++;
  var fromParts = S.filter(from.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[9]++;
  _$jscoverage['/path.js'].lineData[136]++;
  return !!p;
}), path = [], sameIndex, sameIndex2, toParts = S.filter(to.split('/'), function(p) {
  _$jscoverage['/path.js'].functionData[10]++;
  _$jscoverage['/path.js'].lineData[142]++;
  return !!p;
}), commonLength = Math.min(fromParts.length, toParts.length);
  _$jscoverage['/path.js'].lineData[145]++;
  for (sameIndex = 0; visit544_145_1(sameIndex < commonLength); sameIndex++) {
    _$jscoverage['/path.js'].lineData[146]++;
    if (visit545_146_1(fromParts[sameIndex] !== toParts[sameIndex])) {
      _$jscoverage['/path.js'].lineData[147]++;
      break;
    }
  }
  _$jscoverage['/path.js'].lineData[151]++;
  sameIndex2 = sameIndex;
  _$jscoverage['/path.js'].lineData[153]++;
  while (visit546_153_1(sameIndex < fromParts.length)) {
    _$jscoverage['/path.js'].lineData[154]++;
    path.push('..');
    _$jscoverage['/path.js'].lineData[155]++;
    sameIndex++;
  }
  _$jscoverage['/path.js'].lineData[158]++;
  path = path.concat(toParts.slice(sameIndex2));
  _$jscoverage['/path.js'].lineData[160]++;
  path = path.join('/');
  _$jscoverage['/path.js'].lineData[162]++;
  return path;
}, 
  basename: function(path, ext) {
  _$jscoverage['/path.js'].functionData[11]++;
  _$jscoverage['/path.js'].lineData[172]++;
  var result = visit547_172_1(path.match(splitPathRe) || []), basename;
  _$jscoverage['/path.js'].lineData[174]++;
  basename = visit548_174_1(result[3] || '');
  _$jscoverage['/path.js'].lineData[175]++;
  if (visit549_175_1(ext && visit550_175_2(basename && visit551_175_3(basename.slice(ext.length * -1) === ext)))) {
    _$jscoverage['/path.js'].lineData[176]++;
    basename = basename.slice(0, -1 * ext.length);
  }
  _$jscoverage['/path.js'].lineData[178]++;
  return basename;
}, 
  dirname: function(path) {
  _$jscoverage['/path.js'].functionData[12]++;
  _$jscoverage['/path.js'].lineData[187]++;
  var result = visit552_187_1(path.match(splitPathRe) || []), root = visit553_188_1(result[1] || ''), dir = visit554_189_1(result[2] || '');
  _$jscoverage['/path.js'].lineData[191]++;
  if (visit555_191_1(!root && !dir)) {
    _$jscoverage['/path.js'].lineData[193]++;
    return '.';
  }
  _$jscoverage['/path.js'].lineData[196]++;
  if (visit556_196_1(dir)) {
    _$jscoverage['/path.js'].lineData[198]++;
    dir = dir.substring(0, dir.length - 1);
  }
  _$jscoverage['/path.js'].lineData[201]++;
  return root + dir;
}, 
  extname: function(path) {
  _$jscoverage['/path.js'].functionData[13]++;
  _$jscoverage['/path.js'].lineData[210]++;
  return visit557_210_1((visit558_210_2(path.match(splitPathRe) || []))[4] || '');
}};
})(KISSY);
