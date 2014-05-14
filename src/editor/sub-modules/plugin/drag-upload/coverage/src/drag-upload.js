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
if (! _$jscoverage['/drag-upload.js']) {
  _$jscoverage['/drag-upload.js'] = {};
  _$jscoverage['/drag-upload.js'].lineData = [];
  _$jscoverage['/drag-upload.js'].lineData[6] = 0;
  _$jscoverage['/drag-upload.js'].lineData[7] = 0;
  _$jscoverage['/drag-upload.js'].lineData[8] = 0;
  _$jscoverage['/drag-upload.js'].lineData[9] = 0;
  _$jscoverage['/drag-upload.js'].lineData[10] = 0;
  _$jscoverage['/drag-upload.js'].lineData[14] = 0;
  _$jscoverage['/drag-upload.js'].lineData[15] = 0;
  _$jscoverage['/drag-upload.js'].lineData[18] = 0;
  _$jscoverage['/drag-upload.js'].lineData[20] = 0;
  _$jscoverage['/drag-upload.js'].lineData[30] = 0;
  _$jscoverage['/drag-upload.js'].lineData[31] = 0;
  _$jscoverage['/drag-upload.js'].lineData[33] = 0;
  _$jscoverage['/drag-upload.js'].lineData[34] = 0;
  _$jscoverage['/drag-upload.js'].lineData[38] = 0;
  _$jscoverage['/drag-upload.js'].lineData[39] = 0;
  _$jscoverage['/drag-upload.js'].lineData[40] = 0;
  _$jscoverage['/drag-upload.js'].lineData[42] = 0;
  _$jscoverage['/drag-upload.js'].lineData[43] = 0;
  _$jscoverage['/drag-upload.js'].lineData[44] = 0;
  _$jscoverage['/drag-upload.js'].lineData[48] = 0;
  _$jscoverage['/drag-upload.js'].lineData[49] = 0;
  _$jscoverage['/drag-upload.js'].lineData[50] = 0;
  _$jscoverage['/drag-upload.js'].lineData[51] = 0;
  _$jscoverage['/drag-upload.js'].lineData[52] = 0;
  _$jscoverage['/drag-upload.js'].lineData[53] = 0;
  _$jscoverage['/drag-upload.js'].lineData[55] = 0;
  _$jscoverage['/drag-upload.js'].lineData[56] = 0;
  _$jscoverage['/drag-upload.js'].lineData[57] = 0;
  _$jscoverage['/drag-upload.js'].lineData[58] = 0;
  _$jscoverage['/drag-upload.js'].lineData[59] = 0;
  _$jscoverage['/drag-upload.js'].lineData[60] = 0;
  _$jscoverage['/drag-upload.js'].lineData[63] = 0;
  _$jscoverage['/drag-upload.js'].lineData[66] = 0;
  _$jscoverage['/drag-upload.js'].lineData[67] = 0;
  _$jscoverage['/drag-upload.js'].lineData[70] = 0;
  _$jscoverage['/drag-upload.js'].lineData[71] = 0;
  _$jscoverage['/drag-upload.js'].lineData[72] = 0;
  _$jscoverage['/drag-upload.js'].lineData[73] = 0;
  _$jscoverage['/drag-upload.js'].lineData[74] = 0;
  _$jscoverage['/drag-upload.js'].lineData[76] = 0;
  _$jscoverage['/drag-upload.js'].lineData[77] = 0;
  _$jscoverage['/drag-upload.js'].lineData[78] = 0;
  _$jscoverage['/drag-upload.js'].lineData[79] = 0;
  _$jscoverage['/drag-upload.js'].lineData[81] = 0;
  _$jscoverage['/drag-upload.js'].lineData[82] = 0;
  _$jscoverage['/drag-upload.js'].lineData[84] = 0;
  _$jscoverage['/drag-upload.js'].lineData[86] = 0;
  _$jscoverage['/drag-upload.js'].lineData[87] = 0;
  _$jscoverage['/drag-upload.js'].lineData[88] = 0;
  _$jscoverage['/drag-upload.js'].lineData[90] = 0;
  _$jscoverage['/drag-upload.js'].lineData[91] = 0;
  _$jscoverage['/drag-upload.js'].lineData[94] = 0;
  _$jscoverage['/drag-upload.js'].lineData[100] = 0;
  _$jscoverage['/drag-upload.js'].lineData[101] = 0;
  _$jscoverage['/drag-upload.js'].lineData[103] = 0;
  _$jscoverage['/drag-upload.js'].lineData[104] = 0;
  _$jscoverage['/drag-upload.js'].lineData[105] = 0;
  _$jscoverage['/drag-upload.js'].lineData[107] = 0;
  _$jscoverage['/drag-upload.js'].lineData[109] = 0;
  _$jscoverage['/drag-upload.js'].lineData[110] = 0;
  _$jscoverage['/drag-upload.js'].lineData[111] = 0;
  _$jscoverage['/drag-upload.js'].lineData[112] = 0;
  _$jscoverage['/drag-upload.js'].lineData[114] = 0;
  _$jscoverage['/drag-upload.js'].lineData[115] = 0;
  _$jscoverage['/drag-upload.js'].lineData[119] = 0;
  _$jscoverage['/drag-upload.js'].lineData[120] = 0;
  _$jscoverage['/drag-upload.js'].lineData[122] = 0;
  _$jscoverage['/drag-upload.js'].lineData[123] = 0;
  _$jscoverage['/drag-upload.js'].lineData[128] = 0;
  _$jscoverage['/drag-upload.js'].lineData[129] = 0;
  _$jscoverage['/drag-upload.js'].lineData[130] = 0;
  _$jscoverage['/drag-upload.js'].lineData[131] = 0;
  _$jscoverage['/drag-upload.js'].lineData[132] = 0;
  _$jscoverage['/drag-upload.js'].lineData[133] = 0;
  _$jscoverage['/drag-upload.js'].lineData[134] = 0;
  _$jscoverage['/drag-upload.js'].lineData[137] = 0;
  _$jscoverage['/drag-upload.js'].lineData[138] = 0;
  _$jscoverage['/drag-upload.js'].lineData[140] = 0;
  _$jscoverage['/drag-upload.js'].lineData[144] = 0;
  _$jscoverage['/drag-upload.js'].lineData[145] = 0;
  _$jscoverage['/drag-upload.js'].lineData[147] = 0;
  _$jscoverage['/drag-upload.js'].lineData[148] = 0;
  _$jscoverage['/drag-upload.js'].lineData[149] = 0;
  _$jscoverage['/drag-upload.js'].lineData[150] = 0;
  _$jscoverage['/drag-upload.js'].lineData[152] = 0;
  _$jscoverage['/drag-upload.js'].lineData[153] = 0;
  _$jscoverage['/drag-upload.js'].lineData[155] = 0;
  _$jscoverage['/drag-upload.js'].lineData[158] = 0;
  _$jscoverage['/drag-upload.js'].lineData[160] = 0;
  _$jscoverage['/drag-upload.js'].lineData[164] = 0;
  _$jscoverage['/drag-upload.js'].lineData[166] = 0;
  _$jscoverage['/drag-upload.js'].lineData[168] = 0;
  _$jscoverage['/drag-upload.js'].lineData[173] = 0;
}
if (! _$jscoverage['/drag-upload.js'].functionData) {
  _$jscoverage['/drag-upload.js'].functionData = [];
  _$jscoverage['/drag-upload.js'].functionData[0] = 0;
  _$jscoverage['/drag-upload.js'].functionData[1] = 0;
  _$jscoverage['/drag-upload.js'].functionData[2] = 0;
  _$jscoverage['/drag-upload.js'].functionData[3] = 0;
  _$jscoverage['/drag-upload.js'].functionData[4] = 0;
  _$jscoverage['/drag-upload.js'].functionData[5] = 0;
  _$jscoverage['/drag-upload.js'].functionData[6] = 0;
  _$jscoverage['/drag-upload.js'].functionData[7] = 0;
  _$jscoverage['/drag-upload.js'].functionData[8] = 0;
  _$jscoverage['/drag-upload.js'].functionData[9] = 0;
  _$jscoverage['/drag-upload.js'].functionData[10] = 0;
  _$jscoverage['/drag-upload.js'].functionData[11] = 0;
}
if (! _$jscoverage['/drag-upload.js'].branchData) {
  _$jscoverage['/drag-upload.js'].branchData = {};
  _$jscoverage['/drag-upload.js'].branchData['15'] = [];
  _$jscoverage['/drag-upload.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['21'] = [];
  _$jscoverage['/drag-upload.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['22'] = [];
  _$jscoverage['/drag-upload.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['23'] = [];
  _$jscoverage['/drag-upload.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['24'] = [];
  _$jscoverage['/drag-upload.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['25'] = [];
  _$jscoverage['/drag-upload.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['33'] = [];
  _$jscoverage['/drag-upload.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['42'] = [];
  _$jscoverage['/drag-upload.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['55'] = [];
  _$jscoverage['/drag-upload.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['57'] = [];
  _$jscoverage['/drag-upload.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['73'] = [];
  _$jscoverage['/drag-upload.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['76'] = [];
  _$jscoverage['/drag-upload.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['78'] = [];
  _$jscoverage['/drag-upload.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['81'] = [];
  _$jscoverage['/drag-upload.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['90'] = [];
  _$jscoverage['/drag-upload.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['90'][3] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['100'] = [];
  _$jscoverage['/drag-upload.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['104'] = [];
  _$jscoverage['/drag-upload.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['111'] = [];
  _$jscoverage['/drag-upload.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['130'] = [];
  _$jscoverage['/drag-upload.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['131'] = [];
  _$jscoverage['/drag-upload.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['131'][3] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['132'] = [];
  _$jscoverage['/drag-upload.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['147'] = [];
  _$jscoverage['/drag-upload.js'].branchData['147'][1] = new BranchData();
}
_$jscoverage['/drag-upload.js'].branchData['147'][1].init(1281, 39, 'file.type || \'application/octet-stream\'');
function visit27_147_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['132'][1].init(38, 23, 'xhr.responseText !== \'\'');
function visit26_132_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['131'][3].init(56, 18, 'xhr.status === 304');
function visit25_131_3(result) {
  _$jscoverage['/drag-upload.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['131'][2].init(34, 18, 'xhr.status === 200');
function visit24_131_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['131'][1].init(34, 40, 'xhr.status === 200 || xhr.status === 304');
function visit23_131_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['130'][1].init(30, 20, 'xhr.readyState === 4');
function visit22_130_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['111'][1].init(442, 7, 'i < len');
function visit21_111_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['104'][1].init(109, 18, 'window.BlobBuilder');
function visit20_104_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['100'][1].init(3464, 63, 'window.XMLHttpRequest && !XMLHttpRequest.prototype.sendAsBinary');
function visit19_100_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['90'][3].init(752, 17, 'npName === \'html\'');
function visit18_90_3(result) {
  _$jscoverage['/drag-upload.js'].branchData['90'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['90'][2].init(731, 17, 'npName === \'head\'');
function visit17_90_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['90'][1].init(731, 38, 'npName === \'head\' || npName === \'html\'');
function visit16_90_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['81'][1].init(233, 23, 'size / 1000 > sizeLimit');
function visit15_81_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['78'][1].init(112, 22, '!name.match(suffixReg)');
function visit14_78_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['76'][1].init(1214, 16, 'i < files.length');
function visit13_76_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['73'][1].init(1111, 6, '!files');
function visit12_73_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['57'][1].init(34, 26, 'Dom.nodeName(el) === \'img\'');
function visit11_57_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['55'][1].init(298, 29, '!util.isEmptyObject(inserted)');
function visit10_55_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['42'][1].init(64, 13, '!startMonitor');
function visit9_42_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['33'][2].init(102, 25, 'Dom.nodeName(t) === \'img\'');
function visit8_33_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['33'][1].init(102, 54, 'Dom.nodeName(t) === \'img\' && t.src.match(/^file:\\/\\//)');
function visit7_33_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['25'][1].init(276, 32, 'cfg.suffix || \'png,jpg,jpeg,gif\'');
function visit6_25_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['24'][1].init(229, 19, 'cfg.serverUrl || \'\'');
function visit5_24_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['23'][1].init(176, 22, 'cfg.serverParams || {}');
function visit4_23_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['22'][1].init(109, 33, 'cfg.sizeLimit || Number.MAX_VALUE');
function visit3_22_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['21'][1].init(51, 27, 'cfg.fileInput || \'Filedata\'');
function visit2_21_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['15'][1].init(24, 12, 'config || {}');
function visit1_15_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/drag-upload.js'].functionData[0]++;
  _$jscoverage['/drag-upload.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/drag-upload.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/drag-upload.js'].lineData[9]++;
  var Event = require('event/dom');
  _$jscoverage['/drag-upload.js'].lineData[10]++;
  var Node = require('node'), Utils = Editor.Utils, Dom = require('dom');
  _$jscoverage['/drag-upload.js'].lineData[14]++;
  function dragUpload(config) {
    _$jscoverage['/drag-upload.js'].functionData[1]++;
    _$jscoverage['/drag-upload.js'].lineData[15]++;
    this.config = visit1_15_1(config || {});
  }
  _$jscoverage['/drag-upload.js'].lineData[18]++;
  util.augment(dragUpload, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/drag-upload.js'].functionData[2]++;
  _$jscoverage['/drag-upload.js'].lineData[20]++;
  var cfg = this.config, fileInput = visit2_21_1(cfg.fileInput || 'Filedata'), sizeLimit = visit3_22_1(cfg.sizeLimit || Number.MAX_VALUE), serverParams = visit4_23_1(cfg.serverParams || {}), serverUrl = visit5_24_1(cfg.serverUrl || ''), suffix = visit6_25_1(cfg.suffix || 'png,jpg,jpeg,gif'), suffixReg = new RegExp(suffix.split(/,/).join('|') + '$', 'i'), inserted = {}, startMonitor = false;
  _$jscoverage['/drag-upload.js'].lineData[30]++;
  function nodeInsert(ev) {
    _$jscoverage['/drag-upload.js'].functionData[3]++;
    _$jscoverage['/drag-upload.js'].lineData[31]++;
    var oe = ev.originalEvent, t = oe.target;
    _$jscoverage['/drag-upload.js'].lineData[33]++;
    if (visit7_33_1(visit8_33_2(Dom.nodeName(t) === 'img') && t.src.match(/^file:\/\//))) {
      _$jscoverage['/drag-upload.js'].lineData[34]++;
      inserted[t.src] = t;
    }
  }
  _$jscoverage['/drag-upload.js'].lineData[38]++;
  editor.docReady(function() {
  _$jscoverage['/drag-upload.js'].functionData[4]++;
  _$jscoverage['/drag-upload.js'].lineData[39]++;
  var document = editor.get('document')[0];
  _$jscoverage['/drag-upload.js'].lineData[40]++;
  Event.on(document, 'dragenter', function() {
  _$jscoverage['/drag-upload.js'].functionData[5]++;
  _$jscoverage['/drag-upload.js'].lineData[42]++;
  if (visit9_42_1(!startMonitor)) {
    _$jscoverage['/drag-upload.js'].lineData[43]++;
    Event.on(document, 'DOMNodeInserted', nodeInsert);
    _$jscoverage['/drag-upload.js'].lineData[44]++;
    startMonitor = true;
  }
});
  _$jscoverage['/drag-upload.js'].lineData[48]++;
  Event.on(document, 'drop', function(ev) {
  _$jscoverage['/drag-upload.js'].functionData[6]++;
  _$jscoverage['/drag-upload.js'].lineData[49]++;
  Event.remove(document, 'DOMNodeInserted', nodeInsert);
  _$jscoverage['/drag-upload.js'].lineData[50]++;
  startMonitor = false;
  _$jscoverage['/drag-upload.js'].lineData[51]++;
  ev.halt();
  _$jscoverage['/drag-upload.js'].lineData[52]++;
  ev = ev.originalEvent;
  _$jscoverage['/drag-upload.js'].lineData[53]++;
  var archor, ap;
  _$jscoverage['/drag-upload.js'].lineData[55]++;
  if (visit10_55_1(!util.isEmptyObject(inserted))) {
    _$jscoverage['/drag-upload.js'].lineData[56]++;
    util.each(inserted, function(el) {
  _$jscoverage['/drag-upload.js'].functionData[7]++;
  _$jscoverage['/drag-upload.js'].lineData[57]++;
  if (visit11_57_1(Dom.nodeName(el) === 'img')) {
    _$jscoverage['/drag-upload.js'].lineData[58]++;
    archor = el.nextSibling;
    _$jscoverage['/drag-upload.js'].lineData[59]++;
    ap = el.parentNode;
    _$jscoverage['/drag-upload.js'].lineData[60]++;
    Dom.remove(el);
  }
});
    _$jscoverage['/drag-upload.js'].lineData[63]++;
    inserted = {};
  } else {
    _$jscoverage['/drag-upload.js'].lineData[66]++;
    ap = document.elementFromPoint(ev.clientX, ev.clientY);
    _$jscoverage['/drag-upload.js'].lineData[67]++;
    archor = ap.lastChild;
  }
  _$jscoverage['/drag-upload.js'].lineData[70]++;
  var dt = ev.dataTransfer;
  _$jscoverage['/drag-upload.js'].lineData[71]++;
  dt.dropEffect = 'copy';
  _$jscoverage['/drag-upload.js'].lineData[72]++;
  var files = dt.files;
  _$jscoverage['/drag-upload.js'].lineData[73]++;
  if (visit12_73_1(!files)) {
    _$jscoverage['/drag-upload.js'].lineData[74]++;
    return;
  }
  _$jscoverage['/drag-upload.js'].lineData[76]++;
  for (var i = 0; visit13_76_1(i < files.length); i++) {
    _$jscoverage['/drag-upload.js'].lineData[77]++;
    var file = files[i], name = file.name, size = file.size;
    _$jscoverage['/drag-upload.js'].lineData[78]++;
    if (visit14_78_1(!name.match(suffixReg))) {
      _$jscoverage['/drag-upload.js'].lineData[79]++;
      continue;
    }
    _$jscoverage['/drag-upload.js'].lineData[81]++;
    if (visit15_81_1(size / 1000 > sizeLimit)) {
      _$jscoverage['/drag-upload.js'].lineData[82]++;
      continue;
    }
    _$jscoverage['/drag-upload.js'].lineData[84]++;
    var img = new Node('<img ' + 'src="' + Utils.debugUrl('theme/tao-loading.gif') + '"/>');
    _$jscoverage['/drag-upload.js'].lineData[86]++;
    var nakeImg = img[0];
    _$jscoverage['/drag-upload.js'].lineData[87]++;
    ap.insertBefore(nakeImg, archor);
    _$jscoverage['/drag-upload.js'].lineData[88]++;
    var np = nakeImg.parentNode, npName = Dom.nodeName(np);
    _$jscoverage['/drag-upload.js'].lineData[90]++;
    if (visit16_90_1(visit17_90_2(npName === 'head') || visit18_90_3(npName === 'html'))) {
      _$jscoverage['/drag-upload.js'].lineData[91]++;
      Dom.insertBefore(nakeImg, document.body.firstChild);
    }
    _$jscoverage['/drag-upload.js'].lineData[94]++;
    fileUpload(file, img);
  }
});
});
  _$jscoverage['/drag-upload.js'].lineData[100]++;
  if (visit19_100_1(window.XMLHttpRequest && !XMLHttpRequest.prototype.sendAsBinary)) {
    _$jscoverage['/drag-upload.js'].lineData[101]++;
    XMLHttpRequest.prototype.sendAsBinary = function(dataStr, contentType) {
  _$jscoverage['/drag-upload.js'].functionData[8]++;
  _$jscoverage['/drag-upload.js'].lineData[103]++;
  var bb;
  _$jscoverage['/drag-upload.js'].lineData[104]++;
  if (visit20_104_1(window.BlobBuilder)) {
    _$jscoverage['/drag-upload.js'].lineData[105]++;
    bb = new window.BlobBuilder();
  } else {
    _$jscoverage['/drag-upload.js'].lineData[107]++;
    bb = window.WebKitBlobBuilder();
  }
  _$jscoverage['/drag-upload.js'].lineData[109]++;
  var len = dataStr.length;
  _$jscoverage['/drag-upload.js'].lineData[110]++;
  var data = new window.Uint8Array(len);
  _$jscoverage['/drag-upload.js'].lineData[111]++;
  for (var i = 0; visit21_111_1(i < len); i++) {
    _$jscoverage['/drag-upload.js'].lineData[112]++;
    data[i] = dataStr.charCodeAt(i);
  }
  _$jscoverage['/drag-upload.js'].lineData[114]++;
  bb.append(data.buffer);
  _$jscoverage['/drag-upload.js'].lineData[115]++;
  this.send(bb.getBlob(contentType));
};
  }
  _$jscoverage['/drag-upload.js'].lineData[119]++;
  function fileUpload(file, img) {
    _$jscoverage['/drag-upload.js'].functionData[9]++;
    _$jscoverage['/drag-upload.js'].lineData[120]++;
    var reader = new window.FileReader();
    _$jscoverage['/drag-upload.js'].lineData[122]++;
    reader.onload = function(ev) {
  _$jscoverage['/drag-upload.js'].functionData[10]++;
  _$jscoverage['/drag-upload.js'].lineData[123]++;
  var fileName = file.name, fileData = ev.target.result, boundary = '----kissy-editor-yiminghe', xhr = new XMLHttpRequest();
  _$jscoverage['/drag-upload.js'].lineData[128]++;
  xhr.open('POST', serverUrl, true);
  _$jscoverage['/drag-upload.js'].lineData[129]++;
  xhr.onreadystatechange = function() {
  _$jscoverage['/drag-upload.js'].functionData[11]++;
  _$jscoverage['/drag-upload.js'].lineData[130]++;
  if (visit22_130_1(xhr.readyState === 4)) {
    _$jscoverage['/drag-upload.js'].lineData[131]++;
    if (visit23_131_1(visit24_131_2(xhr.status === 200) || visit25_131_3(xhr.status === 304))) {
      _$jscoverage['/drag-upload.js'].lineData[132]++;
      if (visit26_132_1(xhr.responseText !== '')) {
        _$jscoverage['/drag-upload.js'].lineData[133]++;
        var info = util.parseJson(xhr.responseText);
        _$jscoverage['/drag-upload.js'].lineData[134]++;
        img[0].src = info.imgUrl;
      }
    } else {
      _$jscoverage['/drag-upload.js'].lineData[137]++;
      window.alert('\u670d\u52a1\u5668\u7aef\u51fa\u9519\uff01');
      _$jscoverage['/drag-upload.js'].lineData[138]++;
      img.remove();
    }
    _$jscoverage['/drag-upload.js'].lineData[140]++;
    xhr.onreadystatechange = null;
  }
};
  _$jscoverage['/drag-upload.js'].lineData[144]++;
  var body = '\r\n--' + boundary + '\r\n';
  _$jscoverage['/drag-upload.js'].lineData[145]++;
  body += 'Content-Disposition: form-data; name=\'' + fileInput + '\'; filename=\'' + encodeURIComponent(fileName) + '\'\r\n';
  _$jscoverage['/drag-upload.js'].lineData[147]++;
  body += 'Content-Type: ' + (visit27_147_1(file.type || 'application/octet-stream')) + '\r\n\r\n';
  _$jscoverage['/drag-upload.js'].lineData[148]++;
  body += fileData + '\r\n';
  _$jscoverage['/drag-upload.js'].lineData[149]++;
  serverParams = Editor.Utils.normParams(serverParams);
  _$jscoverage['/drag-upload.js'].lineData[150]++;
  for (var p in serverParams) {
    _$jscoverage['/drag-upload.js'].lineData[152]++;
    body += '--' + boundary + '\r\n';
    _$jscoverage['/drag-upload.js'].lineData[153]++;
    body += 'Content-Disposition: form-data; name=\'' + p + '\'\r\n\r\n';
    _$jscoverage['/drag-upload.js'].lineData[155]++;
    body += serverParams[p] + '\r\n';
  }
  _$jscoverage['/drag-upload.js'].lineData[158]++;
  body += '--' + boundary + '--';
  _$jscoverage['/drag-upload.js'].lineData[160]++;
  xhr.setRequestHeader('Content-Type', 'multipart/form-data, boundary=' + boundary);
  _$jscoverage['/drag-upload.js'].lineData[164]++;
  xhr.sendAsBinary('Content-Type: multipart/form-data; boundary=' + boundary + '\r\nContent-Length: ' + body.length + '\r\n' + body + '\r\n');
  _$jscoverage['/drag-upload.js'].lineData[166]++;
  reader.onload = null;
};
    _$jscoverage['/drag-upload.js'].lineData[168]++;
    reader.readAsBinaryString(file);
  }
}});
  _$jscoverage['/drag-upload.js'].lineData[173]++;
  return dragUpload;
});
