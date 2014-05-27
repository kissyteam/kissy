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
  _$jscoverage['/io/sub-domain-transport.js'].lineData[10] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[16] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[17] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[19] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[20] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[21] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[24] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[28] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[38] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[39] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[44] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[47] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[53] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[60] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[66] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[71] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[83] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[84] = 0;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[87] = 0;
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
  _$jscoverage['/io/sub-domain-transport.js'].branchData['38'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['42'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['44'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['52'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/sub-domain-transport.js'].branchData['60'] = [];
  _$jscoverage['/io/sub-domain-transport.js'].branchData['60'][1] = new BranchData();
}
_$jscoverage['/io/sub-domain-transport.js'].branchData['60'][1].init(334, 31, 'doc.body || doc.documentElement');
function visit124_60_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['52'][1].init(802, 11, '!iframeDesc');
function visit123_52_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['44'][1].init(118, 14, 'self.nativeXhr');
function visit122_44_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['42'][1].init(427, 30, 'iframeDesc && iframeDesc.ready');
function visit121_42_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['38'][2].init(305, 40, 'c.xdr.subDomain && c.xdr.subDomain.proxy');
function visit120_38_2(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].branchData['38'][1].init(296, 49, 'c.xdr && c.xdr.subDomain && c.xdr.subDomain.proxy');
function visit119_38_1(result) {
  _$jscoverage['/io/sub-domain-transport.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/sub-domain-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/sub-domain-transport.js'].functionData[0]++;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[7]++;
  var Event = require('event/dom'), Dom = require('dom'), XhrTransportBase = require('./xhr-transport-base');
  _$jscoverage['/io/sub-domain-transport.js'].lineData[10]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/sub-domain-transport.js'].lineData[11]++;
  var PROXY_PAGE = '/sub_domain_proxy.html', doc = S.Env.host.document, iframeMap = {};
  _$jscoverage['/io/sub-domain-transport.js'].lineData[16]++;
  function SubDomainTransport(io) {
    _$jscoverage['/io/sub-domain-transport.js'].functionData[1]++;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[17]++;
    var self = this, c = io.config;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[19]++;
    self.io = io;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[20]++;
    c.crossDomain = false;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[21]++;
    logger.info('use SubDomainTransport for: ' + c.url);
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[24]++;
  S.augment(SubDomainTransport, XhrTransportBase.proto, {
  send: function() {
  _$jscoverage['/io/sub-domain-transport.js'].functionData[2]++;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[28]++;
  var self = this, c = self.io.config, uri = c.uri, hostname = uri.getHostname(), iframe, iframeUri, iframeDesc = iframeMap[hostname];
  _$jscoverage['/io/sub-domain-transport.js'].lineData[36]++;
  var proxy = PROXY_PAGE;
  _$jscoverage['/io/sub-domain-transport.js'].lineData[38]++;
  if (visit119_38_1(c.xdr && visit120_38_2(c.xdr.subDomain && c.xdr.subDomain.proxy))) {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[39]++;
    proxy = c.xdr.subDomain.proxy;
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[42]++;
  if (visit121_42_1(iframeDesc && iframeDesc.ready)) {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[43]++;
    self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[44]++;
    if (visit122_44_1(self.nativeXhr)) {
      _$jscoverage['/io/sub-domain-transport.js'].lineData[45]++;
      self.sendInternal();
    } else {
      _$jscoverage['/io/sub-domain-transport.js'].lineData[47]++;
      S.error('document.domain not set correctly!');
    }
    _$jscoverage['/io/sub-domain-transport.js'].lineData[49]++;
    return;
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[52]++;
  if (visit123_52_1(!iframeDesc)) {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[53]++;
    iframeDesc = iframeMap[hostname] = {};
    _$jscoverage['/io/sub-domain-transport.js'].lineData[54]++;
    iframe = iframeDesc.iframe = doc.createElement('iframe');
    _$jscoverage['/io/sub-domain-transport.js'].lineData[55]++;
    Dom.css(iframe, {
  position: 'absolute', 
  left: '-9999px', 
  top: '-9999px'});
    _$jscoverage['/io/sub-domain-transport.js'].lineData[60]++;
    Dom.prepend(iframe, visit124_60_1(doc.body || doc.documentElement));
    _$jscoverage['/io/sub-domain-transport.js'].lineData[61]++;
    iframeUri = new S.Uri();
    _$jscoverage['/io/sub-domain-transport.js'].lineData[62]++;
    iframeUri.setScheme(uri.getScheme());
    _$jscoverage['/io/sub-domain-transport.js'].lineData[63]++;
    iframeUri.setPort(uri.getPort());
    _$jscoverage['/io/sub-domain-transport.js'].lineData[64]++;
    iframeUri.setHostname(hostname);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[65]++;
    iframeUri.setPath(proxy);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[66]++;
    iframe.src = iframeUri.toString();
  } else {
    _$jscoverage['/io/sub-domain-transport.js'].lineData[68]++;
    iframe = iframeDesc.iframe;
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[71]++;
  Event.on(iframe, 'load', _onLoad, self);
}});
  _$jscoverage['/io/sub-domain-transport.js'].lineData[76]++;
  function _onLoad() {
    _$jscoverage['/io/sub-domain-transport.js'].functionData[3]++;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[77]++;
    var self = this, c = self.io.config, uri = c.uri, hostname = uri.getHostname(), iframeDesc = iframeMap[hostname];
    _$jscoverage['/io/sub-domain-transport.js'].lineData[82]++;
    iframeDesc.ready = 1;
    _$jscoverage['/io/sub-domain-transport.js'].lineData[83]++;
    Event.detach(iframeDesc.iframe, 'load', _onLoad, self);
    _$jscoverage['/io/sub-domain-transport.js'].lineData[84]++;
    self.send();
  }
  _$jscoverage['/io/sub-domain-transport.js'].lineData[87]++;
  return SubDomainTransport;
});
