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
if (! _$jscoverage['/io/base.js']) {
  _$jscoverage['/io/base.js'] = {};
  _$jscoverage['/io/base.js'].lineData = [];
  _$jscoverage['/io/base.js'].lineData[6] = 0;
  _$jscoverage['/io/base.js'].lineData[7] = 0;
  _$jscoverage['/io/base.js'].lineData[8] = 0;
  _$jscoverage['/io/base.js'].lineData[10] = 0;
  _$jscoverage['/io/base.js'].lineData[11] = 0;
  _$jscoverage['/io/base.js'].lineData[14] = 0;
  _$jscoverage['/io/base.js'].lineData[55] = 0;
  _$jscoverage['/io/base.js'].lineData[57] = 0;
  _$jscoverage['/io/base.js'].lineData[60] = 0;
  _$jscoverage['/io/base.js'].lineData[61] = 0;
  _$jscoverage['/io/base.js'].lineData[62] = 0;
  _$jscoverage['/io/base.js'].lineData[65] = 0;
  _$jscoverage['/io/base.js'].lineData[67] = 0;
  _$jscoverage['/io/base.js'].lineData[71] = 0;
  _$jscoverage['/io/base.js'].lineData[74] = 0;
  _$jscoverage['/io/base.js'].lineData[76] = 0;
  _$jscoverage['/io/base.js'].lineData[77] = 0;
  _$jscoverage['/io/base.js'].lineData[80] = 0;
  _$jscoverage['/io/base.js'].lineData[81] = 0;
  _$jscoverage['/io/base.js'].lineData[83] = 0;
  _$jscoverage['/io/base.js'].lineData[85] = 0;
  _$jscoverage['/io/base.js'].lineData[89] = 0;
  _$jscoverage['/io/base.js'].lineData[91] = 0;
  _$jscoverage['/io/base.js'].lineData[92] = 0;
  _$jscoverage['/io/base.js'].lineData[95] = 0;
  _$jscoverage['/io/base.js'].lineData[96] = 0;
  _$jscoverage['/io/base.js'].lineData[97] = 0;
  _$jscoverage['/io/base.js'].lineData[99] = 0;
  _$jscoverage['/io/base.js'].lineData[100] = 0;
  _$jscoverage['/io/base.js'].lineData[103] = 0;
  _$jscoverage['/io/base.js'].lineData[278] = 0;
  _$jscoverage['/io/base.js'].lineData[279] = 0;
  _$jscoverage['/io/base.js'].lineData[281] = 0;
  _$jscoverage['/io/base.js'].lineData[282] = 0;
  _$jscoverage['/io/base.js'].lineData[286] = 0;
  _$jscoverage['/io/base.js'].lineData[287] = 0;
  _$jscoverage['/io/base.js'].lineData[289] = 0;
  _$jscoverage['/io/base.js'].lineData[291] = 0;
  _$jscoverage['/io/base.js'].lineData[293] = 0;
  _$jscoverage['/io/base.js'].lineData[344] = 0;
  _$jscoverage['/io/base.js'].lineData[355] = 0;
  _$jscoverage['/io/base.js'].lineData[361] = 0;
  _$jscoverage['/io/base.js'].lineData[362] = 0;
  _$jscoverage['/io/base.js'].lineData[364] = 0;
  _$jscoverage['/io/base.js'].lineData[366] = 0;
  _$jscoverage['/io/base.js'].lineData[367] = 0;
  _$jscoverage['/io/base.js'].lineData[370] = 0;
  _$jscoverage['/io/base.js'].lineData[378] = 0;
  _$jscoverage['/io/base.js'].lineData[386] = 0;
  _$jscoverage['/io/base.js'].lineData[387] = 0;
  _$jscoverage['/io/base.js'].lineData[392] = 0;
  _$jscoverage['/io/base.js'].lineData[393] = 0;
  _$jscoverage['/io/base.js'].lineData[396] = 0;
  _$jscoverage['/io/base.js'].lineData[407] = 0;
  _$jscoverage['/io/base.js'].lineData[414] = 0;
  _$jscoverage['/io/base.js'].lineData[415] = 0;
  _$jscoverage['/io/base.js'].lineData[416] = 0;
  _$jscoverage['/io/base.js'].lineData[420] = 0;
  _$jscoverage['/io/base.js'].lineData[422] = 0;
  _$jscoverage['/io/base.js'].lineData[423] = 0;
  _$jscoverage['/io/base.js'].lineData[426] = 0;
  _$jscoverage['/io/base.js'].lineData[427] = 0;
  _$jscoverage['/io/base.js'].lineData[428] = 0;
  _$jscoverage['/io/base.js'].lineData[429] = 0;
  _$jscoverage['/io/base.js'].lineData[431] = 0;
  _$jscoverage['/io/base.js'].lineData[434] = 0;
  _$jscoverage['/io/base.js'].lineData[438] = 0;
  _$jscoverage['/io/base.js'].lineData[441] = 0;
  _$jscoverage['/io/base.js'].lineData[443] = 0;
  _$jscoverage['/io/base.js'].lineData[459] = 0;
  _$jscoverage['/io/base.js'].lineData[469] = 0;
  _$jscoverage['/io/base.js'].lineData[477] = 0;
  _$jscoverage['/io/base.js'].lineData[486] = 0;
  _$jscoverage['/io/base.js'].lineData[490] = 0;
}
if (! _$jscoverage['/io/base.js'].functionData) {
  _$jscoverage['/io/base.js'].functionData = [];
  _$jscoverage['/io/base.js'].functionData[0] = 0;
  _$jscoverage['/io/base.js'].functionData[1] = 0;
  _$jscoverage['/io/base.js'].functionData[2] = 0;
  _$jscoverage['/io/base.js'].functionData[3] = 0;
  _$jscoverage['/io/base.js'].functionData[4] = 0;
  _$jscoverage['/io/base.js'].functionData[5] = 0;
  _$jscoverage['/io/base.js'].functionData[6] = 0;
  _$jscoverage['/io/base.js'].functionData[7] = 0;
  _$jscoverage['/io/base.js'].functionData[8] = 0;
  _$jscoverage['/io/base.js'].functionData[9] = 0;
}
if (! _$jscoverage['/io/base.js'].branchData) {
  _$jscoverage['/io/base.js'].branchData = {};
  _$jscoverage['/io/base.js'].branchData['18'] = [];
  _$jscoverage['/io/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['22'] = [];
  _$jscoverage['/io/base.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['65'] = [];
  _$jscoverage['/io/base.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['76'] = [];
  _$jscoverage['/io/base.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['83'] = [];
  _$jscoverage['/io/base.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['89'] = [];
  _$jscoverage['/io/base.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['91'] = [];
  _$jscoverage['/io/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['95'] = [];
  _$jscoverage['/io/base.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['96'] = [];
  _$jscoverage['/io/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['99'] = [];
  _$jscoverage['/io/base.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['281'] = [];
  _$jscoverage['/io/base.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['302'] = [];
  _$jscoverage['/io/base.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['361'] = [];
  _$jscoverage['/io/base.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['366'] = [];
  _$jscoverage['/io/base.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['380'] = [];
  _$jscoverage['/io/base.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['381'] = [];
  _$jscoverage['/io/base.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['392'] = [];
  _$jscoverage['/io/base.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['392'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['414'] = [];
  _$jscoverage['/io/base.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['426'] = [];
  _$jscoverage['/io/base.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['427'] = [];
  _$jscoverage['/io/base.js'].branchData['427'][1] = new BranchData();
}
_$jscoverage['/io/base.js'].branchData['427'][1].init(24, 12, 'e.stack || e');
function visit24_427_1(result) {
  _$jscoverage['/io/base.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['426'][1].init(75, 14, 'self.state < 2');
function visit23_426_1(result) {
  _$jscoverage['/io/base.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['414'][2].init(3704, 11, 'timeout > 0');
function visit22_414_2(result) {
  _$jscoverage['/io/base.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['414'][1].init(3693, 22, 'c.async && timeout > 0');
function visit21_414_1(result) {
  _$jscoverage['/io/base.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['392'][2].init(3186, 45, 'c.beforeSend.call(context, self, c) === false');
function visit20_392_2(result) {
  _$jscoverage['/io/base.js'].branchData['392'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['392'][1].init(3169, 63, 'c.beforeSend && (c.beforeSend.call(context, self, c) === false)');
function visit19_392_1(result) {
  _$jscoverage['/io/base.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['381'][1].init(69, 16, 'dataType === \'*\'');
function visit18_381_1(result) {
  _$jscoverage['/io/base.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['380'][1].init(62, 29, 'dataType && accepts[dataType]');
function visit17_380_1(result) {
  _$jscoverage['/io/base.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['366'][1].init(2311, 13, 'c.contentType');
function visit16_366_1(result) {
  _$jscoverage['/io/base.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['361'][1].init(2158, 44, 'transports[c.dataType[0]] || transports[\'*\']');
function visit15_361_1(result) {
  _$jscoverage['/io/base.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['302'][1].init(260, 7, 'c || {}');
function visit14_302_1(result) {
  _$jscoverage['/io/base.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['281'][1].init(42, 21, '!(self instanceof IO)');
function visit13_281_1(result) {
  _$jscoverage['/io/base.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['99'][1].init(114, 17, 'c.cache === false');
function visit12_99_1(result) {
  _$jscoverage['/io/base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['96'][1].init(18, 6, 'c.data');
function visit11_96_1(result) {
  _$jscoverage['/io/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['95'][1].init(1125, 13, '!c.hasContent');
function visit10_95_1(result) {
  _$jscoverage['/io/base.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['91'][1].init(1000, 65, '!(\'cache\' in c) && util.inArray(dataType[0], [\'script\', \'jsonp\'])');
function visit9_91_1(result) {
  _$jscoverage['/io/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['89'][1].init(953, 15, 'dataType || \'*\'');
function visit8_89_1(result) {
  _$jscoverage['/io/base.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['83'][3].init(714, 24, 'typeof data !== \'string\'');
function visit7_83_3(result) {
  _$jscoverage['/io/base.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['83'][2].init(696, 42, '(data = c.data) && typeof data !== \'string\'');
function visit6_83_2(result) {
  _$jscoverage['/io/base.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['83'][1].init(678, 60, 'c.processData && (data = c.data) && typeof data !== \'string\'');
function visit5_83_1(result) {
  _$jscoverage['/io/base.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['76'][1].init(461, 21, '!(\'crossDomain\' in c)');
function visit4_76_1(result) {
  _$jscoverage['/io/base.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['65'][1].init(214, 12, 'context || c');
function visit3_65_1(result) {
  _$jscoverage['/io/base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['22'][1].init(399, 71, 'simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())');
function visit2_22_1(result) {
  _$jscoverage['/io/base.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['18'][1].init(258, 18, 'win.location || {}');
function visit1_18_1(result) {
  _$jscoverage['/io/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/base.js'].functionData[0]++;
  _$jscoverage['/io/base.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/base.js'].lineData[8]++;
  var CustomEvent = require('event/custom'), Promise = require('promise');
  _$jscoverage['/io/base.js'].lineData[10]++;
  var Uri = require('uri');
  _$jscoverage['/io/base.js'].lineData[11]++;
  var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/, rspace = /\s+/, mirror = function(s) {
  _$jscoverage['/io/base.js'].functionData[1]++;
  _$jscoverage['/io/base.js'].lineData[14]++;
  return s;
}, rnoContent = /^(?:GET|HEAD)$/, win = S.Env.host, location = visit1_18_1(win.location || {}), simulatedLocation = new Uri(location.href), isLocal = visit2_22_1(simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())), transports = {}, defaultConfig = {
  type: 'GET', 
  contentType: 'application/x-www-form-urlencoded; charset=UTF-8', 
  async: true, 
  serializeArray: true, 
  processData: true, 
  accepts: {
  xml: 'application/xml, text/xml', 
  html: 'text/html', 
  text: 'text/plain', 
  json: 'application/json, text/javascript', 
  '*': '*/*'}, 
  converters: {
  text: {
  json: util.parseJson, 
  html: mirror, 
  text: mirror, 
  xml: util.parseXML}}, 
  headers: {
  'X-Requested-With': 'XMLHttpRequest'}, 
  contents: {
  xml: /xml/, 
  html: /html/, 
  json: /json/}};
  _$jscoverage['/io/base.js'].lineData[55]++;
  defaultConfig.converters.html = defaultConfig.converters.text;
  _$jscoverage['/io/base.js'].lineData[57]++;
  function setUpConfig(c) {
    _$jscoverage['/io/base.js'].functionData[2]++;
    _$jscoverage['/io/base.js'].lineData[60]++;
    var context = c.context;
    _$jscoverage['/io/base.js'].lineData[61]++;
    delete c.context;
    _$jscoverage['/io/base.js'].lineData[62]++;
    c = util.mix(util.clone(defaultConfig), c, {
  deep: true});
    _$jscoverage['/io/base.js'].lineData[65]++;
    c.context = visit3_65_1(context || c);
    _$jscoverage['/io/base.js'].lineData[67]++;
    var data, uri, type = c.type, dataType = c.dataType;
    _$jscoverage['/io/base.js'].lineData[71]++;
    uri = c.uri = simulatedLocation.resolve(c.url);
    _$jscoverage['/io/base.js'].lineData[74]++;
    c.uri.setQuery('');
    _$jscoverage['/io/base.js'].lineData[76]++;
    if (visit4_76_1(!('crossDomain' in c))) {
      _$jscoverage['/io/base.js'].lineData[77]++;
      c.crossDomain = !c.uri.isSameOriginAs(simulatedLocation);
    }
    _$jscoverage['/io/base.js'].lineData[80]++;
    type = c.type = type.toUpperCase();
    _$jscoverage['/io/base.js'].lineData[81]++;
    c.hasContent = !rnoContent.test(type);
    _$jscoverage['/io/base.js'].lineData[83]++;
    if (visit5_83_1(c.processData && visit6_83_2((data = c.data) && visit7_83_3(typeof data !== 'string')))) {
      _$jscoverage['/io/base.js'].lineData[85]++;
      c.data = util.param(data, undefined, undefined, c.serializeArray);
    }
    _$jscoverage['/io/base.js'].lineData[89]++;
    dataType = c.dataType = util.trim(visit8_89_1(dataType || '*')).split(rspace);
    _$jscoverage['/io/base.js'].lineData[91]++;
    if (visit9_91_1(!('cache' in c) && util.inArray(dataType[0], ['script', 'jsonp']))) {
      _$jscoverage['/io/base.js'].lineData[92]++;
      c.cache = false;
    }
    _$jscoverage['/io/base.js'].lineData[95]++;
    if (visit10_95_1(!c.hasContent)) {
      _$jscoverage['/io/base.js'].lineData[96]++;
      if (visit11_96_1(c.data)) {
        _$jscoverage['/io/base.js'].lineData[97]++;
        uri.query.add(util.unparam(c.data));
      }
      _$jscoverage['/io/base.js'].lineData[99]++;
      if (visit12_99_1(c.cache === false)) {
        _$jscoverage['/io/base.js'].lineData[100]++;
        uri.query.set('_ksTS', (util.now() + '_' + util.guid()));
      }
    }
    _$jscoverage['/io/base.js'].lineData[103]++;
    return c;
  }
  _$jscoverage['/io/base.js'].lineData[278]++;
  function IO(c) {
    _$jscoverage['/io/base.js'].functionData[3]++;
    _$jscoverage['/io/base.js'].lineData[279]++;
    var self = this;
    _$jscoverage['/io/base.js'].lineData[281]++;
    if (visit13_281_1(!(self instanceof IO))) {
      _$jscoverage['/io/base.js'].lineData[282]++;
      return new IO(c);
    }
    _$jscoverage['/io/base.js'].lineData[286]++;
    IO.superclass.constructor.call(self);
    _$jscoverage['/io/base.js'].lineData[287]++;
    Promise.Defer(self);
    _$jscoverage['/io/base.js'].lineData[289]++;
    self.userConfig = c;
    _$jscoverage['/io/base.js'].lineData[291]++;
    c = setUpConfig(c);
    _$jscoverage['/io/base.js'].lineData[293]++;
    util.mix(self, {
  responseData: null, 
  config: visit14_302_1(c || {}), 
  timeoutTimer: null, 
  responseText: null, 
  responseXML: null, 
  responseHeadersString: '', 
  responseHeaders: null, 
  requestHeaders: {}, 
  readyState: 0, 
  state: 0, 
  statusText: null, 
  status: 0, 
  transport: null});
    _$jscoverage['/io/base.js'].lineData[344]++;
    var TransportConstructor, transport;
    _$jscoverage['/io/base.js'].lineData[355]++;
    IO.fire('start', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[361]++;
    TransportConstructor = visit15_361_1(transports[c.dataType[0]] || transports['*']);
    _$jscoverage['/io/base.js'].lineData[362]++;
    transport = new TransportConstructor(self);
    _$jscoverage['/io/base.js'].lineData[364]++;
    self.transport = transport;
    _$jscoverage['/io/base.js'].lineData[366]++;
    if (visit16_366_1(c.contentType)) {
      _$jscoverage['/io/base.js'].lineData[367]++;
      self.setRequestHeader('Content-Type', c.contentType);
    }
    _$jscoverage['/io/base.js'].lineData[370]++;
    var dataType = c.dataType[0], i, timeout = c.timeout, context = c.context, headers = c.headers, accepts = c.accepts;
    _$jscoverage['/io/base.js'].lineData[378]++;
    self.setRequestHeader('Accept', visit17_380_1(dataType && accepts[dataType]) ? accepts[dataType] + (visit18_381_1(dataType === '*') ? '' : ', */*; q=0.01') : accepts['*']);
    _$jscoverage['/io/base.js'].lineData[386]++;
    for (i in headers) {
      _$jscoverage['/io/base.js'].lineData[387]++;
      self.setRequestHeader(i, headers[i]);
    }
    _$jscoverage['/io/base.js'].lineData[392]++;
    if (visit19_392_1(c.beforeSend && (visit20_392_2(c.beforeSend.call(context, self, c) === false)))) {
      _$jscoverage['/io/base.js'].lineData[393]++;
      return self;
    }
    _$jscoverage['/io/base.js'].lineData[396]++;
    self.readyState = 1;
    _$jscoverage['/io/base.js'].lineData[407]++;
    IO.fire('send', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[414]++;
    if (visit21_414_1(c.async && visit22_414_2(timeout > 0))) {
      _$jscoverage['/io/base.js'].lineData[415]++;
      self.timeoutTimer = setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[4]++;
  _$jscoverage['/io/base.js'].lineData[416]++;
  self.abort('timeout');
}, timeout * 1000);
    }
    _$jscoverage['/io/base.js'].lineData[420]++;
    try {
      _$jscoverage['/io/base.js'].lineData[422]++;
      self.state = 1;
      _$jscoverage['/io/base.js'].lineData[423]++;
      transport.send();
    }    catch (e) {
  _$jscoverage['/io/base.js'].lineData[426]++;
  if (visit23_426_1(self.state < 2)) {
    _$jscoverage['/io/base.js'].lineData[427]++;
    S.log(visit24_427_1(e.stack || e), 'error');
    _$jscoverage['/io/base.js'].lineData[428]++;
    setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[5]++;
  _$jscoverage['/io/base.js'].lineData[429]++;
  throw e;
}, 0);
    _$jscoverage['/io/base.js'].lineData[431]++;
    self._ioReady(0 - 1, e.message);
  } else {
    _$jscoverage['/io/base.js'].lineData[434]++;
    S.error(e);
  }
}
    _$jscoverage['/io/base.js'].lineData[438]++;
    return self;
  }
  _$jscoverage['/io/base.js'].lineData[441]++;
  util.mix(IO, CustomEvent.Target);
  _$jscoverage['/io/base.js'].lineData[443]++;
  util.mix(IO, {
  isLocal: isLocal, 
  setupConfig: function(setting) {
  _$jscoverage['/io/base.js'].functionData[6]++;
  _$jscoverage['/io/base.js'].lineData[459]++;
  util.mix(defaultConfig, setting, {
  deep: true});
}, 
  setupTransport: function(name, fn) {
  _$jscoverage['/io/base.js'].functionData[7]++;
  _$jscoverage['/io/base.js'].lineData[469]++;
  transports[name] = fn;
}, 
  getTransport: function(name) {
  _$jscoverage['/io/base.js'].functionData[8]++;
  _$jscoverage['/io/base.js'].lineData[477]++;
  return transports[name];
}, 
  getConfig: function() {
  _$jscoverage['/io/base.js'].functionData[9]++;
  _$jscoverage['/io/base.js'].lineData[486]++;
  return defaultConfig;
}});
  _$jscoverage['/io/base.js'].lineData[490]++;
  return IO;
});
