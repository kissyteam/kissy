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
  _$jscoverage['/io/base.js'].lineData[11] = 0;
  _$jscoverage['/io/base.js'].lineData[15] = 0;
  _$jscoverage['/io/base.js'].lineData[56] = 0;
  _$jscoverage['/io/base.js'].lineData[58] = 0;
  _$jscoverage['/io/base.js'].lineData[61] = 0;
  _$jscoverage['/io/base.js'].lineData[62] = 0;
  _$jscoverage['/io/base.js'].lineData[63] = 0;
  _$jscoverage['/io/base.js'].lineData[66] = 0;
  _$jscoverage['/io/base.js'].lineData[68] = 0;
  _$jscoverage['/io/base.js'].lineData[72] = 0;
  _$jscoverage['/io/base.js'].lineData[75] = 0;
  _$jscoverage['/io/base.js'].lineData[77] = 0;
  _$jscoverage['/io/base.js'].lineData[78] = 0;
  _$jscoverage['/io/base.js'].lineData[81] = 0;
  _$jscoverage['/io/base.js'].lineData[82] = 0;
  _$jscoverage['/io/base.js'].lineData[84] = 0;
  _$jscoverage['/io/base.js'].lineData[86] = 0;
  _$jscoverage['/io/base.js'].lineData[90] = 0;
  _$jscoverage['/io/base.js'].lineData[92] = 0;
  _$jscoverage['/io/base.js'].lineData[93] = 0;
  _$jscoverage['/io/base.js'].lineData[96] = 0;
  _$jscoverage['/io/base.js'].lineData[97] = 0;
  _$jscoverage['/io/base.js'].lineData[98] = 0;
  _$jscoverage['/io/base.js'].lineData[100] = 0;
  _$jscoverage['/io/base.js'].lineData[101] = 0;
  _$jscoverage['/io/base.js'].lineData[104] = 0;
  _$jscoverage['/io/base.js'].lineData[279] = 0;
  _$jscoverage['/io/base.js'].lineData[281] = 0;
  _$jscoverage['/io/base.js'].lineData[283] = 0;
  _$jscoverage['/io/base.js'].lineData[284] = 0;
  _$jscoverage['/io/base.js'].lineData[287] = 0;
  _$jscoverage['/io/base.js'].lineData[289] = 0;
  _$jscoverage['/io/base.js'].lineData[291] = 0;
  _$jscoverage['/io/base.js'].lineData[342] = 0;
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
  _$jscoverage['/io/base.js'].lineData[393] = 0;
  _$jscoverage['/io/base.js'].lineData[394] = 0;
  _$jscoverage['/io/base.js'].lineData[397] = 0;
  _$jscoverage['/io/base.js'].lineData[408] = 0;
  _$jscoverage['/io/base.js'].lineData[415] = 0;
  _$jscoverage['/io/base.js'].lineData[416] = 0;
  _$jscoverage['/io/base.js'].lineData[417] = 0;
  _$jscoverage['/io/base.js'].lineData[421] = 0;
  _$jscoverage['/io/base.js'].lineData[423] = 0;
  _$jscoverage['/io/base.js'].lineData[424] = 0;
  _$jscoverage['/io/base.js'].lineData[427] = 0;
  _$jscoverage['/io/base.js'].lineData[428] = 0;
  _$jscoverage['/io/base.js'].lineData[429] = 0;
  _$jscoverage['/io/base.js'].lineData[430] = 0;
  _$jscoverage['/io/base.js'].lineData[432] = 0;
  _$jscoverage['/io/base.js'].lineData[435] = 0;
  _$jscoverage['/io/base.js'].lineData[439] = 0;
  _$jscoverage['/io/base.js'].lineData[442] = 0;
  _$jscoverage['/io/base.js'].lineData[444] = 0;
  _$jscoverage['/io/base.js'].lineData[460] = 0;
  _$jscoverage['/io/base.js'].lineData[470] = 0;
  _$jscoverage['/io/base.js'].lineData[478] = 0;
  _$jscoverage['/io/base.js'].lineData[487] = 0;
  _$jscoverage['/io/base.js'].lineData[491] = 0;
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
  _$jscoverage['/io/base.js'].branchData['19'] = [];
  _$jscoverage['/io/base.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['23'] = [];
  _$jscoverage['/io/base.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['66'] = [];
  _$jscoverage['/io/base.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['77'] = [];
  _$jscoverage['/io/base.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['84'] = [];
  _$jscoverage['/io/base.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['84'][3] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['90'] = [];
  _$jscoverage['/io/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['92'] = [];
  _$jscoverage['/io/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['96'] = [];
  _$jscoverage['/io/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['97'] = [];
  _$jscoverage['/io/base.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['100'] = [];
  _$jscoverage['/io/base.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['283'] = [];
  _$jscoverage['/io/base.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['300'] = [];
  _$jscoverage['/io/base.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['361'] = [];
  _$jscoverage['/io/base.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['366'] = [];
  _$jscoverage['/io/base.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['380'] = [];
  _$jscoverage['/io/base.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['381'] = [];
  _$jscoverage['/io/base.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['393'] = [];
  _$jscoverage['/io/base.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['393'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['415'] = [];
  _$jscoverage['/io/base.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['415'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['427'] = [];
  _$jscoverage['/io/base.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['428'] = [];
  _$jscoverage['/io/base.js'].branchData['428'][1] = new BranchData();
}
_$jscoverage['/io/base.js'].branchData['428'][1].init(23, 12, 'e.stack || e');
function visit24_428_1(result) {
  _$jscoverage['/io/base.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['427'][1].init(73, 14, 'self.state < 2');
function visit23_427_1(result) {
  _$jscoverage['/io/base.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['415'][2].init(3494, 11, 'timeout > 0');
function visit22_415_2(result) {
  _$jscoverage['/io/base.js'].branchData['415'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['415'][1].init(3483, 22, 'c.async && timeout > 0');
function visit21_415_1(result) {
  _$jscoverage['/io/base.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['393'][2].init(2998, 45, 'c.beforeSend.call(context, self, c) === false');
function visit20_393_2(result) {
  _$jscoverage['/io/base.js'].branchData['393'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['393'][1].init(2980, 64, 'c.beforeSend && (c.beforeSend.call(context, self, c) === false)');
function visit19_393_1(result) {
  _$jscoverage['/io/base.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['381'][1].init(70, 16, 'dataType === \'*\'');
function visit18_381_1(result) {
  _$jscoverage['/io/base.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['380'][1].init(56, 29, 'dataType && accepts[dataType]');
function visit17_380_1(result) {
  _$jscoverage['/io/base.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['366'][1].init(2143, 13, 'c.contentType');
function visit16_366_1(result) {
  _$jscoverage['/io/base.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['361'][1].init(1995, 44, 'transports[c.dataType[0]] || transports[\'*\']');
function visit15_361_1(result) {
  _$jscoverage['/io/base.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['300'][1].init(251, 7, 'c || {}');
function visit14_300_1(result) {
  _$jscoverage['/io/base.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['283'][1].init(40, 21, '!(self instanceof IO)');
function visit13_283_1(result) {
  _$jscoverage['/io/base.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['100'][1].init(107, 17, 'c.cache === false');
function visit12_100_1(result) {
  _$jscoverage['/io/base.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['97'][1].init(17, 6, 'c.data');
function visit11_97_1(result) {
  _$jscoverage['/io/base.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['96'][1].init(1071, 13, '!c.hasContent');
function visit10_96_1(result) {
  _$jscoverage['/io/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['92'][1].init(953, 62, '!(\'cache\' in c) && S.inArray(dataType[0], [\'script\', \'jsonp\'])');
function visit9_92_1(result) {
  _$jscoverage['/io/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['90'][1].init(908, 15, 'dataType || \'*\'');
function visit8_90_1(result) {
  _$jscoverage['/io/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['84'][3].init(682, 23, 'typeof data != \'string\'');
function visit7_84_3(result) {
  _$jscoverage['/io/base.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['84'][2].init(664, 41, '(data = c.data) && typeof data != \'string\'');
function visit6_84_2(result) {
  _$jscoverage['/io/base.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['84'][1].init(646, 59, 'c.processData && (data = c.data) && typeof data != \'string\'');
function visit5_84_1(result) {
  _$jscoverage['/io/base.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['77'][1].init(436, 21, '!(\'crossDomain\' in c)');
function visit4_77_1(result) {
  _$jscoverage['/io/base.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['66'][1].init(200, 12, 'context || c');
function visit3_66_1(result) {
  _$jscoverage['/io/base.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['23'][1].init(431, 71, 'simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())');
function visit2_23_1(result) {
  _$jscoverage['/io/base.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['19'][1].init(292, 18, 'win.location || {}');
function visit1_19_1(result) {
  _$jscoverage['/io/base.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/io/base.js'].functionData[0]++;
  _$jscoverage['/io/base.js'].lineData[7]++;
  var module = this, undefined = undefined, CustomEvent = module.require('event/custom'), Promise = module.require('promise');
  _$jscoverage['/io/base.js'].lineData[11]++;
  var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/, rspace = /\s+/, mirror = function(s) {
  _$jscoverage['/io/base.js'].functionData[1]++;
  _$jscoverage['/io/base.js'].lineData[15]++;
  return s;
}, rnoContent = /^(?:GET|HEAD)$/, win = S.Env.host, location = visit1_19_1(win.location || {}), simulatedLocation = new S.Uri(location.href), isLocal = visit2_23_1(simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())), transports = {}, defaultConfig = {
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
  _$jscoverage['/io/base.js'].lineData[56]++;
  defaultConfig.converters.html = defaultConfig.converters.text;
  _$jscoverage['/io/base.js'].lineData[58]++;
  function setUpConfig(c) {
    _$jscoverage['/io/base.js'].functionData[2]++;
    _$jscoverage['/io/base.js'].lineData[61]++;
    var context = c.context;
    _$jscoverage['/io/base.js'].lineData[62]++;
    delete c.context;
    _$jscoverage['/io/base.js'].lineData[63]++;
    c = S.mix(S.clone(defaultConfig), c, {
  deep: true});
    _$jscoverage['/io/base.js'].lineData[66]++;
    c.context = visit3_66_1(context || c);
    _$jscoverage['/io/base.js'].lineData[68]++;
    var data, uri, type = c.type, dataType = c.dataType;
    _$jscoverage['/io/base.js'].lineData[72]++;
    uri = c.uri = simulatedLocation.resolve(c.url);
    _$jscoverage['/io/base.js'].lineData[75]++;
    c.uri.setQuery('');
    _$jscoverage['/io/base.js'].lineData[77]++;
    if (visit4_77_1(!('crossDomain' in c))) {
      _$jscoverage['/io/base.js'].lineData[78]++;
      c.crossDomain = !c.uri.isSameOriginAs(simulatedLocation);
    }
    _$jscoverage['/io/base.js'].lineData[81]++;
    type = c.type = type.toUpperCase();
    _$jscoverage['/io/base.js'].lineData[82]++;
    c.hasContent = !rnoContent.test(type);
    _$jscoverage['/io/base.js'].lineData[84]++;
    if (visit5_84_1(c.processData && visit6_84_2((data = c.data) && visit7_84_3(typeof data != 'string')))) {
      _$jscoverage['/io/base.js'].lineData[86]++;
      c.data = S.param(data, undefined, undefined, c.serializeArray);
    }
    _$jscoverage['/io/base.js'].lineData[90]++;
    dataType = c.dataType = S.trim(visit8_90_1(dataType || '*')).split(rspace);
    _$jscoverage['/io/base.js'].lineData[92]++;
    if (visit9_92_1(!('cache' in c) && S.inArray(dataType[0], ['script', 'jsonp']))) {
      _$jscoverage['/io/base.js'].lineData[93]++;
      c.cache = false;
    }
    _$jscoverage['/io/base.js'].lineData[96]++;
    if (visit10_96_1(!c.hasContent)) {
      _$jscoverage['/io/base.js'].lineData[97]++;
      if (visit11_97_1(c.data)) {
        _$jscoverage['/io/base.js'].lineData[98]++;
        uri.query.add(S.unparam(c.data));
      }
      _$jscoverage['/io/base.js'].lineData[100]++;
      if (visit12_100_1(c.cache === false)) {
        _$jscoverage['/io/base.js'].lineData[101]++;
        uri.query.set('_ksTS', (S.now() + '_' + S.guid()));
      }
    }
    _$jscoverage['/io/base.js'].lineData[104]++;
    return c;
  }
  _$jscoverage['/io/base.js'].lineData[279]++;
  function IO(c) {
    _$jscoverage['/io/base.js'].functionData[3]++;
    _$jscoverage['/io/base.js'].lineData[281]++;
    var self = this;
    _$jscoverage['/io/base.js'].lineData[283]++;
    if (visit13_283_1(!(self instanceof IO))) {
      _$jscoverage['/io/base.js'].lineData[284]++;
      return new IO(c);
    }
    _$jscoverage['/io/base.js'].lineData[287]++;
    Promise.call(self);
    _$jscoverage['/io/base.js'].lineData[289]++;
    c = setUpConfig(c);
    _$jscoverage['/io/base.js'].lineData[291]++;
    S.mix(self, {
  responseData: null, 
  config: visit14_300_1(c || {}), 
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
    _$jscoverage['/io/base.js'].lineData[342]++;
    Promise.Defer(self);
    _$jscoverage['/io/base.js'].lineData[344]++;
    var transportConstructor, transport;
    _$jscoverage['/io/base.js'].lineData[355]++;
    IO.fire('start', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[361]++;
    transportConstructor = visit15_361_1(transports[c.dataType[0]] || transports['*']);
    _$jscoverage['/io/base.js'].lineData[362]++;
    transport = new transportConstructor(self);
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
    _$jscoverage['/io/base.js'].lineData[393]++;
    if (visit19_393_1(c.beforeSend && (visit20_393_2(c.beforeSend.call(context, self, c) === false)))) {
      _$jscoverage['/io/base.js'].lineData[394]++;
      return self;
    }
    _$jscoverage['/io/base.js'].lineData[397]++;
    self.readyState = 1;
    _$jscoverage['/io/base.js'].lineData[408]++;
    IO.fire('send', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[415]++;
    if (visit21_415_1(c.async && visit22_415_2(timeout > 0))) {
      _$jscoverage['/io/base.js'].lineData[416]++;
      self.timeoutTimer = setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[4]++;
  _$jscoverage['/io/base.js'].lineData[417]++;
  self.abort('timeout');
}, timeout * 1000);
    }
    _$jscoverage['/io/base.js'].lineData[421]++;
    try {
      _$jscoverage['/io/base.js'].lineData[423]++;
      self.state = 1;
      _$jscoverage['/io/base.js'].lineData[424]++;
      transport.send();
    }    catch (e) {
  _$jscoverage['/io/base.js'].lineData[427]++;
  if (visit23_427_1(self.state < 2)) {
    _$jscoverage['/io/base.js'].lineData[428]++;
    S.log(visit24_428_1(e.stack || e), 'error');
    _$jscoverage['/io/base.js'].lineData[429]++;
    setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[5]++;
  _$jscoverage['/io/base.js'].lineData[430]++;
  throw e;
}, 0);
    _$jscoverage['/io/base.js'].lineData[432]++;
    self._ioReady(-1, e.message);
  } else {
    _$jscoverage['/io/base.js'].lineData[435]++;
    S.error(e);
  }
}
    _$jscoverage['/io/base.js'].lineData[439]++;
    return self;
  }
  _$jscoverage['/io/base.js'].lineData[442]++;
  S.mix(IO, CustomEvent.Target);
  _$jscoverage['/io/base.js'].lineData[444]++;
  S.mix(IO, {
  isLocal: isLocal, 
  setupConfig: function(setting) {
  _$jscoverage['/io/base.js'].functionData[6]++;
  _$jscoverage['/io/base.js'].lineData[460]++;
  S.mix(defaultConfig, setting, {
  deep: true});
}, 
  'setupTransport': function(name, fn) {
  _$jscoverage['/io/base.js'].functionData[7]++;
  _$jscoverage['/io/base.js'].lineData[470]++;
  transports[name] = fn;
}, 
  'getTransport': function(name) {
  _$jscoverage['/io/base.js'].functionData[8]++;
  _$jscoverage['/io/base.js'].lineData[478]++;
  return transports[name];
}, 
  getConfig: function() {
  _$jscoverage['/io/base.js'].functionData[9]++;
  _$jscoverage['/io/base.js'].lineData[487]++;
  return defaultConfig;
}});
  _$jscoverage['/io/base.js'].lineData[491]++;
  return IO;
});
