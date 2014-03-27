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
if (! _$jscoverage['/io/sub-domain-transport.js']) {
  _$jscoverage['/io/sub-domain-transport.js'] = {};
  _$jscoverage['/io/sub-domain-transport.js'].lineData = [];
  _$jscoverage['/io/sub-domain-transport.js'].lineData[6] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[7] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[12] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[17] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[18] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[20] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[21] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[22] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[25] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[29] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[37] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[39] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[40] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[44] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[48] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[50] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[53] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[56] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[66] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[69] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[83] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[84] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[88] = 0;
}
if (! _$jscoverage['/io/sub-domain-transport.js'].functionData) {
  _$jscoverage['/io/sub-domain-transport.js'].functionData = [];
  _$jscoverage['/io/sub-domain-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].functionData[3] = 0;
}
if (! _$jscoverage['/io/sub-domain-transport.js'].branchData) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData = {};
  _$jscoverage['/io/sub-domain-transport.js'].branchData['39'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['43'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['45'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['53'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['61'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['61'][1] = new BranchData();
}
_$jscoverage['/io/sub-domain-transport.js'].branchData['61'][1].init(334, 31, 'doc.body || doc.documentElement');
function visit121_61_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['53'][1].init(802, 11, '!iframeDesc');
function visit120_53_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['45'][1].init(118, 14, 'self.nativeXhr');
function visit119_45_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['43'][1].init(427, 30, 'iframeDesc && iframeDesc.ready');
function visit118_43_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['39'][2].init(305, 40, 'c.xdr.subDomain && c.xdr.subDomain.proxy');
function visit117_39_2(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['39'][1].init(296, 49, 'c.xdr && c.xdr.subDomain && c.xdr.subDomain.proxy');
function visit116_39_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/sub-domain-transport.js'].functionData[0]++;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[7]++;
  var Event = require('event/dom'), Uri = require('uri'), Dom = require('dom'), XhrTransportBase = require('./xhr-transport-base');
  _$jscoverage['/io/sub-domain-transport.js'].lineData[11]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/sub-domain-transport.js'].lineData[12]++;
  var PROXY_PAGE = '/sub_domain_proxy.html', doc = S.Env.host.document, iframeMap = {};
  _$jscoverage['/io/sub-domain-transport.js'].lineData[17]++;
  function SubDomainTransport(io) {
    _$jscoverage['/io/sub-domain-transport.js'].functionData[1]++;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[18]++;
    var self = this, c = io.config;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[20]++;
    self.io = io;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[21]++;
    c.crossDomain = false;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[22]++;
    logger.info('use SubDomainTransport for: ' + c.url);
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[25]++;
  S.augment(SubDomainTransport, XhrTransportBase.proto, {
  send: function() {
  _$jscoverage['/io/sub-domain-transport.js'].functionData[2]++;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[29]++;
  var self = this, c = self.io.config, uri = c.uri, hostname = uri.getHostname(), iframe, iframeUri, iframeDesc = iframeMap[hostname];
  _$jscoverage['/io/sub-domain-transport.js'].lineData[37]++;
  var proxy = PROXY_PAGE;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[39]++;
  if (visit116_39_1(c.xdr && visit117_39_2(c.xdr.subDomain && c.xdr.subDomain.proxy))) {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[40]++;
    proxy = c.xdr.subDomain.proxy;
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[43]++;
  if (visit118_43_1(iframeDesc && iframeDesc.ready)) {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[44]++;
    self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[45]++;
    if (visit119_45_1(self.nativeXhr)) {
      _$jscoverage['/io/sub-domain-transport.js'].lineData[46]++;
      self.sendInternal();
    } else {
      _$jscoverage['/io/sub-domain-transport.js'].lineData[48]++;
      S.error('document.domain not set correctly!');
    }
    _$jscoverage['/io/sub-domain-transport.js'].lineData[50]++;
    return;
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[53]++;
  if (visit120_53_1(!iframeDesc)) {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[54]++;
    iframeDesc = iframeMap[hostname] = {};
    _$jscoverage['/io/sub-domain-transport.js'].lineData[55]++;
    iframe = iframeDesc.iframe = doc.createElement('iframe');
    _$jscoverage['/io/sub-domain-transport.js'].lineData[56]++;
    Dom.css(iframe, {
  position: 'absolute', 
  left: '-9999px', 
  top: '-9999px'});
    _$jscoverage['/io/sub-domain-transport.js'].lineData[61]++;
    Dom.prepend(iframe, visit121_61_1(doc.body || doc.documentElement));
    _$jscoverage['/io/sub-domain-transport.js'].lineData[62]++;
    iframeUri = new Uri();
    _$jscoverage['/io/sub-domain-transport.js'].lineData[63]++;
    iframeUri.setScheme(uri.getScheme());
    _$jscoverage['/io/sub-domain-transport.js'].lineData[64]++;
    iframeUri.setPort(uri.getPort());
    _$jscoverage['/io/sub-domain-transport.js'].lineData[65]++;
    iframeUri.setHostname(hostname);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[66]++;
    iframeUri.setPath(proxy);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[67]++;
    iframe.src = iframeUri.toString();
  } else {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[69]++;
    iframe = iframeDesc.iframe;
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[72]++;
  Event.on(iframe, 'load', _onLoad, self);
}});
  _$jscoverage['/io/sub-domain-transport.js'].lineData[77]++;
  function _onLoad() {
    _$jscoverage['/io/sub-domain-transport.js'].functionData[3]++;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[78]++;
    var self = this, c = self.io.config, uri = c.uri, hostname = uri.getHostname(), iframeDesc = iframeMap[hostname];
    _$jscoverage['/io/sub-domain-transport.js'].lineData[83]++;
    iframeDesc.ready = 1;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[84]++;
    Event.detach(iframeDesc.iframe, 'load', _onLoad, self);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[85]++;
    self.send();
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[88]++;
  return SubDomainTransport;
});
