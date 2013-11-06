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
  _$jscoverage['/io/xhr-transport.js'].lineData[12] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[14] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[21] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[22] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[29] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[31] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[33] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[35] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[50] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[56] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[58] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/xhr-transport.js'].lineData[69] = 0;
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
  _$jscoverage['/io/xhr-transport.js'].branchData['14'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['26'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['27'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['31'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['33'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['35'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['45'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport.js'].branchData['53'] = [];
  _$jscoverage['/io/xhr-transport.js'].branchData['53'][1] = new BranchData();
}
_$jscoverage['/io/xhr-transport.js'].branchData['53'][1].init(56, 51, '_XDomainRequest && (xhr instanceof _XDomainRequest)');
function visit198_53_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['45'][2].init(505, 30, 'String(xdrCfg.use) === \'flash\'');
function visit197_45_2(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['45'][1].init(505, 50, 'String(xdrCfg.use) === \'flash\' || !_XDomainRequest');
function visit196_45_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['35'][1].init(80, 25, 'subDomain.proxy !== false');
function visit195_35_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['33'][1].init(38, 32, 'isSubDomain(c.uri.getHostname())');
function visit194_33_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['31'][1].init(261, 44, 'crossDomain && !XhrTransportBase.supportCORS');
function visit193_31_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['27'][1].init(186, 22, 'xdrCfg.subDomain || {}');
function visit192_27_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['26'][1].init(126, 14, 'c[\'xdr\'] || {}');
function visit191_26_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].branchData['14'][1].init(63, 46, 'doc.domain && S.endsWith(hostname, doc.domain)');
function visit190_14_1(result) {
  _$jscoverage['/io/xhr-transport.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport.js'].lineData[6]++;
KISSY.add('io/xhr-transport', function(S, IO, XhrTransportBase, SubDomainTransport, XdrFlashTransport) {
  _$jscoverage['/io/xhr-transport.js'].functionData[0]++;
  _$jscoverage['/io/xhr-transport.js'].lineData[7]++;
  var win = S.Env.host, doc = win.document, logger = S.getLogger('s/io'), _XDomainRequest = XhrTransportBase._XDomainRequest;
  _$jscoverage['/io/xhr-transport.js'].lineData[12]++;
  function isSubDomain(hostname) {
    _$jscoverage['/io/xhr-transport.js'].functionData[1]++;
    _$jscoverage['/io/xhr-transport.js'].lineData[14]++;
    return visit190_14_1(doc.domain && S.endsWith(hostname, doc.domain));
  }
  _$jscoverage['/io/xhr-transport.js'].lineData[21]++;
  function XhrTransport(io) {
    _$jscoverage['/io/xhr-transport.js'].functionData[2]++;
    _$jscoverage['/io/xhr-transport.js'].lineData[22]++;
    var c = io.config, crossDomain = c.crossDomain, self = this, xhr, xdrCfg = visit191_26_1(c['xdr'] || {}), subDomain = xdrCfg.subDomain = visit192_27_1(xdrCfg.subDomain || {});
    _$jscoverage['/io/xhr-transport.js'].lineData[29]++;
    self.io = io;
    _$jscoverage['/io/xhr-transport.js'].lineData[31]++;
    if (visit193_31_1(crossDomain && !XhrTransportBase.supportCORS)) {
      _$jscoverage['/io/xhr-transport.js'].lineData[33]++;
      if (visit194_33_1(isSubDomain(c.uri.getHostname()))) {
        _$jscoverage['/io/xhr-transport.js'].lineData[35]++;
        if (visit195_35_1(subDomain.proxy !== false)) {
          _$jscoverage['/io/xhr-transport.js'].lineData[36]++;
          return new SubDomainTransport(io);
        }
      }
      _$jscoverage['/io/xhr-transport.js'].lineData[45]++;
      if ((visit196_45_1(visit197_45_2(String(xdrCfg.use) === 'flash') || !_XDomainRequest))) {
        _$jscoverage['/io/xhr-transport.js'].lineData[46]++;
        return new XdrFlashTransport(io);
      }
    }
    _$jscoverage['/io/xhr-transport.js'].lineData[50]++;
    xhr = self.nativeXhr = XhrTransportBase.nativeXhr(crossDomain);
    _$jscoverage['/io/xhr-transport.js'].lineData[52]++;
    var msg = 'crossDomain: ' + crossDomain + ', use ' + (visit198_53_1(_XDomainRequest && (xhr instanceof _XDomainRequest)) ? 'XDomainRequest' : 'XhrTransport') + ' for: ' + c.url;
    _$jscoverage['/io/xhr-transport.js'].lineData[56]++;
    logger.debug(msg);
    _$jscoverage['/io/xhr-transport.js'].lineData[58]++;
    return self;
  }
  _$jscoverage['/io/xhr-transport.js'].lineData[61]++;
  S.augment(XhrTransport, XhrTransportBase.proto, {
  send: function() {
  _$jscoverage['/io/xhr-transport.js'].functionData[3]++;
  _$jscoverage['/io/xhr-transport.js'].lineData[63]++;
  this.sendInternal();
}});
  _$jscoverage['/io/xhr-transport.js'].lineData[67]++;
  IO['setupTransport']('*', XhrTransport);
  _$jscoverage['/io/xhr-transport.js'].lineData[69]++;
  return IO;
}, {
  requires: ['./base', './xhr-transport-base', './sub-domain-transport', './xdr-flash-transport']});
