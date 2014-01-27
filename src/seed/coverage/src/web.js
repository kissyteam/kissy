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
if (! _$jscoverage['/web.js']) {
  _$jscoverage['/web.js'] = {};
  _$jscoverage['/web.js'].lineData = [];
  _$jscoverage['/web.js'].lineData[6] = 0;
  _$jscoverage['/web.js'].lineData[7] = 0;
  _$jscoverage['/web.js'].lineData[8] = 0;
  _$jscoverage['/web.js'].lineData[29] = 0;
  _$jscoverage['/web.js'].lineData[31] = 0;
  _$jscoverage['/web.js'].lineData[34] = 0;
  _$jscoverage['/web.js'].lineData[36] = 0;
  _$jscoverage['/web.js'].lineData[39] = 0;
  _$jscoverage['/web.js'].lineData[47] = 0;
  _$jscoverage['/web.js'].lineData[57] = 0;
  _$jscoverage['/web.js'].lineData[58] = 0;
  _$jscoverage['/web.js'].lineData[60] = 0;
  _$jscoverage['/web.js'].lineData[61] = 0;
  _$jscoverage['/web.js'].lineData[63] = 0;
  _$jscoverage['/web.js'].lineData[64] = 0;
  _$jscoverage['/web.js'].lineData[67] = 0;
  _$jscoverage['/web.js'].lineData[68] = 0;
  _$jscoverage['/web.js'].lineData[69] = 0;
  _$jscoverage['/web.js'].lineData[72] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[74] = 0;
  _$jscoverage['/web.js'].lineData[76] = 0;
  _$jscoverage['/web.js'].lineData[77] = 0;
  _$jscoverage['/web.js'].lineData[79] = 0;
  _$jscoverage['/web.js'].lineData[87] = 0;
  _$jscoverage['/web.js'].lineData[91] = 0;
  _$jscoverage['/web.js'].lineData[92] = 0;
  _$jscoverage['/web.js'].lineData[94] = 0;
  _$jscoverage['/web.js'].lineData[95] = 0;
  _$jscoverage['/web.js'].lineData[108] = 0;
  _$jscoverage['/web.js'].lineData[109] = 0;
  _$jscoverage['/web.js'].lineData[110] = 0;
  _$jscoverage['/web.js'].lineData[112] = 0;
  _$jscoverage['/web.js'].lineData[113] = 0;
  _$jscoverage['/web.js'].lineData[114] = 0;
  _$jscoverage['/web.js'].lineData[118] = 0;
  _$jscoverage['/web.js'].lineData[120] = 0;
  _$jscoverage['/web.js'].lineData[130] = 0;
  _$jscoverage['/web.js'].lineData[131] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[133] = 0;
  _$jscoverage['/web.js'].lineData[134] = 0;
  _$jscoverage['/web.js'].lineData[135] = 0;
  _$jscoverage['/web.js'].lineData[137] = 0;
  _$jscoverage['/web.js'].lineData[138] = 0;
  _$jscoverage['/web.js'].lineData[139] = 0;
  _$jscoverage['/web.js'].lineData[140] = 0;
  _$jscoverage['/web.js'].lineData[146] = 0;
  _$jscoverage['/web.js'].lineData[147] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[151] = 0;
  _$jscoverage['/web.js'].lineData[152] = 0;
  _$jscoverage['/web.js'].lineData[154] = 0;
  _$jscoverage['/web.js'].lineData[155] = 0;
  _$jscoverage['/web.js'].lineData[156] = 0;
  _$jscoverage['/web.js'].lineData[157] = 0;
  _$jscoverage['/web.js'].lineData[159] = 0;
  _$jscoverage['/web.js'].lineData[161] = 0;
  _$jscoverage['/web.js'].lineData[162] = 0;
  _$jscoverage['/web.js'].lineData[169] = 0;
  _$jscoverage['/web.js'].lineData[172] = 0;
  _$jscoverage['/web.js'].lineData[173] = 0;
  _$jscoverage['/web.js'].lineData[174] = 0;
  _$jscoverage['/web.js'].lineData[178] = 0;
  _$jscoverage['/web.js'].lineData[181] = 0;
  _$jscoverage['/web.js'].lineData[182] = 0;
  _$jscoverage['/web.js'].lineData[183] = 0;
  _$jscoverage['/web.js'].lineData[184] = 0;
  _$jscoverage['/web.js'].lineData[187] = 0;
  _$jscoverage['/web.js'].lineData[189] = 0;
  _$jscoverage['/web.js'].lineData[190] = 0;
  _$jscoverage['/web.js'].lineData[191] = 0;
  _$jscoverage['/web.js'].lineData[192] = 0;
  _$jscoverage['/web.js'].lineData[198] = 0;
  _$jscoverage['/web.js'].lineData[202] = 0;
  _$jscoverage['/web.js'].lineData[205] = 0;
  _$jscoverage['/web.js'].lineData[206] = 0;
  _$jscoverage['/web.js'].lineData[208] = 0;
  _$jscoverage['/web.js'].lineData[212] = 0;
  _$jscoverage['/web.js'].lineData[213] = 0;
  _$jscoverage['/web.js'].lineData[214] = 0;
  _$jscoverage['/web.js'].lineData[216] = 0;
  _$jscoverage['/web.js'].lineData[217] = 0;
  _$jscoverage['/web.js'].lineData[219] = 0;
  _$jscoverage['/web.js'].lineData[222] = 0;
  _$jscoverage['/web.js'].lineData[228] = 0;
  _$jscoverage['/web.js'].lineData[229] = 0;
  _$jscoverage['/web.js'].lineData[236] = 0;
  _$jscoverage['/web.js'].lineData[238] = 0;
  _$jscoverage['/web.js'].lineData[239] = 0;
  _$jscoverage['/web.js'].lineData[240] = 0;
}
if (! _$jscoverage['/web.js'].functionData) {
  _$jscoverage['/web.js'].functionData = [];
  _$jscoverage['/web.js'].functionData[0] = 0;
  _$jscoverage['/web.js'].functionData[1] = 0;
  _$jscoverage['/web.js'].functionData[2] = 0;
  _$jscoverage['/web.js'].functionData[3] = 0;
  _$jscoverage['/web.js'].functionData[4] = 0;
  _$jscoverage['/web.js'].functionData[5] = 0;
  _$jscoverage['/web.js'].functionData[6] = 0;
  _$jscoverage['/web.js'].functionData[7] = 0;
  _$jscoverage['/web.js'].functionData[8] = 0;
  _$jscoverage['/web.js'].functionData[9] = 0;
  _$jscoverage['/web.js'].functionData[10] = 0;
  _$jscoverage['/web.js'].functionData[11] = 0;
  _$jscoverage['/web.js'].functionData[12] = 0;
  _$jscoverage['/web.js'].functionData[13] = 0;
  _$jscoverage['/web.js'].functionData[14] = 0;
  _$jscoverage['/web.js'].functionData[15] = 0;
  _$jscoverage['/web.js'].functionData[16] = 0;
  _$jscoverage['/web.js'].functionData[17] = 0;
  _$jscoverage['/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/web.js'].branchData) {
  _$jscoverage['/web.js'].branchData = {};
  _$jscoverage['/web.js'].branchData['11'] = [];
  _$jscoverage['/web.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['23'] = [];
  _$jscoverage['/web.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['47'] = [];
  _$jscoverage['/web.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['47'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['57'] = [];
  _$jscoverage['/web.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['63'] = [];
  _$jscoverage['/web.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['76'] = [];
  _$jscoverage['/web.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['87'] = [];
  _$jscoverage['/web.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['91'] = [];
  _$jscoverage['/web.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['108'] = [];
  _$jscoverage['/web.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['112'] = [];
  _$jscoverage['/web.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['133'] = [];
  _$jscoverage['/web.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['138'] = [];
  _$jscoverage['/web.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['147'] = [];
  _$jscoverage['/web.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['151'] = [];
  _$jscoverage['/web.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['155'] = [];
  _$jscoverage['/web.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['159'] = [];
  _$jscoverage['/web.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['172'] = [];
  _$jscoverage['/web.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['181'] = [];
  _$jscoverage['/web.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['190'] = [];
  _$jscoverage['/web.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['203'] = [];
  _$jscoverage['/web.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['206'] = [];
  _$jscoverage['/web.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['212'] = [];
  _$jscoverage['/web.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['228'] = [];
  _$jscoverage['/web.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['228'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['238'] = [];
  _$jscoverage['/web.js'].branchData['238'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['238'][1].init(7625, 5, 'UA.ie');
function visit685_238_1(result) {
  _$jscoverage['/web.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['228'][3].init(7344, 24, 'location.search || EMPTY');
function visit684_228_3(result) {
  _$jscoverage['/web.js'].branchData['228'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['228'][2].init(7344, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit683_228_2(result) {
  _$jscoverage['/web.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['228'][1].init(7331, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit682_228_1(result) {
  _$jscoverage['/web.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['212'][1].init(907, 20, 'doScroll && notframe');
function visit681_212_1(result) {
  _$jscoverage['/web.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['206'][1].init(29, 25, 'win.frameElement === null');
function visit680_206_1(result) {
  _$jscoverage['/web.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['203'][1].init(40, 27, 'docElem && docElem.doScroll');
function visit679_203_1(result) {
  _$jscoverage['/web.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['190'][1].init(21, 27, 'doc.readyState === COMPLETE');
function visit678_190_1(result) {
  _$jscoverage['/web.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['181'][1].init(361, 18, 'standardEventModel');
function visit677_181_1(result) {
  _$jscoverage['/web.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['172'][2].init(125, 27, 'doc.readyState === COMPLETE');
function visit676_172_2(result) {
  _$jscoverage['/web.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['172'][1].init(117, 35, '!doc || doc.readyState === COMPLETE');
function visit675_172_1(result) {
  _$jscoverage['/web.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['159'][1].init(23, 12, 'e.stack || e');
function visit674_159_1(result) {
  _$jscoverage['/web.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['155'][1].init(223, 20, 'i < callbacks.length');
function visit673_155_1(result) {
  _$jscoverage['/web.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['151'][1].init(85, 17, 'doc && !UA.nodejs');
function visit672_151_1(result) {
  _$jscoverage['/web.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['147'][1].init(13, 8, 'domReady');
function visit671_147_1(result) {
  _$jscoverage['/web.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['138'][1].init(205, 4, 'node');
function visit670_138_1(result) {
  _$jscoverage['/web.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['133'][1].init(21, 27, '++retryCount > POLL_RETIRES');
function visit669_133_1(result) {
  _$jscoverage['/web.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['112'][1].init(27, 12, 'e.stack || e');
function visit668_112_1(result) {
  _$jscoverage['/web.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['108'][1].init(17, 8, 'domReady');
function visit667_108_1(result) {
  _$jscoverage['/web.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['91'][1].init(269, 14, 'win.execScript');
function visit666_91_1(result) {
  _$jscoverage['/web.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['87'][1].init(17, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit665_87_1(result) {
  _$jscoverage['/web.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['76'][2].init(711, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit664_76_2(result) {
  _$jscoverage['/web.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['76'][1].init(703, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit663_76_1(result) {
  _$jscoverage['/web.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['63'][1].init(49, 13, 'win.DOMParser');
function visit662_63_1(result) {
  _$jscoverage['/web.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['57'][1].init(46, 20, 'data.documentElement');
function visit661_57_1(result) {
  _$jscoverage['/web.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['47'][3].init(106, 17, 'obj == obj.window');
function visit660_47_3(result) {
  _$jscoverage['/web.js'].branchData['47'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['47'][2].init(91, 11, 'obj != null');
function visit659_47_2(result) {
  _$jscoverage['/web.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['47'][1].init(91, 32, 'obj != null && obj == obj.window');
function visit658_47_1(result) {
  _$jscoverage['/web.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['23'][1].init(463, 27, 'doc && doc.addEventListener');
function visit657_23_1(result) {
  _$jscoverage['/web.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['11'][1].init(86, 26, 'doc && doc.documentElement');
function visit656_11_1(result) {
  _$jscoverage['/web.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[7]++;
  var logger = S.getLogger('s/web');
  _$jscoverage['/web.js'].lineData[8]++;
  var win = S.Env.host, UA = S.UA, doc = win.document, docElem = visit656_11_1(doc && doc.documentElement), location = win.location, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit657_23_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[29]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[31]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[34]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[36]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[39]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[47]++;
  return visit658_47_1(visit659_47_2(obj != null) && visit660_47_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[57]++;
  if (visit661_57_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[58]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[60]++;
  var xml;
  _$jscoverage['/web.js'].lineData[61]++;
  try {
    _$jscoverage['/web.js'].lineData[63]++;
    if (visit662_63_1(win.DOMParser)) {
      _$jscoverage['/web.js'].lineData[64]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[67]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[68]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[69]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[72]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[73]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[74]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[76]++;
  if (visit663_76_1(!xml || visit664_76_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[77]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[79]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[87]++;
  if (visit665_87_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[91]++;
    if (visit666_91_1(win.execScript)) {
      _$jscoverage['/web.js'].lineData[92]++;
      win.execScript(data);
    } else {
      _$jscoverage['/web.js'].lineData[94]++;
      (function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[95]++;
  win['eval'].call(win, data);
})(data);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[108]++;
  if (visit667_108_1(domReady)) {
    _$jscoverage['/web.js'].lineData[109]++;
    try {
      _$jscoverage['/web.js'].lineData[110]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/web.js'].lineData[112]++;
  S.log(visit668_112_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[113]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[114]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/web.js'].lineData[118]++;
    callbacks.push(fn);
  }
  _$jscoverage['/web.js'].lineData[120]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[130]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[131]++;
  var retryCount = 1;
  _$jscoverage['/web.js'].lineData[132]++;
  var timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[12]++;
  _$jscoverage['/web.js'].lineData[133]++;
  if (visit669_133_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/web.js'].lineData[134]++;
    timer.cancel();
    _$jscoverage['/web.js'].lineData[135]++;
    return;
  }
  _$jscoverage['/web.js'].lineData[137]++;
  var node = doc.getElementById(id);
  _$jscoverage['/web.js'].lineData[138]++;
  if (visit670_138_1(node)) {
    _$jscoverage['/web.js'].lineData[139]++;
    fn(node);
    _$jscoverage['/web.js'].lineData[140]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[146]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[147]++;
    if (visit671_147_1(domReady)) {
      _$jscoverage['/web.js'].lineData[148]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[151]++;
    if (visit672_151_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[152]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[154]++;
    domReady = 1;
    _$jscoverage['/web.js'].lineData[155]++;
    for (var i = 0; visit673_155_1(i < callbacks.length); i++) {
      _$jscoverage['/web.js'].lineData[156]++;
      try {
        _$jscoverage['/web.js'].lineData[157]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[159]++;
  S.log(visit674_159_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[161]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[162]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/web.js'].lineData[169]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[15]++;
    _$jscoverage['/web.js'].lineData[172]++;
    if (visit675_172_1(!doc || visit676_172_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[173]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[174]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[178]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[181]++;
    if (visit677_181_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[182]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[183]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[184]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[187]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[189]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[17]++;
  _$jscoverage['/web.js'].lineData[190]++;
  if (visit678_190_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[191]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[192]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[198]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[202]++;
      var notframe, doScroll = visit679_203_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[205]++;
      try {
        _$jscoverage['/web.js'].lineData[206]++;
        notframe = (visit680_206_1(win.frameElement === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[208]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[212]++;
      if (visit681_212_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[213]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[18]++;
  _$jscoverage['/web.js'].lineData[214]++;
  try {
    _$jscoverage['/web.js'].lineData[216]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[217]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[219]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[222]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[228]++;
  if (visit682_228_1(location && visit683_228_2((visit684_228_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[229]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[236]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[238]++;
  if (visit685_238_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[239]++;
    try {
      _$jscoverage['/web.js'].lineData[240]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
