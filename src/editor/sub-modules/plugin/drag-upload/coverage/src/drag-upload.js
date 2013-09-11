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
  _$jscoverage['/drag-upload.js'].lineData[12] = 0;
  _$jscoverage['/drag-upload.js'].lineData[13] = 0;
  _$jscoverage['/drag-upload.js'].lineData[16] = 0;
  _$jscoverage['/drag-upload.js'].lineData[18] = 0;
  _$jscoverage['/drag-upload.js'].lineData[28] = 0;
  _$jscoverage['/drag-upload.js'].lineData[29] = 0;
  _$jscoverage['/drag-upload.js'].lineData[31] = 0;
  _$jscoverage['/drag-upload.js'].lineData[32] = 0;
  _$jscoverage['/drag-upload.js'].lineData[36] = 0;
  _$jscoverage['/drag-upload.js'].lineData[37] = 0;
  _$jscoverage['/drag-upload.js'].lineData[38] = 0;
  _$jscoverage['/drag-upload.js'].lineData[40] = 0;
  _$jscoverage['/drag-upload.js'].lineData[41] = 0;
  _$jscoverage['/drag-upload.js'].lineData[42] = 0;
  _$jscoverage['/drag-upload.js'].lineData[46] = 0;
  _$jscoverage['/drag-upload.js'].lineData[47] = 0;
  _$jscoverage['/drag-upload.js'].lineData[48] = 0;
  _$jscoverage['/drag-upload.js'].lineData[49] = 0;
  _$jscoverage['/drag-upload.js'].lineData[50] = 0;
  _$jscoverage['/drag-upload.js'].lineData[51] = 0;
  _$jscoverage['/drag-upload.js'].lineData[53] = 0;
  _$jscoverage['/drag-upload.js'].lineData[54] = 0;
  _$jscoverage['/drag-upload.js'].lineData[55] = 0;
  _$jscoverage['/drag-upload.js'].lineData[56] = 0;
  _$jscoverage['/drag-upload.js'].lineData[57] = 0;
  _$jscoverage['/drag-upload.js'].lineData[58] = 0;
  _$jscoverage['/drag-upload.js'].lineData[61] = 0;
  _$jscoverage['/drag-upload.js'].lineData[64] = 0;
  _$jscoverage['/drag-upload.js'].lineData[65] = 0;
  _$jscoverage['/drag-upload.js'].lineData[68] = 0;
  _$jscoverage['/drag-upload.js'].lineData[69] = 0;
  _$jscoverage['/drag-upload.js'].lineData[70] = 0;
  _$jscoverage['/drag-upload.js'].lineData[71] = 0;
  _$jscoverage['/drag-upload.js'].lineData[72] = 0;
  _$jscoverage['/drag-upload.js'].lineData[74] = 0;
  _$jscoverage['/drag-upload.js'].lineData[75] = 0;
  _$jscoverage['/drag-upload.js'].lineData[76] = 0;
  _$jscoverage['/drag-upload.js'].lineData[77] = 0;
  _$jscoverage['/drag-upload.js'].lineData[79] = 0;
  _$jscoverage['/drag-upload.js'].lineData[80] = 0;
  _$jscoverage['/drag-upload.js'].lineData[82] = 0;
  _$jscoverage['/drag-upload.js'].lineData[85] = 0;
  _$jscoverage['/drag-upload.js'].lineData[86] = 0;
  _$jscoverage['/drag-upload.js'].lineData[87] = 0;
  _$jscoverage['/drag-upload.js'].lineData[89] = 0;
  _$jscoverage['/drag-upload.js'].lineData[91] = 0;
  _$jscoverage['/drag-upload.js'].lineData[94] = 0;
  _$jscoverage['/drag-upload.js'].lineData[100] = 0;
  _$jscoverage['/drag-upload.js'].lineData[101] = 0;
  _$jscoverage['/drag-upload.js'].lineData[103] = 0;
  _$jscoverage['/drag-upload.js'].lineData[104] = 0;
  _$jscoverage['/drag-upload.js'].lineData[105] = 0;
  _$jscoverage['/drag-upload.js'].lineData[106] = 0;
  _$jscoverage['/drag-upload.js'].lineData[107] = 0;
  _$jscoverage['/drag-upload.js'].lineData[109] = 0;
  _$jscoverage['/drag-upload.js'].lineData[110] = 0;
  _$jscoverage['/drag-upload.js'].lineData[114] = 0;
  _$jscoverage['/drag-upload.js'].lineData[115] = 0;
  _$jscoverage['/drag-upload.js'].lineData[117] = 0;
  _$jscoverage['/drag-upload.js'].lineData[118] = 0;
  _$jscoverage['/drag-upload.js'].lineData[123] = 0;
  _$jscoverage['/drag-upload.js'].lineData[124] = 0;
  _$jscoverage['/drag-upload.js'].lineData[125] = 0;
  _$jscoverage['/drag-upload.js'].lineData[126] = 0;
  _$jscoverage['/drag-upload.js'].lineData[127] = 0;
  _$jscoverage['/drag-upload.js'].lineData[128] = 0;
  _$jscoverage['/drag-upload.js'].lineData[129] = 0;
  _$jscoverage['/drag-upload.js'].lineData[132] = 0;
  _$jscoverage['/drag-upload.js'].lineData[133] = 0;
  _$jscoverage['/drag-upload.js'].lineData[135] = 0;
  _$jscoverage['/drag-upload.js'].lineData[139] = 0;
  _$jscoverage['/drag-upload.js'].lineData[140] = 0;
  _$jscoverage['/drag-upload.js'].lineData[142] = 0;
  _$jscoverage['/drag-upload.js'].lineData[143] = 0;
  _$jscoverage['/drag-upload.js'].lineData[144] = 0;
  _$jscoverage['/drag-upload.js'].lineData[145] = 0;
  _$jscoverage['/drag-upload.js'].lineData[147] = 0;
  _$jscoverage['/drag-upload.js'].lineData[148] = 0;
  _$jscoverage['/drag-upload.js'].lineData[150] = 0;
  _$jscoverage['/drag-upload.js'].lineData[153] = 0;
  _$jscoverage['/drag-upload.js'].lineData[155] = 0;
  _$jscoverage['/drag-upload.js'].lineData[159] = 0;
  _$jscoverage['/drag-upload.js'].lineData[162] = 0;
  _$jscoverage['/drag-upload.js'].lineData[164] = 0;
  _$jscoverage['/drag-upload.js'].lineData[169] = 0;
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
  _$jscoverage['/drag-upload.js'].branchData['13'] = [];
  _$jscoverage['/drag-upload.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['19'] = [];
  _$jscoverage['/drag-upload.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['20'] = [];
  _$jscoverage['/drag-upload.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['21'] = [];
  _$jscoverage['/drag-upload.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['22'] = [];
  _$jscoverage['/drag-upload.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['23'] = [];
  _$jscoverage['/drag-upload.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['31'] = [];
  _$jscoverage['/drag-upload.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['40'] = [];
  _$jscoverage['/drag-upload.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['53'] = [];
  _$jscoverage['/drag-upload.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['55'] = [];
  _$jscoverage['/drag-upload.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['71'] = [];
  _$jscoverage['/drag-upload.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['74'] = [];
  _$jscoverage['/drag-upload.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['76'] = [];
  _$jscoverage['/drag-upload.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['79'] = [];
  _$jscoverage['/drag-upload.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['89'] = [];
  _$jscoverage['/drag-upload.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['90'] = [];
  _$jscoverage['/drag-upload.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['100'] = [];
  _$jscoverage['/drag-upload.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['103'] = [];
  _$jscoverage['/drag-upload.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['106'] = [];
  _$jscoverage['/drag-upload.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['125'] = [];
  _$jscoverage['/drag-upload.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['126'] = [];
  _$jscoverage['/drag-upload.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['126'][3] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['127'] = [];
  _$jscoverage['/drag-upload.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/drag-upload.js'].branchData['142'] = [];
  _$jscoverage['/drag-upload.js'].branchData['142'][1] = new BranchData();
}
_$jscoverage['/drag-upload.js'].branchData['142'][1].init(1273, 39, 'file.type || "application/octet-stream"');
function visit27_142_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['127'][1].init(38, 22, 'xhr.responseText != ""');
function visit26_127_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['126'][3].init(55, 17, 'xhr.status == 304');
function visit25_126_3(result) {
  _$jscoverage['/drag-upload.js'].branchData['126'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['126'][2].init(34, 17, 'xhr.status == 200');
function visit24_126_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['126'][1].init(34, 38, 'xhr.status == 200 || xhr.status == 304');
function visit23_126_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['125'][1].init(30, 19, 'xhr.readyState == 4');
function visit22_125_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['106'][1].init(294, 7, 'i < len');
function visit21_106_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['103'][1].init(90, 52, 'window[\'BlobBuilder\'] || window[\'WebKitBlobBuilder\']');
function visit20_103_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['100'][1].init(3552, 66, 'window[\'XMLHttpRequest\'] && !XMLHttpRequest.prototype.sendAsBinary');
function visit19_100_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['90'][1].init(49, 17, 'np_name == "html"');
function visit18_90_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['89'][2].init(767, 17, 'np_name == "head"');
function visit17_89_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['89'][1].init(767, 67, 'np_name == "head" || np_name == "html"');
function visit16_89_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['79'][1].init(234, 23, 'size / 1000 > sizeLimit');
function visit15_79_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['76'][1].init(112, 23, '!name.match(suffix_reg)');
function visit14_76_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['74'][1].init(1216, 16, 'i < files.length');
function visit13_74_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['71'][1].init(1113, 6, '!files');
function visit12_71_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['55'][1].init(34, 25, 'Dom.nodeName(el) == "img"');
function visit11_55_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['53'][1].init(301, 26, '!S.isEmptyObject(inserted)');
function visit10_53_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['40'][1].init(64, 13, '!startMonitor');
function visit9_40_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['31'][2].init(105, 24, 'Dom.nodeName(t) == "img"');
function visit8_31_2(result) {
  _$jscoverage['/drag-upload.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['31'][1].init(105, 53, 'Dom.nodeName(t) == "img" && t.src.match(/^file:\\/\\//)');
function visit7_31_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['23'][1].init(291, 35, 'cfg[\'suffix\'] || "png,jpg,jpeg,gif"');
function visit6_23_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['22'][1].init(241, 22, 'cfg[\'serverUrl\'] || ""');
function visit5_22_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['21'][1].init(185, 25, 'cfg[\'serverParams\'] || {}');
function visit4_21_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['20'][1].init(112, 39, 'cfg[\'sizeLimit\'] || Number[\'MAX_VALUE\']');
function visit3_20_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['19'][1].init(51, 30, 'cfg[\'fileInput\'] || "Filedata"');
function visit2_19_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].branchData['13'][1].init(24, 12, 'config || {}');
function visit1_13_1(result) {
  _$jscoverage['/drag-upload.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag-upload.js'].lineData[6]++;
KISSY.add("editor/plugin/drag-upload", function(S, Editor) {
  _$jscoverage['/drag-upload.js'].functionData[0]++;
  _$jscoverage['/drag-upload.js'].lineData[7]++;
  var Node = S.Node, Event = S.Event, Utils = Editor.Utils, Dom = S.DOM;
  _$jscoverage['/drag-upload.js'].lineData[12]++;
  function dragUpload(config) {
    _$jscoverage['/drag-upload.js'].functionData[1]++;
    _$jscoverage['/drag-upload.js'].lineData[13]++;
    this.config = visit1_13_1(config || {});
  }
  _$jscoverage['/drag-upload.js'].lineData[16]++;
  S.augment(dragUpload, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/drag-upload.js'].functionData[2]++;
  _$jscoverage['/drag-upload.js'].lineData[18]++;
  var cfg = this.config, fileInput = visit2_19_1(cfg['fileInput'] || "Filedata"), sizeLimit = visit3_20_1(cfg['sizeLimit'] || Number['MAX_VALUE']), serverParams = visit4_21_1(cfg['serverParams'] || {}), serverUrl = visit5_22_1(cfg['serverUrl'] || ""), suffix = visit6_23_1(cfg['suffix'] || "png,jpg,jpeg,gif"), suffix_reg = new RegExp(suffix.split(/,/).join("|") + "$", "i"), inserted = {}, startMonitor = false;
  _$jscoverage['/drag-upload.js'].lineData[28]++;
  function nodeInsert(ev) {
    _$jscoverage['/drag-upload.js'].functionData[3]++;
    _$jscoverage['/drag-upload.js'].lineData[29]++;
    var oe = ev['originalEvent'], t = oe.target;
    _$jscoverage['/drag-upload.js'].lineData[31]++;
    if (visit7_31_1(visit8_31_2(Dom.nodeName(t) == "img") && t.src.match(/^file:\/\//))) {
      _$jscoverage['/drag-upload.js'].lineData[32]++;
      inserted[t.src] = t;
    }
  }
  _$jscoverage['/drag-upload.js'].lineData[36]++;
  editor.docReady(function() {
  _$jscoverage['/drag-upload.js'].functionData[4]++;
  _$jscoverage['/drag-upload.js'].lineData[37]++;
  var document = editor.get("document")[0];
  _$jscoverage['/drag-upload.js'].lineData[38]++;
  Event.on(document, "dragenter", function() {
  _$jscoverage['/drag-upload.js'].functionData[5]++;
  _$jscoverage['/drag-upload.js'].lineData[40]++;
  if (visit9_40_1(!startMonitor)) {
    _$jscoverage['/drag-upload.js'].lineData[41]++;
    Event.on(document, "DOMNodeInserted", nodeInsert);
    _$jscoverage['/drag-upload.js'].lineData[42]++;
    startMonitor = true;
  }
});
  _$jscoverage['/drag-upload.js'].lineData[46]++;
  Event.on(document, "drop", function(ev) {
  _$jscoverage['/drag-upload.js'].functionData[6]++;
  _$jscoverage['/drag-upload.js'].lineData[47]++;
  Event.remove(document, "DOMNodeInserted", nodeInsert);
  _$jscoverage['/drag-upload.js'].lineData[48]++;
  startMonitor = false;
  _$jscoverage['/drag-upload.js'].lineData[49]++;
  ev.halt();
  _$jscoverage['/drag-upload.js'].lineData[50]++;
  ev = ev['originalEvent'];
  _$jscoverage['/drag-upload.js'].lineData[51]++;
  var archor, ap;
  _$jscoverage['/drag-upload.js'].lineData[53]++;
  if (visit10_53_1(!S.isEmptyObject(inserted))) {
    _$jscoverage['/drag-upload.js'].lineData[54]++;
    S.each(inserted, function(el) {
  _$jscoverage['/drag-upload.js'].functionData[7]++;
  _$jscoverage['/drag-upload.js'].lineData[55]++;
  if (visit11_55_1(Dom.nodeName(el) == "img")) {
    _$jscoverage['/drag-upload.js'].lineData[56]++;
    archor = el.nextSibling;
    _$jscoverage['/drag-upload.js'].lineData[57]++;
    ap = el.parentNode;
    _$jscoverage['/drag-upload.js'].lineData[58]++;
    Dom.remove(el);
  }
});
    _$jscoverage['/drag-upload.js'].lineData[61]++;
    inserted = {};
  } else {
    _$jscoverage['/drag-upload.js'].lineData[64]++;
    ap = document.elementFromPoint(ev.clientX, ev.clientY);
    _$jscoverage['/drag-upload.js'].lineData[65]++;
    archor = ap.lastChild;
  }
  _$jscoverage['/drag-upload.js'].lineData[68]++;
  var dt = ev['dataTransfer'];
  _$jscoverage['/drag-upload.js'].lineData[69]++;
  dt.dropEffect = "copy";
  _$jscoverage['/drag-upload.js'].lineData[70]++;
  var files = dt['files'];
  _$jscoverage['/drag-upload.js'].lineData[71]++;
  if (visit12_71_1(!files)) {
    _$jscoverage['/drag-upload.js'].lineData[72]++;
    return;
  }
  _$jscoverage['/drag-upload.js'].lineData[74]++;
  for (var i = 0; visit13_74_1(i < files.length); i++) {
    _$jscoverage['/drag-upload.js'].lineData[75]++;
    var file = files[i], name = file.name, size = file.size;
    _$jscoverage['/drag-upload.js'].lineData[76]++;
    if (visit14_76_1(!name.match(suffix_reg))) {
      _$jscoverage['/drag-upload.js'].lineData[77]++;
      continue;
    }
    _$jscoverage['/drag-upload.js'].lineData[79]++;
    if (visit15_79_1(size / 1000 > sizeLimit)) {
      _$jscoverage['/drag-upload.js'].lineData[80]++;
      continue;
    }
    _$jscoverage['/drag-upload.js'].lineData[82]++;
    var img = new Node("<img " + "src='" + Utils.debugUrl("theme/tao-loading.gif") + "'" + "/>");
    _$jscoverage['/drag-upload.js'].lineData[85]++;
    var nakeImg = img[0];
    _$jscoverage['/drag-upload.js'].lineData[86]++;
    ap.insertBefore(nakeImg, archor);
    _$jscoverage['/drag-upload.js'].lineData[87]++;
    var np = nakeImg.parentNode, np_name = Dom.nodeName(np);
    _$jscoverage['/drag-upload.js'].lineData[89]++;
    if (visit16_89_1(visit17_89_2(np_name == "head") || visit18_90_1(np_name == "html"))) {
      _$jscoverage['/drag-upload.js'].lineData[91]++;
      Dom.insertBefore(nakeImg, document.body.firstChild);
    }
    _$jscoverage['/drag-upload.js'].lineData[94]++;
    fileUpload(file, img);
  }
});
});
  _$jscoverage['/drag-upload.js'].lineData[100]++;
  if (visit19_100_1(window['XMLHttpRequest'] && !XMLHttpRequest.prototype.sendAsBinary)) {
    _$jscoverage['/drag-upload.js'].lineData[101]++;
    XMLHttpRequest.prototype.sendAsBinary = function(dataStr, contentType) {
  _$jscoverage['/drag-upload.js'].functionData[8]++;
  _$jscoverage['/drag-upload.js'].lineData[103]++;
  var bb = new (visit20_103_1(window['BlobBuilder'] || window['WebKitBlobBuilder']))();
  _$jscoverage['/drag-upload.js'].lineData[104]++;
  var len = dataStr.length;
  _$jscoverage['/drag-upload.js'].lineData[105]++;
  var data = new window['Uint8Array'](len);
  _$jscoverage['/drag-upload.js'].lineData[106]++;
  for (var i = 0; visit21_106_1(i < len); i++) {
    _$jscoverage['/drag-upload.js'].lineData[107]++;
    data[i] = dataStr['charCodeAt'](i);
  }
  _$jscoverage['/drag-upload.js'].lineData[109]++;
  bb.append(data.buffer);
  _$jscoverage['/drag-upload.js'].lineData[110]++;
  this.send(bb['getBlob'](contentType));
};
  }
  _$jscoverage['/drag-upload.js'].lineData[114]++;
  function fileUpload(file, img) {
    _$jscoverage['/drag-upload.js'].functionData[9]++;
    _$jscoverage['/drag-upload.js'].lineData[115]++;
    var reader = new window['FileReader']();
    _$jscoverage['/drag-upload.js'].lineData[117]++;
    reader.onload = function(ev) {
  _$jscoverage['/drag-upload.js'].functionData[10]++;
  _$jscoverage['/drag-upload.js'].lineData[118]++;
  var fileName = file.name, fileData = ev.target['result'], boundary = "----kissy-editor-yiminghe", xhr = new XMLHttpRequest();
  _$jscoverage['/drag-upload.js'].lineData[123]++;
  xhr.open("POST", serverUrl, true);
  _$jscoverage['/drag-upload.js'].lineData[124]++;
  xhr.onreadystatechange = function() {
  _$jscoverage['/drag-upload.js'].functionData[11]++;
  _$jscoverage['/drag-upload.js'].lineData[125]++;
  if (visit22_125_1(xhr.readyState == 4)) {
    _$jscoverage['/drag-upload.js'].lineData[126]++;
    if (visit23_126_1(visit24_126_2(xhr.status == 200) || visit25_126_3(xhr.status == 304))) {
      _$jscoverage['/drag-upload.js'].lineData[127]++;
      if (visit26_127_1(xhr.responseText != "")) {
        _$jscoverage['/drag-upload.js'].lineData[128]++;
        var info = S.parseJson(xhr.responseText);
        _$jscoverage['/drag-upload.js'].lineData[129]++;
        img[0].src = info['imgUrl'];
      }
    } else {
      _$jscoverage['/drag-upload.js'].lineData[132]++;
      alert("\u670d\u52a1\u5668\u7aef\u51fa\u9519\uff01");
      _$jscoverage['/drag-upload.js'].lineData[133]++;
      img.remove();
    }
    _$jscoverage['/drag-upload.js'].lineData[135]++;
    xhr.onreadystatechange = null;
  }
};
  _$jscoverage['/drag-upload.js'].lineData[139]++;
  var body = "\r\n--" + boundary + "\r\n";
  _$jscoverage['/drag-upload.js'].lineData[140]++;
  body += "Content-Disposition: form-data; name=\"" + fileInput + "\"; filename=\"" + encodeURIComponent(fileName) + "\"\r\n";
  _$jscoverage['/drag-upload.js'].lineData[142]++;
  body += "Content-Type: " + (visit27_142_1(file.type || "application/octet-stream")) + "\r\n\r\n";
  _$jscoverage['/drag-upload.js'].lineData[143]++;
  body += fileData + "\r\n";
  _$jscoverage['/drag-upload.js'].lineData[144]++;
  serverParams = Editor.Utils.normParams(serverParams);
  _$jscoverage['/drag-upload.js'].lineData[145]++;
  for (var p in serverParams) {
    _$jscoverage['/drag-upload.js'].lineData[147]++;
    body += "--" + boundary + "\r\n";
    _$jscoverage['/drag-upload.js'].lineData[148]++;
    body += "Content-Disposition: form-data; name=\"" + p + "\"\r\n\r\n";
    _$jscoverage['/drag-upload.js'].lineData[150]++;
    body += serverParams[p] + "\r\n";
  }
  _$jscoverage['/drag-upload.js'].lineData[153]++;
  body += "--" + boundary + "--";
  _$jscoverage['/drag-upload.js'].lineData[155]++;
  xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary);
  _$jscoverage['/drag-upload.js'].lineData[159]++;
  xhr.sendAsBinary("Content-Type: multipart/form-data; boundary=" + boundary + "\r\nContent-Length: " + body.length + "\r\n" + body + "\r\n");
  _$jscoverage['/drag-upload.js'].lineData[162]++;
  reader.onload = null;
};
    _$jscoverage['/drag-upload.js'].lineData[164]++;
    reader['readAsBinaryString'](file);
  }
}});
  _$jscoverage['/drag-upload.js'].lineData[169]++;
  return dragUpload;
}, {
  requires: ['editor']});
