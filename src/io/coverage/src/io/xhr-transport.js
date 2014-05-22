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
if (! _$jscoverage['/io/xhr-transport.js']) {
  _$jscoverage['/io/xhr-transport.js'] = {};
  _$jscoverage['/io/xhr-transport.js'].lineData = [];
  _$jscoverage['/io/xhr-transport.js'].lineData[6] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[7] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[8] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[12] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[13] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[19] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[21] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[28] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[29] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[38] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[40] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[53] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[57] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[59] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[70] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[76] = 0;
}
if (! _$jscoverage['/io/xhr-transport.js'].functionData) {
  _$jscoverage['/io/xhr-transport.js'].functionData = [];
  _$jscoverage['/io/xhr-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/xhr-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/xhr-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/xhr-transport.js'].functionData[3] = 0;
}
if (! _$jscoverage['/io/xhr-transport.js'].branchData) {
  _$jscoverage['/io/xhr-transport.js'].branchData = {};
  _$jscoverage['/io/xhr-transport.js'].branchData['21'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['33'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['34'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['38'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['40'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['42'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['52'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['60'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['60'][1] = new BranchData();
}
_$jscoverage['/io/xhr-transport.js'].branchData['60'][1].init(56, 51, 'XDomainRequest_ && (xhr instanceof XDomainRequest_)');
function visit189_60_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['52'][2].init(505, 30, 'String(xdrCfg.use) === \'flash\'');
function visit188_52_2(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['52'][1].init(505, 50, 'String(xdrCfg.use) === \'flash\' || !XDomainRequest_');
function visit187_52_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['42'][1].init(80, 25, 'subDomain.proxy !== false');
function visit186_42_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['40'][1].init(38, 32, 'isSubDomain(c.uri.getHostname())');
function visit185_40_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['38'][1].init(258, 44, 'crossDomain && !XhrTransportBase.supportCORS');
function visit184_38_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['34'][1].init(183, 22, 'xdrCfg.subDomain || {}');
function visit183_34_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['33'][1].init(126, 11, 'c.xdr || {}');
function visit182_33_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['21'][1].init(63, 49, 'doc.domain && util.endsWith(hostname, doc.domain)');
function visit181_21_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/xhr-transport.js'].functionData[0]++;
  _$jscoverage['/io/xhr-transport.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/xhr-transport.js'].lineData[8]++;
  var IO = require('./base'), XhrTransportBase = require('./xhr-transport-base'), XdrFlashTransport = require('./xdr-flash-transport'), SubDomainTransport = require('./sub-domain-transport');
  _$jscoverage['/io/xhr-transport.js'].lineData[12]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/xhr-transport.js'].lineData[13]++;
  var win = S.Env.host, doc = win.document, XDomainRequest_ = XhrTransportBase.XDomainRequest_;
  _$jscoverage['/io/xhr-transport.js'].lineData[19]++;
  function isSubDomain(hostname) {
    _$jscoverage['/io/xhr-transport.js'].functionData[1]++;
    _$jscoverage['/io/xhr-transport.js'].lineData[21]++;
    return visit181_21_1(doc.domain && util.endsWith(hostname, doc.domain));
  }
  _$jscoverage['/io/xhr-transport.js'].lineData[28]++;
  function XhrTransport(io) {
    _$jscoverage['/io/xhr-transport.js'].functionData[2]++;
    _$jscoverage['/io/xhr-transport.js'].lineData[29]++;
    var c = io.config, crossDomain = c.crossDomain, self = this, xhr, xdrCfg = visit182_33_1(c.xdr || {}), subDomain = xdrCfg.subDomain = visit183_34_1(xdrCfg.subDomain || {});
    _$jscoverage['/io/xhr-transport.js'].lineData[36]++;
    self.io = io;
    _$jscoverage['/io/xhr-transport.js'].lineData[38]++;
    if (visit184_38_1(crossDomain && !XhrTransportBase.supportCORS)) {
      _$jscoverage['/io/xhr-transport.js'].lineData[40]++;
      if (visit185_40_1(isSubDomain(c.uri.getHostname()))) {
        _$jscoverage['/io/xhr-transport.js'].lineData[42]++;
        if (visit186_42_1(subDomain.proxy !== false)) {
          _$jscoverage['/io/xhr-transport.js'].lineData[43]++;
          return new SubDomainTransport(io);
        }
      }
      _$jscoverage['/io/xhr-transport.js'].lineData[52]++;
      if ((visit187_52_1(visit188_52_2(String(xdrCfg.use) === 'flash') || !XDomainRequest_))) {
        _$jscoverage['/io/xhr-transport.js'].lineData[53]++;
        return new XdrFlashTransport(io);
      }
    }
    _$jscoverage['/io/xhr-transport.js'].lineData[57]++;
    xhr = self.nativeXhr = XhrTransportBase.nativeXhr(crossDomain);
    _$jscoverage['/io/xhr-transport.js'].lineData[59]++;
    var msg = 'crossDomain: ' + crossDomain + ', use ' + (visit189_60_1(XDomainRequest_ && (xhr instanceof XDomainRequest_)) ? 'XDomainRequest' : 'XhrTransport') + ' for: ' + c.url;
    _$jscoverage['/io/xhr-transport.js'].lineData[63]++;
    logger.debug(msg);
    _$jscoverage['/io/xhr-transport.js'].lineData[65]++;
    return self;
  }
  _$jscoverage['/io/xhr-transport.js'].lineData[68]++;
  util.augment(XhrTransport, XhrTransportBase.proto, {
  send: function() {
  _$jscoverage['/io/xhr-transport.js'].functionData[3]++;
  _$jscoverage['/io/xhr-transport.js'].lineData[70]++;
  this.sendInternal();
}});
  _$jscoverage['/io/xhr-transport.js'].lineData[74]++;
  IO.setupTransport('*', XhrTransport);
  _$jscoverage['/io/xhr-transport.js'].lineData[76]++;
  return IO;
});
