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
  _$jscoverage['/io/base.js'].lineData[13] = 0;
  _$jscoverage['/io/base.js'].lineData[54] = 0;
  _$jscoverage['/io/base.js'].lineData[56] = 0;
  _$jscoverage['/io/base.js'].lineData[59] = 0;
  _$jscoverage['/io/base.js'].lineData[60] = 0;
  _$jscoverage['/io/base.js'].lineData[61] = 0;
  _$jscoverage['/io/base.js'].lineData[64] = 0;
  _$jscoverage['/io/base.js'].lineData[66] = 0;
  _$jscoverage['/io/base.js'].lineData[70] = 0;
  _$jscoverage['/io/base.js'].lineData[73] = 0;
  _$jscoverage['/io/base.js'].lineData[75] = 0;
  _$jscoverage['/io/base.js'].lineData[76] = 0;
  _$jscoverage['/io/base.js'].lineData[79] = 0;
  _$jscoverage['/io/base.js'].lineData[80] = 0;
  _$jscoverage['/io/base.js'].lineData[82] = 0;
  _$jscoverage['/io/base.js'].lineData[84] = 0;
  _$jscoverage['/io/base.js'].lineData[88] = 0;
  _$jscoverage['/io/base.js'].lineData[90] = 0;
  _$jscoverage['/io/base.js'].lineData[91] = 0;
  _$jscoverage['/io/base.js'].lineData[94] = 0;
  _$jscoverage['/io/base.js'].lineData[95] = 0;
  _$jscoverage['/io/base.js'].lineData[96] = 0;
  _$jscoverage['/io/base.js'].lineData[98] = 0;
  _$jscoverage['/io/base.js'].lineData[99] = 0;
  _$jscoverage['/io/base.js'].lineData[102] = 0;
  _$jscoverage['/io/base.js'].lineData[277] = 0;
  _$jscoverage['/io/base.js'].lineData[278] = 0;
  _$jscoverage['/io/base.js'].lineData[280] = 0;
  _$jscoverage['/io/base.js'].lineData[281] = 0;
  _$jscoverage['/io/base.js'].lineData[284] = 0;
  _$jscoverage['/io/base.js'].lineData[286] = 0;
  _$jscoverage['/io/base.js'].lineData[288] = 0;
  _$jscoverage['/io/base.js'].lineData[339] = 0;
  _$jscoverage['/io/base.js'].lineData[341] = 0;
  _$jscoverage['/io/base.js'].lineData[352] = 0;
  _$jscoverage['/io/base.js'].lineData[358] = 0;
  _$jscoverage['/io/base.js'].lineData[359] = 0;
  _$jscoverage['/io/base.js'].lineData[361] = 0;
  _$jscoverage['/io/base.js'].lineData[363] = 0;
  _$jscoverage['/io/base.js'].lineData[364] = 0;
  _$jscoverage['/io/base.js'].lineData[367] = 0;
  _$jscoverage['/io/base.js'].lineData[375] = 0;
  _$jscoverage['/io/base.js'].lineData[383] = 0;
  _$jscoverage['/io/base.js'].lineData[384] = 0;
  _$jscoverage['/io/base.js'].lineData[390] = 0;
  _$jscoverage['/io/base.js'].lineData[391] = 0;
  _$jscoverage['/io/base.js'].lineData[394] = 0;
  _$jscoverage['/io/base.js'].lineData[405] = 0;
  _$jscoverage['/io/base.js'].lineData[412] = 0;
  _$jscoverage['/io/base.js'].lineData[413] = 0;
  _$jscoverage['/io/base.js'].lineData[414] = 0;
  _$jscoverage['/io/base.js'].lineData[418] = 0;
  _$jscoverage['/io/base.js'].lineData[420] = 0;
  _$jscoverage['/io/base.js'].lineData[421] = 0;
  _$jscoverage['/io/base.js'].lineData[424] = 0;
  _$jscoverage['/io/base.js'].lineData[425] = 0;
  _$jscoverage['/io/base.js'].lineData[426] = 0;
  _$jscoverage['/io/base.js'].lineData[427] = 0;
  _$jscoverage['/io/base.js'].lineData[429] = 0;
  _$jscoverage['/io/base.js'].lineData[432] = 0;
  _$jscoverage['/io/base.js'].lineData[436] = 0;
  _$jscoverage['/io/base.js'].lineData[439] = 0;
  _$jscoverage['/io/base.js'].lineData[441] = 0;
  _$jscoverage['/io/base.js'].lineData[457] = 0;
  _$jscoverage['/io/base.js'].lineData[467] = 0;
  _$jscoverage['/io/base.js'].lineData[475] = 0;
  _$jscoverage['/io/base.js'].lineData[484] = 0;
  _$jscoverage['/io/base.js'].lineData[488] = 0;
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
  _$jscoverage['/io/base.js'].branchData['17'] = [];
  _$jscoverage['/io/base.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['21'] = [];
  _$jscoverage['/io/base.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['64'] = [];
  _$jscoverage['/io/base.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['75'] = [];
  _$jscoverage['/io/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['82'] = [];
  _$jscoverage['/io/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['88'] = [];
  _$jscoverage['/io/base.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['90'] = [];
  _$jscoverage['/io/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['94'] = [];
  _$jscoverage['/io/base.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['95'] = [];
  _$jscoverage['/io/base.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['98'] = [];
  _$jscoverage['/io/base.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['280'] = [];
  _$jscoverage['/io/base.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['297'] = [];
  _$jscoverage['/io/base.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['358'] = [];
  _$jscoverage['/io/base.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['363'] = [];
  _$jscoverage['/io/base.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['377'] = [];
  _$jscoverage['/io/base.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['378'] = [];
  _$jscoverage['/io/base.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['390'] = [];
  _$jscoverage['/io/base.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['412'] = [];
  _$jscoverage['/io/base.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['412'][2] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['424'] = [];
  _$jscoverage['/io/base.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/io/base.js'].branchData['425'] = [];
  _$jscoverage['/io/base.js'].branchData['425'][1] = new BranchData();
}
_$jscoverage['/io/base.js'].branchData['425'][1].init(23, 12, 'e.stack || e');
function visit24_425_1(result) {
  _$jscoverage['/io/base.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['424'][1].init(73, 14, 'self.state < 2');
function visit23_424_1(result) {
  _$jscoverage['/io/base.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['412'][2].init(3493, 11, 'timeout > 0');
function visit22_412_2(result) {
  _$jscoverage['/io/base.js'].branchData['412'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['412'][1].init(3482, 22, 'c.async && timeout > 0');
function visit21_412_1(result) {
  _$jscoverage['/io/base.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['390'][2].init(2997, 45, 'c.beforeSend.call(context, self, c) === false');
function visit20_390_2(result) {
  _$jscoverage['/io/base.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['390'][1].init(2979, 64, 'c.beforeSend && (c.beforeSend.call(context, self, c) === false)');
function visit19_390_1(result) {
  _$jscoverage['/io/base.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['378'][1].init(70, 16, 'dataType === \'*\'');
function visit18_378_1(result) {
  _$jscoverage['/io/base.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['377'][1].init(56, 29, 'dataType && accepts[dataType]');
function visit17_377_1(result) {
  _$jscoverage['/io/base.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['363'][1].init(2142, 13, 'c.contentType');
function visit16_363_1(result) {
  _$jscoverage['/io/base.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['358'][1].init(1994, 44, 'transports[c.dataType[0]] || transports[\'*\']');
function visit15_358_1(result) {
  _$jscoverage['/io/base.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['297'][1].init(251, 7, 'c || {}');
function visit14_297_1(result) {
  _$jscoverage['/io/base.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['280'][1].init(39, 21, '!(self instanceof IO)');
function visit13_280_1(result) {
  _$jscoverage['/io/base.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['98'][1].init(107, 17, 'c.cache === false');
function visit12_98_1(result) {
  _$jscoverage['/io/base.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['95'][1].init(17, 6, 'c.data');
function visit11_95_1(result) {
  _$jscoverage['/io/base.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['94'][1].init(1071, 13, '!c.hasContent');
function visit10_94_1(result) {
  _$jscoverage['/io/base.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['90'][1].init(953, 62, '!(\'cache\' in c) && S.inArray(dataType[0], [\'script\', \'jsonp\'])');
function visit9_90_1(result) {
  _$jscoverage['/io/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['88'][1].init(908, 15, 'dataType || \'*\'');
function visit8_88_1(result) {
  _$jscoverage['/io/base.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['82'][3].init(682, 23, 'typeof data != \'string\'');
function visit7_82_3(result) {
  _$jscoverage['/io/base.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['82'][2].init(664, 41, '(data = c.data) && typeof data != \'string\'');
function visit6_82_2(result) {
  _$jscoverage['/io/base.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['82'][1].init(646, 59, 'c.processData && (data = c.data) && typeof data != \'string\'');
function visit5_82_1(result) {
  _$jscoverage['/io/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['75'][1].init(436, 21, '!(\'crossDomain\' in c)');
function visit4_75_1(result) {
  _$jscoverage['/io/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['64'][1].init(200, 12, 'context || c');
function visit3_64_1(result) {
  _$jscoverage['/io/base.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['21'][1].init(390, 71, 'simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())');
function visit2_21_1(result) {
  _$jscoverage['/io/base.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].branchData['17'][1].init(251, 18, 'win.location || {}');
function visit1_17_1(result) {
  _$jscoverage['/io/base.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/base.js'].functionData[0]++;
  _$jscoverage['/io/base.js'].lineData[7]++;
  var undefined = undefined, CustomEvent = require('event/custom'), Promise = require('promise');
  _$jscoverage['/io/base.js'].lineData[10]++;
  var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/, rspace = /\s+/, mirror = function(s) {
  _$jscoverage['/io/base.js'].functionData[1]++;
  _$jscoverage['/io/base.js'].lineData[13]++;
  return s;
}, rnoContent = /^(?:GET|HEAD)$/, win = S.Env.host, location = visit1_17_1(win.location || {}), simulatedLocation = new S.Uri(location.href), isLocal = visit2_21_1(simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme())), transports = {}, defaultConfig = {
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
  _$jscoverage['/io/base.js'].lineData[54]++;
  defaultConfig.converters.html = defaultConfig.converters.text;
  _$jscoverage['/io/base.js'].lineData[56]++;
  function setUpConfig(c) {
    _$jscoverage['/io/base.js'].functionData[2]++;
    _$jscoverage['/io/base.js'].lineData[59]++;
    var context = c.context;
    _$jscoverage['/io/base.js'].lineData[60]++;
    delete c.context;
    _$jscoverage['/io/base.js'].lineData[61]++;
    c = S.mix(S.clone(defaultConfig), c, {
  deep: true});
    _$jscoverage['/io/base.js'].lineData[64]++;
    c.context = visit3_64_1(context || c);
    _$jscoverage['/io/base.js'].lineData[66]++;
    var data, uri, type = c.type, dataType = c.dataType;
    _$jscoverage['/io/base.js'].lineData[70]++;
    uri = c.uri = simulatedLocation.resolve(c.url);
    _$jscoverage['/io/base.js'].lineData[73]++;
    c.uri.setQuery('');
    _$jscoverage['/io/base.js'].lineData[75]++;
    if (visit4_75_1(!('crossDomain' in c))) {
      _$jscoverage['/io/base.js'].lineData[76]++;
      c.crossDomain = !c.uri.isSameOriginAs(simulatedLocation);
    }
    _$jscoverage['/io/base.js'].lineData[79]++;
    type = c.type = type.toUpperCase();
    _$jscoverage['/io/base.js'].lineData[80]++;
    c.hasContent = !rnoContent.test(type);
    _$jscoverage['/io/base.js'].lineData[82]++;
    if (visit5_82_1(c.processData && visit6_82_2((data = c.data) && visit7_82_3(typeof data != 'string')))) {
      _$jscoverage['/io/base.js'].lineData[84]++;
      c.data = S.param(data, undefined, undefined, c.serializeArray);
    }
    _$jscoverage['/io/base.js'].lineData[88]++;
    dataType = c.dataType = S.trim(visit8_88_1(dataType || '*')).split(rspace);
    _$jscoverage['/io/base.js'].lineData[90]++;
    if (visit9_90_1(!('cache' in c) && S.inArray(dataType[0], ['script', 'jsonp']))) {
      _$jscoverage['/io/base.js'].lineData[91]++;
      c.cache = false;
    }
    _$jscoverage['/io/base.js'].lineData[94]++;
    if (visit10_94_1(!c.hasContent)) {
      _$jscoverage['/io/base.js'].lineData[95]++;
      if (visit11_95_1(c.data)) {
        _$jscoverage['/io/base.js'].lineData[96]++;
        uri.query.add(S.unparam(c.data));
      }
      _$jscoverage['/io/base.js'].lineData[98]++;
      if (visit12_98_1(c.cache === false)) {
        _$jscoverage['/io/base.js'].lineData[99]++;
        uri.query.set('_ksTS', (S.now() + '_' + S.guid()));
      }
    }
    _$jscoverage['/io/base.js'].lineData[102]++;
    return c;
  }
  _$jscoverage['/io/base.js'].lineData[277]++;
  function IO(c) {
    _$jscoverage['/io/base.js'].functionData[3]++;
    _$jscoverage['/io/base.js'].lineData[278]++;
    var self = this;
    _$jscoverage['/io/base.js'].lineData[280]++;
    if (visit13_280_1(!(self instanceof IO))) {
      _$jscoverage['/io/base.js'].lineData[281]++;
      return new IO(c);
    }
    _$jscoverage['/io/base.js'].lineData[284]++;
    Promise.call(self);
    _$jscoverage['/io/base.js'].lineData[286]++;
    c = setUpConfig(c);
    _$jscoverage['/io/base.js'].lineData[288]++;
    S.mix(self, {
  responseData: null, 
  config: visit14_297_1(c || {}), 
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
    _$jscoverage['/io/base.js'].lineData[339]++;
    Promise.Defer(self);
    _$jscoverage['/io/base.js'].lineData[341]++;
    var transportConstructor, transport;
    _$jscoverage['/io/base.js'].lineData[352]++;
    IO.fire('start', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[358]++;
    transportConstructor = visit15_358_1(transports[c.dataType[0]] || transports['*']);
    _$jscoverage['/io/base.js'].lineData[359]++;
    transport = new transportConstructor(self);
    _$jscoverage['/io/base.js'].lineData[361]++;
    self.transport = transport;
    _$jscoverage['/io/base.js'].lineData[363]++;
    if (visit16_363_1(c.contentType)) {
      _$jscoverage['/io/base.js'].lineData[364]++;
      self.setRequestHeader('Content-Type', c.contentType);
    }
    _$jscoverage['/io/base.js'].lineData[367]++;
    var dataType = c.dataType[0], i, timeout = c.timeout, context = c.context, headers = c.headers, accepts = c.accepts;
    _$jscoverage['/io/base.js'].lineData[375]++;
    self.setRequestHeader('Accept', visit17_377_1(dataType && accepts[dataType]) ? accepts[dataType] + (visit18_378_1(dataType === '*') ? '' : ', */*; q=0.01') : accepts['*']);
    _$jscoverage['/io/base.js'].lineData[383]++;
    for (i in headers) {
      _$jscoverage['/io/base.js'].lineData[384]++;
      self.setRequestHeader(i, headers[i]);
    }
    _$jscoverage['/io/base.js'].lineData[390]++;
    if (visit19_390_1(c.beforeSend && (visit20_390_2(c.beforeSend.call(context, self, c) === false)))) {
      _$jscoverage['/io/base.js'].lineData[391]++;
      return self;
    }
    _$jscoverage['/io/base.js'].lineData[394]++;
    self.readyState = 1;
    _$jscoverage['/io/base.js'].lineData[405]++;
    IO.fire('send', {
  ajaxConfig: c, 
  io: self});
    _$jscoverage['/io/base.js'].lineData[412]++;
    if (visit21_412_1(c.async && visit22_412_2(timeout > 0))) {
      _$jscoverage['/io/base.js'].lineData[413]++;
      self.timeoutTimer = setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[4]++;
  _$jscoverage['/io/base.js'].lineData[414]++;
  self.abort('timeout');
}, timeout * 1000);
    }
    _$jscoverage['/io/base.js'].lineData[418]++;
    try {
      _$jscoverage['/io/base.js'].lineData[420]++;
      self.state = 1;
      _$jscoverage['/io/base.js'].lineData[421]++;
      transport.send();
    }    catch (e) {
  _$jscoverage['/io/base.js'].lineData[424]++;
  if (visit23_424_1(self.state < 2)) {
    _$jscoverage['/io/base.js'].lineData[425]++;
    S.log(visit24_425_1(e.stack || e), 'error');
    _$jscoverage['/io/base.js'].lineData[426]++;
    setTimeout(function() {
  _$jscoverage['/io/base.js'].functionData[5]++;
  _$jscoverage['/io/base.js'].lineData[427]++;
  throw e;
}, 0);
    _$jscoverage['/io/base.js'].lineData[429]++;
    self._ioReady(-1, e.message);
  } else {
    _$jscoverage['/io/base.js'].lineData[432]++;
    S.error(e);
  }
}
    _$jscoverage['/io/base.js'].lineData[436]++;
    return self;
  }
  _$jscoverage['/io/base.js'].lineData[439]++;
  S.mix(IO, CustomEvent.Target);
  _$jscoverage['/io/base.js'].lineData[441]++;
  S.mix(IO, {
  isLocal: isLocal, 
  setupConfig: function(setting) {
  _$jscoverage['/io/base.js'].functionData[6]++;
  _$jscoverage['/io/base.js'].lineData[457]++;
  S.mix(defaultConfig, setting, {
  deep: true});
}, 
  'setupTransport': function(name, fn) {
  _$jscoverage['/io/base.js'].functionData[7]++;
  _$jscoverage['/io/base.js'].lineData[467]++;
  transports[name] = fn;
}, 
  'getTransport': function(name) {
  _$jscoverage['/io/base.js'].functionData[8]++;
  _$jscoverage['/io/base.js'].lineData[475]++;
  return transports[name];
}, 
  getConfig: function() {
  _$jscoverage['/io/base.js'].functionData[9]++;
  _$jscoverage['/io/base.js'].lineData[484]++;
  return defaultConfig;
}});
  _$jscoverage['/io/base.js'].lineData[488]++;
  return IO;
});
