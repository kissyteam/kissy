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
  _$jscoverage['/io/base.js'].lineData[10] = 0;
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
  _$jscoverage['/io/base.js'].lineData[285] = 0;
  _$jscoverage['/io/base.js'].lineData[287] = 0;
  _$jscoverage['/io/base.js'].lineData[289] = 0;
  _$jscoverage['/io/base.js'].lineData[340] = 0;
  _$jscoverage['/io/base.js'].lineData[342] = 0;
  _$jscoverage['/io/base.js'].lineData[353] = 0;
  _$jscoverage['/io/base.js'].lineData[359] = 0;
  _$jscoverage['/io/base.js'].lineData[360] = 0;
  _$jscoverage['/io/base.js'].lineData[362] = 0;
  _$jscoverage['/io/base.js'].lineData[364] = 0;
  _$jscoverage['/io/base.js'].lineData[365] = 0;
  _$jscoverage['/io/base.js'].lineData[368] = 0;
  _$jscoverage['/io/base.js'].lineData[376] = 0;
  _$jscoverage['/io/base.js'].lineData[384] = 0;
  _$jscoverage['/io/base.js'].lineData[385] = 0;
  _$jscoverage['/io/base.js'].lineData[391] = 0;
  _$jscoverage['/io/base.js'].lineData[392] = 0;
  _$jscoverage['/io/base.js'].lineData[395] = 0;
  _$jscoverage['/io/base.js'].lineData[406] = 0;
  _$jscoverage['/io/base.js'].lineData[413] = 0;
  _$jscoverage['/io/base.js'].lineData[414] = 0;
  _$jscoverage['/io/base.js'].lineData[415] = 0;
  _$jscoverage['/io/base.js'].lineData[419] = 0;
  _$jscoverage['/io/base.js'].lineData[421] = 0;
  _$jscoverage['/io/base.js'].lineData[422] = 0;
  _$jscoverage['/io/base.js'].lineData[425] = 0;
  _$jscoverage['/io/base.js'].lineData[426] = 0;
  _$jscoverage['/io/base.js'].lineData[427] = 0;
  _$jscoverage['/io/base.js'].lineData[428] = 0;
  _$jscoverage['/io/base.js'].lineData[430] = 0;
  _$jscoverage['/io/base.js'].lineData[433] = 0;
  _$jscoverage['/io/base.js'].lineData[437] = 0;
  _$jscoverage['/io/base.js'].lineData[440] = 0;
  _$jscoverage['/io/base.js'].lineData[442] = 0;
  _$jscoverage['/io/base.js'].lineData[458] = 0;
  _$jscoverage['/io/base.js'].lineData[468] = 0;
  _$jscoverage['/io/base.js'].lineData[476] = 0;
  _$jscoverage['/io/base.js'].lineData[485] = 0;
  _$jscoverage['/io/base.js'].lineData[489] = 0;
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
  _$jscoverage['/io/base.js'].branchData['298'] = [];
  _$jscoverage['/io/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['359'] = [];
  _$jscoverage['/io/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['364'] = [];
  _$jscoverage['/io/base.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['378'] = [];
  _$jscoverage['/io/base.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['379'] = [];
  _$jscoverage['/io/base.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['391'] = [];
  _$jscoverage['/io/base.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['391'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['413'] = [];
  _$jscoverage['/io/base.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['413'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['425'] = [];
  _$jscoverage['/io/base.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['426'] = [];
  _$jscoverage['/io/base.js'].branchData['426'][1] = new BranchData();
}
_$jscoverage['/io/base.js'].branchData['426'][1].init(23, 12, 'e.stack || e');
function visit24_426_1(result) {
  _$jscoverage['/io/base.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['425'][1].init(73, 14, 'self.state < 2');
function visit23_425_1(result) {
  _$jscoverage['/io/base.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['413'][2].init(3493, 11, 'timeout > 0');
function visit22_413_2(result) {
  _$jscoverage['/io/base.js'].branchData['413'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['413'][1].init(3482, 22, 'c.async && timeout > 0');
function visit21_413_1(result) {
  _$jscoverage['/io/base.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['391'][2].init(2997, 45, 'c.beforeSend.call(context, self, c) === false');
function visit20_391_2(result) {
  _$jscoverage['/io/base.js'].branchData['391'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['391'][1].init(2979, 64, 'c.beforeSend && (c.beforeSend.call(context, self, c) === false)');
function visit19_391_1(result) {
  _$jscoverage['/io/base.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['379'][1].init(70, 16, 'dataType === \'*\'');
function visit18_379_1(result) {
  _$jscoverage['/io/base.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['378'][1].init(56, 29, 'dataType && accepts[dataType]');
function visit17_378_1(result) {
  _$jscoverage['/io/base.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['364'][1].init(2142, 13, 'c.contentType');
function visit16_364_1(result) {
  _$jscoverage['/io/base.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['359'][1].init(1994, 44, 'transports[c.dataType[0]] || transports[\'*\']');
function visit15_359_1(result) {
  _$jscoverage['/io/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['298'][1].init(251, 7, 'c || {}');
function visit14_298_1(result) {
  _$jscoverage['/io/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['281'][1].init(39, 21, '!(self instanceof IO)');
function visit13_281_1(result) {
  _$jscoverage['/io/base.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['99'][1].init(107, 17, 'c.cache === false');
function visit12_99_1(result) {
  _$jscoverage['/io/base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['96'][1].init(17, 6, 'c.data');
function visit11_96_1(result) {
  _$jscoverage['/io/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['95'][1].init(1071, 13, '!c.hasContent');
function visit10_95_1(result) {
  _$jscoverage['/io/base.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['91'][1].init(953, 62, '!(\'cache\' in c) && S.inArray(dataType[0], [\'script\', \'jsonp\'])');
function visit9_91_1(result) {
  _$jscoverage['/io/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['89'][1].init(908, 15, 'dataType || \'*\'');
function visit8_89_1(result) {
  _$jscoverage['/io/base.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['83'][3].init(682, 23, 'typeof data != \'string\'');
function visit7_83_3(result) {
  _$jscoverage['/io/base.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['83'][2].init(664, 41, '(data = c.data) && typeof data != \'string\'');
function visit6_83_2(result) {
  _$jscoverage['/io/base.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['83'][1].init(646, 59, 'c.processData && (data = c.data) && typeof data != \'string\'');
function visit5_83_1(result) {
  _$jscoverage['/io/base.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['76'][1].init(436, 21, '!(\'crossDomain\' in c)');
function visit4_76_1(result) {
  _$jscoverage['/io/base.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['65'][1].init(200, 12, 'context || c');
function visit3_65_1(result) {
  _$jscoverage['/io/base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['22'][1].init(431, 71, 'simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())');
function visit2_22_1(result) {
  _$jscoverage['/io/base.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['18'][1].init(292, 18, 'win.location || {}');
function visit1_18_1(result) {
  _$jscoverage['/io/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/base.js'].functionData[0]++;
  _$jscoverage['/io/base.js'].lineData[7]++;
  var undefined = undefined, CustomEvent = require('event/custom'), Promise = require('promise');
  _$jscoverage['/io/base.js'].lineData[10]++;
  var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/, rspace = /\s+/, mirror = function(s) {
  _$jscoverage['/io/base.js'].functionData[1]++;
  _$jscoverage['/io/base.js'].lineData[14]++;
  return s;
}, rnoContent = /^(?:GET|HEAD)$/, win = S.Env.host, location = visit1_18_1(win.location || {}), simulatedLocation = new S.Uri(location.href), isLocal = visit2_22_1(simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())), transports = {}, defaultConfig = {
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
  json: S.parseJson, 
  html: mirror, 
  text: mirror, 
  xml: S.parseXML}}, 
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
    c = S.mix(S.clone(defaultConfig), c, {
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
    if (visit5_83_1(c.processData && visit6_83_2((data = c.data) && visit7_83_3(typeof data != 'string')))) {
      _$jscoverage['/io/base.js'].lineData[85]++;
      c.data = S.param(data, undefined, undefined, c.serializeArray);
    }
    _$jscoverage['/io/base.js'].lineData[89]++;
    dataType = c.dataType = S.trim(visit8_89_1(dataType || '*')).split(rspace);
    _$jscoverage['/io/base.js'].lineData[91]++;
    if (visit9_91_1(!('cache' in c) && S.inArray(dataType[0], ['script', 'jsonp']))) {
      _$jscoverage['/io/base.js'].lineData[92]++;
      c.cache = false;
    }
    _$jscoverage['/io/base.js'].lineData[95]++;
    if (visit10_95_1(!c.hasContent)) {
      _$jscoverage['/io/base.js'].lineData[96]++;
      if (visit11_96_1(c.data)) {
        _$jscoverage['/io/base.js'].lineData[97]++;
        uri.query.add(S.unparam(c.data));
      }
      _$jscoverage['/io/base.js'].lineData[99]++;
      if (visit12_99_1(c.cache === false)) {
        _$jscoverage['/io/base.js'].lineData[100]++;
        uri.query.set('_ksTS', (S.now() + '_' + S.guid()));
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
    _$jscoverage['/io/base.js'].lineData[285]++;
    Promise.call(self);
    _$jscoverage['/io/base.js'].lineData[287]++;
    c = setUpConfig(c);
    _$jscoverage['/io/base.js'].lineData[289]++;
    S.mix(self, {
  responseData: null, 
  config: visit14_298_1(c || {}), 
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
    _$jscoverage['/io/base.js'].lineData[340]++;
    Promise.Defer(self);
    _$jscoverage['/io/base.js'].lineData[342]++;
    var transportConstructor, transport;
    _$jscoverage['/io/base.js'].lineData[353]++;
    IO.fire('start', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[359]++;
    transportConstructor = visit15_359_1(transports[c.dataType[0]] || transports['*']);
    _$jscoverage['/io/base.js'].lineData[360]++;
    transport = new transportConstructor(self);
    _$jscoverage['/io/base.js'].lineData[362]++;
    self.transport = transport;
    _$jscoverage['/io/base.js'].lineData[364]++;
    if (visit16_364_1(c.contentType)) {
      _$jscoverage['/io/base.js'].lineData[365]++;
      self.setRequestHeader('Content-Type', c.contentType);
    }
    _$jscoverage['/io/base.js'].lineData[368]++;
    var dataType = c.dataType[0], i, timeout = c.timeout, context = c.context, headers = c.headers, accepts = c.accepts;
    _$jscoverage['/io/base.js'].lineData[376]++;
    self.setRequestHeader('Accept', visit17_378_1(dataType && accepts[dataType]) ? accepts[dataType] + (visit18_379_1(dataType === '*') ? '' : ', */*; q=0.01') : accepts['*']);
    _$jscoverage['/io/base.js'].lineData[384]++;
    for (i in headers) {
      _$jscoverage['/io/base.js'].lineData[385]++;
      self.setRequestHeader(i, headers[i]);
    }
    _$jscoverage['/io/base.js'].lineData[391]++;
    if (visit19_391_1(c.beforeSend && (visit20_391_2(c.beforeSend.call(context, self, c) === false)))) {
      _$jscoverage['/io/base.js'].lineData[392]++;
      return self;
    }
    _$jscoverage['/io/base.js'].lineData[395]++;
    self.readyState = 1;
    _$jscoverage['/io/base.js'].lineData[406]++;
    IO.fire('send', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[413]++;
    if (visit21_413_1(c.async && visit22_413_2(timeout > 0))) {
      _$jscoverage['/io/base.js'].lineData[414]++;
      self.timeoutTimer = setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[4]++;
  _$jscoverage['/io/base.js'].lineData[415]++;
  self.abort('timeout');
}, timeout * 1000);
    }
    _$jscoverage['/io/base.js'].lineData[419]++;
    try {
      _$jscoverage['/io/base.js'].lineData[421]++;
      self.state = 1;
      _$jscoverage['/io/base.js'].lineData[422]++;
      transport.send();
    }    catch (e) {
  _$jscoverage['/io/base.js'].lineData[425]++;
  if (visit23_425_1(self.state < 2)) {
    _$jscoverage['/io/base.js'].lineData[426]++;
    S.log(visit24_426_1(e.stack || e), 'error');
    _$jscoverage['/io/base.js'].lineData[427]++;
    setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[5]++;
  _$jscoverage['/io/base.js'].lineData[428]++;
  throw e;
}, 0);
    _$jscoverage['/io/base.js'].lineData[430]++;
    self._ioReady(-1, e.message);
  } else {
    _$jscoverage['/io/base.js'].lineData[433]++;
    S.error(e);
  }
}
    _$jscoverage['/io/base.js'].lineData[437]++;
    return self;
  }
  _$jscoverage['/io/base.js'].lineData[440]++;
  S.mix(IO, CustomEvent.Target);
  _$jscoverage['/io/base.js'].lineData[442]++;
  S.mix(IO, {
  isLocal: isLocal, 
  setupConfig: function(setting) {
  _$jscoverage['/io/base.js'].functionData[6]++;
  _$jscoverage['/io/base.js'].lineData[458]++;
  S.mix(defaultConfig, setting, {
  deep: true});
}, 
  'setupTransport': function(name, fn) {
  _$jscoverage['/io/base.js'].functionData[7]++;
  _$jscoverage['/io/base.js'].lineData[468]++;
  transports[name] = fn;
}, 
  'getTransport': function(name) {
  _$jscoverage['/io/base.js'].functionData[8]++;
  _$jscoverage['/io/base.js'].lineData[476]++;
  return transports[name];
}, 
  getConfig: function() {
  _$jscoverage['/io/base.js'].functionData[9]++;
  _$jscoverage['/io/base.js'].lineData[485]++;
  return defaultConfig;
}});
  _$jscoverage['/io/base.js'].lineData[489]++;
  return IO;
});
