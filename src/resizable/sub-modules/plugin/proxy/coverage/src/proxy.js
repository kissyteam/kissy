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
if (! _$jscoverage['/proxy.js']) {
  _$jscoverage['/proxy.js'] = {};
  _$jscoverage['/proxy.js'].lineData = [];
  _$jscoverage['/proxy.js'].lineData[7] = 0;
  _$jscoverage['/proxy.js'].lineData[8] = 0;
  _$jscoverage['/proxy.js'].lineData[9] = 0;
  _$jscoverage['/proxy.js'].lineData[11] = 0;
  _$jscoverage['/proxy.js'].lineData[18] = 0;
  _$jscoverage['/proxy.js'].lineData[22] = 0;
  _$jscoverage['/proxy.js'].lineData[25] = 0;
  _$jscoverage['/proxy.js'].lineData[26] = 0;
  _$jscoverage['/proxy.js'].lineData[29] = 0;
  _$jscoverage['/proxy.js'].lineData[30] = 0;
  _$jscoverage['/proxy.js'].lineData[31] = 0;
  _$jscoverage['/proxy.js'].lineData[32] = 0;
  _$jscoverage['/proxy.js'].lineData[35] = 0;
  _$jscoverage['/proxy.js'].lineData[37] = 0;
  _$jscoverage['/proxy.js'].lineData[38] = 0;
  _$jscoverage['/proxy.js'].lineData[39] = 0;
  _$jscoverage['/proxy.js'].lineData[45] = 0;
  _$jscoverage['/proxy.js'].lineData[46] = 0;
  _$jscoverage['/proxy.js'].lineData[50] = 0;
  _$jscoverage['/proxy.js'].lineData[52] = 0;
  _$jscoverage['/proxy.js'].lineData[53] = 0;
  _$jscoverage['/proxy.js'].lineData[56] = 0;
  _$jscoverage['/proxy.js'].lineData[57] = 0;
  _$jscoverage['/proxy.js'].lineData[59] = 0;
  _$jscoverage['/proxy.js'].lineData[65] = 0;
  _$jscoverage['/proxy.js'].lineData[66] = 0;
  _$jscoverage['/proxy.js'].lineData[67] = 0;
  _$jscoverage['/proxy.js'].lineData[69] = 0;
  _$jscoverage['/proxy.js'].lineData[71] = 0;
  _$jscoverage['/proxy.js'].lineData[72] = 0;
  _$jscoverage['/proxy.js'].lineData[78] = 0;
  _$jscoverage['/proxy.js'].lineData[82] = 0;
  _$jscoverage['/proxy.js'].lineData[103] = 0;
}
if (! _$jscoverage['/proxy.js'].functionData) {
  _$jscoverage['/proxy.js'].functionData = [];
  _$jscoverage['/proxy.js'].functionData[0] = 0;
  _$jscoverage['/proxy.js'].functionData[1] = 0;
  _$jscoverage['/proxy.js'].functionData[2] = 0;
  _$jscoverage['/proxy.js'].functionData[3] = 0;
  _$jscoverage['/proxy.js'].functionData[4] = 0;
  _$jscoverage['/proxy.js'].functionData[5] = 0;
  _$jscoverage['/proxy.js'].functionData[6] = 0;
}
if (! _$jscoverage['/proxy.js'].branchData) {
  _$jscoverage['/proxy.js'].branchData = {};
  _$jscoverage['/proxy.js'].branchData['29'] = [];
  _$jscoverage['/proxy.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['30'] = [];
  _$jscoverage['/proxy.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['45'] = [];
  _$jscoverage['/proxy.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['65'] = [];
  _$jscoverage['/proxy.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['71'] = [];
  _$jscoverage['/proxy.js'].branchData['71'][1] = new BranchData();
}
_$jscoverage['/proxy.js'].branchData['71'][1].init(550, 16, 'hideNodeOnResize');
function visit5_71_1(result) {
  _$jscoverage['/proxy.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['65'][1].init(345, 24, 'self.get(\'destroyOnEnd\')');
function visit4_65_1(result) {
  _$jscoverage['/proxy.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['45'][1].init(781, 16, 'hideNodeOnResize');
function visit3_45_1(result) {
  _$jscoverage['/proxy.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['30'][1].init(25, 26, 'typeof node === \'function\'');
function visit2_30_1(result) {
  _$jscoverage['/proxy.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['29'][1].init(156, 22, '!self.get(\'proxyNode\')');
function visit1_29_1(result) {
  _$jscoverage['/proxy.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/proxy.js'].functionData[0]++;
  _$jscoverage['/proxy.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/proxy.js'].lineData[9]++;
  var Base = require('base');
  _$jscoverage['/proxy.js'].lineData[11]++;
  var $ = Node.all, PROXY_EVENT = '.-ks-proxy' + S.now();
  _$jscoverage['/proxy.js'].lineData[18]++;
  return Base.extend({
  pluginId: 'resizable/plugin/proxy', 
  pluginInitializer: function(resizable) {
  _$jscoverage['/proxy.js'].functionData[1]++;
  _$jscoverage['/proxy.js'].lineData[22]++;
  var self = this, hideNodeOnResize = self.get('hideNodeOnResize');
  _$jscoverage['/proxy.js'].lineData[25]++;
  function start() {
    _$jscoverage['/proxy.js'].functionData[2]++;
    _$jscoverage['/proxy.js'].lineData[26]++;
    var node = self.get('node'), dragNode = resizable.get('node');
    _$jscoverage['/proxy.js'].lineData[29]++;
    if (visit1_29_1(!self.get('proxyNode'))) {
      _$jscoverage['/proxy.js'].lineData[30]++;
      if (visit2_30_1(typeof node === 'function')) {
        _$jscoverage['/proxy.js'].lineData[31]++;
        node = node(resizable);
        _$jscoverage['/proxy.js'].lineData[32]++;
        self.set('proxyNode', node);
      }
    } else {
      _$jscoverage['/proxy.js'].lineData[35]++;
      node = self.get('proxyNode');
    }
    _$jscoverage['/proxy.js'].lineData[37]++;
    node.show();
    _$jscoverage['/proxy.js'].lineData[38]++;
    dragNode.parent().append(node);
    _$jscoverage['/proxy.js'].lineData[39]++;
    node.css({
  left: dragNode.css('left'), 
  top: dragNode.css('top'), 
  width: dragNode.width(), 
  height: dragNode.height()});
    _$jscoverage['/proxy.js'].lineData[45]++;
    if (visit3_45_1(hideNodeOnResize)) {
      _$jscoverage['/proxy.js'].lineData[46]++;
      dragNode.css('visibility', 'hidden');
    }
  }
  _$jscoverage['/proxy.js'].lineData[50]++;
  function beforeResize(e) {
    _$jscoverage['/proxy.js'].functionData[3]++;
    _$jscoverage['/proxy.js'].lineData[52]++;
    e.preventDefault();
    _$jscoverage['/proxy.js'].lineData[53]++;
    self.get('proxyNode').css(e.region);
  }
  _$jscoverage['/proxy.js'].lineData[56]++;
  function end() {
    _$jscoverage['/proxy.js'].functionData[4]++;
    _$jscoverage['/proxy.js'].lineData[57]++;
    var node = self.get('proxyNode'), dragNode = resizable.get('node');
    _$jscoverage['/proxy.js'].lineData[59]++;
    dragNode.css({
  left: node.css('left'), 
  top: node.css('top'), 
  width: node.width(), 
  height: node.height()});
    _$jscoverage['/proxy.js'].lineData[65]++;
    if (visit4_65_1(self.get('destroyOnEnd'))) {
      _$jscoverage['/proxy.js'].lineData[66]++;
      node.remove();
      _$jscoverage['/proxy.js'].lineData[67]++;
      self.set('proxyNode', 0);
    } else {
      _$jscoverage['/proxy.js'].lineData[69]++;
      node.hide();
    }
    _$jscoverage['/proxy.js'].lineData[71]++;
    if (visit5_71_1(hideNodeOnResize)) {
      _$jscoverage['/proxy.js'].lineData[72]++;
      dragNode.css('visibility', '');
    }
  }
  _$jscoverage['/proxy.js'].lineData[78]++;
  resizable.on('resizeStart' + PROXY_EVENT, start).on('beforeResize' + PROXY_EVENT, beforeResize).on('resizeEnd' + PROXY_EVENT, end);
}, 
  pluginDestructor: function(resizable) {
  _$jscoverage['/proxy.js'].functionData[5]++;
  _$jscoverage['/proxy.js'].lineData[82]++;
  resizable.detach(PROXY_EVENT);
}}, {
  ATTRS: {
  node: {
  value: function(resizable) {
  _$jscoverage['/proxy.js'].functionData[6]++;
  _$jscoverage['/proxy.js'].lineData[103]++;
  return $('<div class="' + resizable.get('prefixCls') + 'resizable-proxy"></div>');
}}, 
  proxyNode: {}, 
  hideNodeOnResize: {
  value: false}, 
  destroyOnEnd: {
  value: false}}});
});
