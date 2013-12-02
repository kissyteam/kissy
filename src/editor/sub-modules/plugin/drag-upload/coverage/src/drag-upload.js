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
  _$jscoverage['/drag-upload.js'].lineData[13] = 0;
  _$jscoverage['/drag-upload.js'].lineData[14] = 0;
  _$jscoverage['/drag-upload.js'].lineData[17] = 0;
  _$jscoverage['/drag-upload.js'].lineData[19] = 0;
  _$jscoverage['/drag-upload.js'].lineData[29] = 0;
  _$jscoverage['/drag-upload.js'].lineData[30] = 0;
  _$jscoverage['/drag-upload.js'].lineData[32] = 0;
  _$jscoverage['/drag-upload.js'].lineData[33] = 0;
  _$jscoverage['/drag-upload.js'].lineData[37] = 0;
  _$jscoverage['/drag-upload.js'].lineData[38] = 0;
  _$jscoverage['/drag-upload.js'].lineData[39] = 0;
  _$jscoverage['/drag-upload.js'].lineData[41] = 0;
  _$jscoverage['/drag-upload.js'].lineData[42] = 0;
  _$jscoverage['/drag-upload.js'].lineData[43] = 0;
  _$jscoverage['/drag-upload.js'].lineData[47] = 0;
  _$jscoverage['/drag-upload.js'].lineData[48] = 0;
  _$jscoverage['/drag-upload.js'].lineData[49] = 0;
  _$jscoverage['/drag-upload.js'].lineData[50] = 0;
  _$jscoverage['/drag-upload.js'].lineData[51] = 0;
  _$jscoverage['/drag-upload.js'].lineData[52] = 0;
  _$jscoverage['/drag-upload.js'].lineData[54] = 0;
  _$jscoverage['/drag-upload.js'].lineData[55] = 0;
  _$jscoverage['/drag-upload.js'].lineData[56] = 0;
  _$jscoverage['/drag-upload.js'].lineData[57] = 0;
  _$jscoverage['/drag-upload.js'].lineData[58] = 0;
  _$jscoverage['/drag-upload.js'].lineData[59] = 0;
  _$jscoverage['/drag-upload.js'].lineData[62] = 0;
  _$jscoverage['/drag-upload.js'].lineData[65] = 0;
  _$jscoverage['/drag-upload.js'].lineData[66] = 0;
  _$jscoverage['/drag-upload.js'].lineData[69] = 0;
  _$jscoverage['/drag-upload.js'].lineData[70] = 0;
  _$jscoverage['/drag-upload.js'].lineData[71] = 0;
  _$jscoverage['/drag-upload.js'].lineData[72] = 0;
  _$jscoverage['/drag-upload.js'].lineData[73] = 0;
  _$jscoverage['/drag-upload.js'].lineData[75] = 0;
  _$jscoverage['/drag-upload.js'].lineData[76] = 0;
  _$jscoverage['/drag-upload.js'].lineData[77] = 0;
  _$jscoverage['/drag-upload.js'].lineData[78] = 0;
  _$jscoverage['/drag-upload.js'].lineData[80] = 0;
  _$jscoverage['/drag-upload.js'].lineData[81] = 0;
  _$jscoverage['/drag-upload.js'].lineData[83] = 0;
  _$jscoverage['/drag-upload.js'].lineData[85] = 0;
  _$jscoverage['/drag-upload.js'].lineData[86] = 0;
  _$jscoverage['/drag-upload.js'].lineData[87] = 0;
  _$jscoverage['/drag-upload.js'].lineData[89] = 0;
  _$jscoverage['/drag-upload.js'].lineData[90] = 0;
  _$jscoverage['/drag-upload.js'].lineData[93] = 0;
  _$jscoverage['/drag-upload.js'].lineData[99] = 0;
  _$jscoverage['/drag-upload.js'].lineData[100] = 0;
  _$jscoverage['/drag-upload.js'].lineData[102] = 0;
  _$jscoverage['/drag-upload.js'].lineData[103] = 0;
  _$jscoverage['/drag-upload.js'].lineData[104] = 0;
  _$jscoverage['/drag-upload.js'].lineData[106] = 0;
  _$jscoverage['/drag-upload.js'].lineData[108] = 0;
  _$jscoverage['/drag-upload.js'].lineData[109] = 0;
  _$jscoverage['/drag-upload.js'].lineData[110] = 0;
  _$jscoverage['/drag-upload.js'].lineData[111] = 0;
  _$jscoverage['/drag-upload.js'].lineData[113] = 0;
  _$jscoverage['/drag-upload.js'].lineData[114] = 0;
  _$jscoverage['/drag-upload.js'].lineData[118] = 0;
  _$jscoverage['/drag-upload.js'].lineData[119] = 0;
  _$jscoverage['/drag-upload.js'].lineData[121] = 0;
  _$jscoverage['/drag-upload.js'].lineData[122] = 0;
  _$jscoverage['/drag-upload.js'].lineData[127] = 0;
  _$jscoverage['/drag-upload.js'].lineData[128] = 0;
  _$jscoverage['/drag-upload.js'].lineData[129] = 0;
  _$jscoverage['/drag-upload.js'].lineData[130] = 0;
  _$jscoverage['/drag-upload.js'].lineData[131] = 0;
  _$jscoverage['/drag-upload.js'].lineData[132] = 0;
  _$jscoverage['/drag-upload.js'].lineData[133] = 0;
  _$jscoverage['/drag-upload.js'].lineData[136] = 0;
  _$jscoverage['/drag-upload.js'].lineData[137] = 0;
  _$jscoverage['/drag-upload.js'].lineData[139] = 0;
  _$jscoverage['/drag-upload.js'].lineData[143] = 0;
  _$jscoverage['/drag-upload.js'].lineData[144] = 0;
  _$jscoverage['/drag-upload.js'].lineData[146] = 0;
  _$jscoverage['/drag-upload.js'].lineData[147] = 0;
  _$jscoverage['/drag-upload.js'].lineData[148] = 0;
  _$jscoverage['/drag-upload.js'].lineData[149] = 0;
  _$jscoverage['/drag-upload.js'].lineData[151] = 0;
  _$jscoverage['/drag-upload.js'].lineData[152] = 0;
  _$jscoverage['/drag-upload.js'].lineData[154] = 0;
  _$jscoverage['/drag-upload.js'].lineData[157] = 0;
  _$jscoverage['/drag-upload.js'].lineData[159] = 0;
  _$jscoverage['/drag-upload.js'].lineData[163] = 0;
  _$jscoverage['/drag-upload.js'].lineData[165] = 0;
  _$jscoverage['/drag-upload.js'].lineData[167] = 0;
  _$jscoverage['/drag-upload.js'].lineData[172] = 0;
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
  _$jscoverage['/drag-upload.js'].branchData['14'] = [];
  _$jscoverage['/drag-upload.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['20'] = [];
  _$jscoverage['/drag-upload.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['21'] = [];
  _$jscoverage['/drag-upload.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['22'] = [];
  _$jscoverage['/drag-upload.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['23'] = [];
  _$jscoverage['/drag-upload.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['24'] = [];
  _$jscoverage['/drag-upload.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['32'] = [];
  _$jscoverage['/drag-upload.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['41'] = [];
  _$jscoverage['/drag-upload.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['54'] = [];
  _$jscoverage['/drag-upload.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['56'] = [];
  _$jscoverage['/drag-upload.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['72'] = [];
  _$jscoverage['/drag-upload.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['75'] = [];
  _$jscoverage['/drag-upload.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['77'] = [];
  _$jscoverage['/drag-upload.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['80'] = [];
  _$jscoverage['/drag-upload.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['89'] = [];
  _$jscoverage['/drag-upload.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['99'] = [];
  _$jscoverage['/drag-upload.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['103'] = [];
  _$jscoverage['/drag-upload.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['110'] = [];
  _$jscoverage['/drag-upload.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['129'] = [];
  _$jscoverage['/drag-upload.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['130'] = [];
  _$jscoverage['/drag-upload.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['130'][3] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['131'] = [];
  _$jscoverage['/drag-upload.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['146'] = [];
  _$jscoverage['/drag-upload.js'].branchData['146'][1] = new BranchData();
}
_$jscoverage['/drag-upload.js'].branchData['146'][1].init(1253, 39, 'file.type || \'application/octet-stream\'');
function visit27_146_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['131'][1].init(37, 23, 'xhr.responseText !== \'\'');
function visit26_131_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['130'][3].init(55, 18, 'xhr.status === 304');
function visit25_130_3(result) {
  _$jscoverage['/drag-upload.js'].branchData['130'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['130'][2].init(33, 18, 'xhr.status === 200');
function visit24_130_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['130'][1].init(33, 40, 'xhr.status === 200 || xhr.status === 304');
function visit23_130_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['129'][1].init(29, 20, 'xhr.readyState === 4');
function visit22_129_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['110'][1].init(432, 7, 'i < len');
function visit21_110_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['103'][1].init(106, 18, 'window.BlobBuilder');
function visit20_103_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['99'][1].init(3377, 63, 'window.XMLHttpRequest && !XMLHttpRequest.prototype.sendAsBinary');
function visit19_99_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['89'][3].init(738, 17, 'npName === \'html\'');
function visit18_89_3(result) {
  _$jscoverage['/drag-upload.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['89'][2].init(717, 17, 'npName === \'head\'');
function visit17_89_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['89'][1].init(717, 38, 'npName === \'head\' || npName === \'html\'');
function visit16_89_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['80'][1].init(228, 23, 'size / 1000 > sizeLimit');
function visit15_80_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['77'][1].init(110, 22, '!name.match(suffixReg)');
function visit14_77_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['75'][1].init(1180, 16, 'i < files.length');
function visit13_75_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['72'][1].init(1080, 6, '!files');
function visit12_72_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['56'][1].init(33, 26, 'Dom.nodeName(el) === \'img\'');
function visit11_56_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['54'][1].init(291, 26, '!S.isEmptyObject(inserted)');
function visit10_54_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['41'][1].init(62, 13, '!startMonitor');
function visit9_41_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['32'][2].init(99, 25, 'Dom.nodeName(t) === \'img\'');
function visit8_32_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['32'][1].init(99, 54, 'Dom.nodeName(t) === \'img\' && t.src.match(/^file:\\/\\//)');
function visit7_32_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['24'][1].init(271, 32, 'cfg.suffix || \'png,jpg,jpeg,gif\'');
function visit6_24_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['23'][1].init(225, 19, 'cfg.serverUrl || \'\'');
function visit5_23_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['22'][1].init(173, 22, 'cfg.serverParams || {}');
function visit4_22_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['21'][1].init(107, 33, 'cfg.sizeLimit || Number.MAX_VALUE');
function visit3_21_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['20'][1].init(50, 27, 'cfg.fileInput || \'Filedata\'');
function visit2_20_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['14'][1].init(23, 12, 'config || {}');
function visit1_14_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/drag-upload.js'].functionData[0]++;
  _$jscoverage['/drag-upload.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/drag-upload.js'].lineData[8]++;
  var Event = require('event');
  _$jscoverage['/drag-upload.js'].lineData[9]++;
  var Node = S.Node, Utils = Editor.Utils, Dom = S.DOM;
  _$jscoverage['/drag-upload.js'].lineData[13]++;
  function dragUpload(config) {
    _$jscoverage['/drag-upload.js'].functionData[1]++;
    _$jscoverage['/drag-upload.js'].lineData[14]++;
    this.config = visit1_14_1(config || {});
  }
  _$jscoverage['/drag-upload.js'].lineData[17]++;
  S.augment(dragUpload, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/drag-upload.js'].functionData[2]++;
  _$jscoverage['/drag-upload.js'].lineData[19]++;
  var cfg = this.config, fileInput = visit2_20_1(cfg.fileInput || 'Filedata'), sizeLimit = visit3_21_1(cfg.sizeLimit || Number.MAX_VALUE), serverParams = visit4_22_1(cfg.serverParams || {}), serverUrl = visit5_23_1(cfg.serverUrl || ''), suffix = visit6_24_1(cfg.suffix || 'png,jpg,jpeg,gif'), suffixReg = new RegExp(suffix.split(/,/).join('|') + '$', 'i'), inserted = {}, startMonitor = false;
  _$jscoverage['/drag-upload.js'].lineData[29]++;
  function nodeInsert(ev) {
    _$jscoverage['/drag-upload.js'].functionData[3]++;
    _$jscoverage['/drag-upload.js'].lineData[30]++;
    var oe = ev.originalEvent, t = oe.target;
    _$jscoverage['/drag-upload.js'].lineData[32]++;
    if (visit7_32_1(visit8_32_2(Dom.nodeName(t) === 'img') && t.src.match(/^file:\/\//))) {
      _$jscoverage['/drag-upload.js'].lineData[33]++;
      inserted[t.src] = t;
    }
  }
  _$jscoverage['/drag-upload.js'].lineData[37]++;
  editor.docReady(function() {
  _$jscoverage['/drag-upload.js'].functionData[4]++;
  _$jscoverage['/drag-upload.js'].lineData[38]++;
  var document = editor.get('document')[0];
  _$jscoverage['/drag-upload.js'].lineData[39]++;
  Event.on(document, 'dragenter', function() {
  _$jscoverage['/drag-upload.js'].functionData[5]++;
  _$jscoverage['/drag-upload.js'].lineData[41]++;
  if (visit9_41_1(!startMonitor)) {
    _$jscoverage['/drag-upload.js'].lineData[42]++;
    Event.on(document, 'DOMNodeInserted', nodeInsert);
    _$jscoverage['/drag-upload.js'].lineData[43]++;
    startMonitor = true;
  }
});
  _$jscoverage['/drag-upload.js'].lineData[47]++;
  Event.on(document, 'drop', function(ev) {
  _$jscoverage['/drag-upload.js'].functionData[6]++;
  _$jscoverage['/drag-upload.js'].lineData[48]++;
  Event.remove(document, 'DOMNodeInserted', nodeInsert);
  _$jscoverage['/drag-upload.js'].lineData[49]++;
  startMonitor = false;
  _$jscoverage['/drag-upload.js'].lineData[50]++;
  ev.halt();
  _$jscoverage['/drag-upload.js'].lineData[51]++;
  ev = ev.originalEvent;
  _$jscoverage['/drag-upload.js'].lineData[52]++;
  var archor, ap;
  _$jscoverage['/drag-upload.js'].lineData[54]++;
  if (visit10_54_1(!S.isEmptyObject(inserted))) {
    _$jscoverage['/drag-upload.js'].lineData[55]++;
    S.each(inserted, function(el) {
  _$jscoverage['/drag-upload.js'].functionData[7]++;
  _$jscoverage['/drag-upload.js'].lineData[56]++;
  if (visit11_56_1(Dom.nodeName(el) === 'img')) {
    _$jscoverage['/drag-upload.js'].lineData[57]++;
    archor = el.nextSibling;
    _$jscoverage['/drag-upload.js'].lineData[58]++;
    ap = el.parentNode;
    _$jscoverage['/drag-upload.js'].lineData[59]++;
    Dom.remove(el);
  }
});
    _$jscoverage['/drag-upload.js'].lineData[62]++;
    inserted = {};
  } else {
    _$jscoverage['/drag-upload.js'].lineData[65]++;
    ap = document.elementFromPoint(ev.clientX, ev.clientY);
    _$jscoverage['/drag-upload.js'].lineData[66]++;
    archor = ap.lastChild;
  }
  _$jscoverage['/drag-upload.js'].lineData[69]++;
  var dt = ev.dataTransfer;
  _$jscoverage['/drag-upload.js'].lineData[70]++;
  dt.dropEffect = 'copy';
  _$jscoverage['/drag-upload.js'].lineData[71]++;
  var files = dt.files;
  _$jscoverage['/drag-upload.js'].lineData[72]++;
  if (visit12_72_1(!files)) {
    _$jscoverage['/drag-upload.js'].lineData[73]++;
    return;
  }
  _$jscoverage['/drag-upload.js'].lineData[75]++;
  for (var i = 0; visit13_75_1(i < files.length); i++) {
    _$jscoverage['/drag-upload.js'].lineData[76]++;
    var file = files[i], name = file.name, size = file.size;
    _$jscoverage['/drag-upload.js'].lineData[77]++;
    if (visit14_77_1(!name.match(suffixReg))) {
      _$jscoverage['/drag-upload.js'].lineData[78]++;
      continue;
    }
    _$jscoverage['/drag-upload.js'].lineData[80]++;
    if (visit15_80_1(size / 1000 > sizeLimit)) {
      _$jscoverage['/drag-upload.js'].lineData[81]++;
      continue;
    }
    _$jscoverage['/drag-upload.js'].lineData[83]++;
    var img = new Node('<img ' + 'src="' + Utils.debugUrl('theme/tao-loading.gif') + '"/>');
    _$jscoverage['/drag-upload.js'].lineData[85]++;
    var nakeImg = img[0];
    _$jscoverage['/drag-upload.js'].lineData[86]++;
    ap.insertBefore(nakeImg, archor);
    _$jscoverage['/drag-upload.js'].lineData[87]++;
    var np = nakeImg.parentNode, npName = Dom.nodeName(np);
    _$jscoverage['/drag-upload.js'].lineData[89]++;
    if (visit16_89_1(visit17_89_2(npName === 'head') || visit18_89_3(npName === 'html'))) {
      _$jscoverage['/drag-upload.js'].lineData[90]++;
      Dom.insertBefore(nakeImg, document.body.firstChild);
    }
    _$jscoverage['/drag-upload.js'].lineData[93]++;
    fileUpload(file, img);
  }
});
});
  _$jscoverage['/drag-upload.js'].lineData[99]++;
  if (visit19_99_1(window.XMLHttpRequest && !XMLHttpRequest.prototype.sendAsBinary)) {
    _$jscoverage['/drag-upload.js'].lineData[100]++;
    XMLHttpRequest.prototype.sendAsBinary = function(dataStr, contentType) {
  _$jscoverage['/drag-upload.js'].functionData[8]++;
  _$jscoverage['/drag-upload.js'].lineData[102]++;
  var bb;
  _$jscoverage['/drag-upload.js'].lineData[103]++;
  if (visit20_103_1(window.BlobBuilder)) {
    _$jscoverage['/drag-upload.js'].lineData[104]++;
    bb = new window.BlobBuilder();
  } else {
    _$jscoverage['/drag-upload.js'].lineData[106]++;
    bb = window.WebKitBlobBuilder();
  }
  _$jscoverage['/drag-upload.js'].lineData[108]++;
  var len = dataStr.length;
  _$jscoverage['/drag-upload.js'].lineData[109]++;
  var data = new window.Uint8Array(len);
  _$jscoverage['/drag-upload.js'].lineData[110]++;
  for (var i = 0; visit21_110_1(i < len); i++) {
    _$jscoverage['/drag-upload.js'].lineData[111]++;
    data[i] = dataStr.charCodeAt(i);
  }
  _$jscoverage['/drag-upload.js'].lineData[113]++;
  bb.append(data.buffer);
  _$jscoverage['/drag-upload.js'].lineData[114]++;
  this.send(bb.getBlob(contentType));
};
  }
  _$jscoverage['/drag-upload.js'].lineData[118]++;
  function fileUpload(file, img) {
    _$jscoverage['/drag-upload.js'].functionData[9]++;
    _$jscoverage['/drag-upload.js'].lineData[119]++;
    var reader = new window.FileReader();
    _$jscoverage['/drag-upload.js'].lineData[121]++;
    reader.onload = function(ev) {
  _$jscoverage['/drag-upload.js'].functionData[10]++;
  _$jscoverage['/drag-upload.js'].lineData[122]++;
  var fileName = file.name, fileData = ev.target.result, boundary = '----kissy-editor-yiminghe', xhr = new XMLHttpRequest();
  _$jscoverage['/drag-upload.js'].lineData[127]++;
  xhr.open('POST', serverUrl, true);
  _$jscoverage['/drag-upload.js'].lineData[128]++;
  xhr.onreadystatechange = function() {
  _$jscoverage['/drag-upload.js'].functionData[11]++;
  _$jscoverage['/drag-upload.js'].lineData[129]++;
  if (visit22_129_1(xhr.readyState === 4)) {
    _$jscoverage['/drag-upload.js'].lineData[130]++;
    if (visit23_130_1(visit24_130_2(xhr.status === 200) || visit25_130_3(xhr.status === 304))) {
      _$jscoverage['/drag-upload.js'].lineData[131]++;
      if (visit26_131_1(xhr.responseText !== '')) {
        _$jscoverage['/drag-upload.js'].lineData[132]++;
        var info = S.parseJson(xhr.responseText);
        _$jscoverage['/drag-upload.js'].lineData[133]++;
        img[0].src = info.imgUrl;
      }
    } else {
      _$jscoverage['/drag-upload.js'].lineData[136]++;
      window.alert('\u670d\u52a1\u5668\u7aef\u51fa\u9519\uff01');
      _$jscoverage['/drag-upload.js'].lineData[137]++;
      img.remove();
    }
    _$jscoverage['/drag-upload.js'].lineData[139]++;
    xhr.onreadystatechange = null;
  }
};
  _$jscoverage['/drag-upload.js'].lineData[143]++;
  var body = '\r\n--' + boundary + '\r\n';
  _$jscoverage['/drag-upload.js'].lineData[144]++;
  body += 'Content-Disposition: form-data; name=\'' + fileInput + '\'; filename=\'' + encodeURIComponent(fileName) + '\'\r\n';
  _$jscoverage['/drag-upload.js'].lineData[146]++;
  body += 'Content-Type: ' + (visit27_146_1(file.type || 'application/octet-stream')) + '\r\n\r\n';
  _$jscoverage['/drag-upload.js'].lineData[147]++;
  body += fileData + '\r\n';
  _$jscoverage['/drag-upload.js'].lineData[148]++;
  serverParams = Editor.Utils.normParams(serverParams);
  _$jscoverage['/drag-upload.js'].lineData[149]++;
  for (var p in serverParams) {
    _$jscoverage['/drag-upload.js'].lineData[151]++;
    body += '--' + boundary + '\r\n';
    _$jscoverage['/drag-upload.js'].lineData[152]++;
    body += 'Content-Disposition: form-data; name=\'' + p + '\'\r\n\r\n';
    _$jscoverage['/drag-upload.js'].lineData[154]++;
    body += serverParams[p] + '\r\n';
  }
  _$jscoverage['/drag-upload.js'].lineData[157]++;
  body += '--' + boundary + '--';
  _$jscoverage['/drag-upload.js'].lineData[159]++;
  xhr.setRequestHeader('Content-Type', 'multipart/form-data, boundary=' + boundary);
  _$jscoverage['/drag-upload.js'].lineData[163]++;
  xhr.sendAsBinary('Content-Type: multipart/form-data; boundary=' + boundary + '\r\nContent-Length: ' + body.length + '\r\n' + body + '\r\n');
  _$jscoverage['/drag-upload.js'].lineData[165]++;
  reader.onload = null;
};
    _$jscoverage['/drag-upload.js'].lineData[167]++;
    reader.readAsBinaryString(file);
  }
}});
  _$jscoverage['/drag-upload.js'].lineData[172]++;
  return dragUpload;
});
