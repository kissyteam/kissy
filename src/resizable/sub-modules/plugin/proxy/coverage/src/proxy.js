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
  _$jscoverage['/proxy.js'].lineData[11] = 0;
  _$jscoverage['/proxy.js'].lineData[14] = 0;
  _$jscoverage['/proxy.js'].lineData[17] = 0;
  _$jscoverage['/proxy.js'].lineData[18] = 0;
  _$jscoverage['/proxy.js'].lineData[21] = 0;
  _$jscoverage['/proxy.js'].lineData[22] = 0;
  _$jscoverage['/proxy.js'].lineData[23] = 0;
  _$jscoverage['/proxy.js'].lineData[24] = 0;
  _$jscoverage['/proxy.js'].lineData[27] = 0;
  _$jscoverage['/proxy.js'].lineData[29] = 0;
  _$jscoverage['/proxy.js'].lineData[30] = 0;
  _$jscoverage['/proxy.js'].lineData[31] = 0;
  _$jscoverage['/proxy.js'].lineData[37] = 0;
  _$jscoverage['/proxy.js'].lineData[38] = 0;
  _$jscoverage['/proxy.js'].lineData[42] = 0;
  _$jscoverage['/proxy.js'].lineData[44] = 0;
  _$jscoverage['/proxy.js'].lineData[45] = 0;
  _$jscoverage['/proxy.js'].lineData[48] = 0;
  _$jscoverage['/proxy.js'].lineData[49] = 0;
  _$jscoverage['/proxy.js'].lineData[51] = 0;
  _$jscoverage['/proxy.js'].lineData[57] = 0;
  _$jscoverage['/proxy.js'].lineData[58] = 0;
  _$jscoverage['/proxy.js'].lineData[59] = 0;
  _$jscoverage['/proxy.js'].lineData[61] = 0;
  _$jscoverage['/proxy.js'].lineData[63] = 0;
  _$jscoverage['/proxy.js'].lineData[64] = 0;
  _$jscoverage['/proxy.js'].lineData[70] = 0;
  _$jscoverage['/proxy.js'].lineData[73] = 0;
  _$jscoverage['/proxy.js'].lineData[87] = 0;
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
  _$jscoverage['/proxy.js'].branchData['21'] = [];
  _$jscoverage['/proxy.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['22'] = [];
  _$jscoverage['/proxy.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['37'] = [];
  _$jscoverage['/proxy.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['57'] = [];
  _$jscoverage['/proxy.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['63'] = [];
  _$jscoverage['/proxy.js'].branchData['63'][1] = new BranchData();
}
_$jscoverage['/proxy.js'].branchData['63'][1].init(565, 16, 'hideNodeOnResize');
function visit5_63_1(result) {
  _$jscoverage['/proxy.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['57'][1].init(354, 24, 'self.get(\'destroyOnEnd\')');
function visit4_57_1(result) {
  _$jscoverage['/proxy.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['37'][1].init(801, 16, 'hideNodeOnResize');
function visit3_37_1(result) {
  _$jscoverage['/proxy.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['22'][1].init(26, 26, 'typeof node === \'function\'');
function visit2_22_1(result) {
  _$jscoverage['/proxy.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['21'][1].init(160, 22, '!self.get(\'proxyNode\')');
function visit1_21_1(result) {
  _$jscoverage['/proxy.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].lineData[7]++;
KISSY.add('resizable/plugin/proxy', function(S, Base, Node) {
  _$jscoverage['/proxy.js'].functionData[0]++;
  _$jscoverage['/proxy.js'].lineData[8]++;
  var $ = Node.all, PROXY_EVENT = '.-ks-proxy' + S.now();
  _$jscoverage['/proxy.js'].lineData[11]++;
  return Base.extend({
  pluginId: 'resizable/plugin/proxy', 
  pluginInitializer: function(resizable) {
  _$jscoverage['/proxy.js'].functionData[1]++;
  _$jscoverage['/proxy.js'].lineData[14]++;
  var self = this, hideNodeOnResize = self.get('hideNodeOnResize');
  _$jscoverage['/proxy.js'].lineData[17]++;
  function start() {
    _$jscoverage['/proxy.js'].functionData[2]++;
    _$jscoverage['/proxy.js'].lineData[18]++;
    var node = self.get('node'), dragNode = resizable.get('node');
    _$jscoverage['/proxy.js'].lineData[21]++;
    if (visit1_21_1(!self.get('proxyNode'))) {
      _$jscoverage['/proxy.js'].lineData[22]++;
      if (visit2_22_1(typeof node === 'function')) {
        _$jscoverage['/proxy.js'].lineData[23]++;
        node = node(resizable);
        _$jscoverage['/proxy.js'].lineData[24]++;
        self.set('proxyNode', node);
      }
    } else {
      _$jscoverage['/proxy.js'].lineData[27]++;
      node = self.get('proxyNode');
    }
    _$jscoverage['/proxy.js'].lineData[29]++;
    node.show();
    _$jscoverage['/proxy.js'].lineData[30]++;
    dragNode.parent().append(node);
    _$jscoverage['/proxy.js'].lineData[31]++;
    node.css({
  left: dragNode.css('left'), 
  top: dragNode.css('top'), 
  width: dragNode.width(), 
  height: dragNode.height()});
    _$jscoverage['/proxy.js'].lineData[37]++;
    if (visit3_37_1(hideNodeOnResize)) {
      _$jscoverage['/proxy.js'].lineData[38]++;
      dragNode.css('visibility', 'hidden');
    }
  }
  _$jscoverage['/proxy.js'].lineData[42]++;
  function beforeResize(e) {
    _$jscoverage['/proxy.js'].functionData[3]++;
    _$jscoverage['/proxy.js'].lineData[44]++;
    e.preventDefault();
    _$jscoverage['/proxy.js'].lineData[45]++;
    self.get('proxyNode').css(e.region);
  }
  _$jscoverage['/proxy.js'].lineData[48]++;
  function end() {
    _$jscoverage['/proxy.js'].functionData[4]++;
    _$jscoverage['/proxy.js'].lineData[49]++;
    var node = self.get('proxyNode'), dragNode = resizable.get('node');
    _$jscoverage['/proxy.js'].lineData[51]++;
    dragNode.css({
  left: node.css('left'), 
  top: node.css('top'), 
  width: node.width(), 
  height: node.height()});
    _$jscoverage['/proxy.js'].lineData[57]++;
    if (visit4_57_1(self.get('destroyOnEnd'))) {
      _$jscoverage['/proxy.js'].lineData[58]++;
      node.remove();
      _$jscoverage['/proxy.js'].lineData[59]++;
      self.set('proxyNode', 0);
    } else {
      _$jscoverage['/proxy.js'].lineData[61]++;
      node.hide();
    }
    _$jscoverage['/proxy.js'].lineData[63]++;
    if (visit5_63_1(hideNodeOnResize)) {
      _$jscoverage['/proxy.js'].lineData[64]++;
      dragNode.css('visibility', '');
    }
  }
  _$jscoverage['/proxy.js'].lineData[70]++;
  resizable['on']('resizeStart' + PROXY_EVENT, start)['on']('beforeResize' + PROXY_EVENT, beforeResize)['on']('resizeEnd' + PROXY_EVENT, end);
}, 
  pluginDestructor: function(resizable) {
  _$jscoverage['/proxy.js'].functionData[5]++;
  _$jscoverage['/proxy.js'].lineData[73]++;
  resizable['detach'](PROXY_EVENT);
}}, {
  ATTRS: {
  node: {
  value: function(resizable) {
  _$jscoverage['/proxy.js'].functionData[6]++;
  _$jscoverage['/proxy.js'].lineData[87]++;
  return $('<div class="' + resizable.get('prefixCls') + 'resizable-proxy"></div>');
}}, 
  proxyNode: {}, 
  hideNodeOnResize: {
  value: false}, 
  destroyOnEnd: {
  value: false}}});
}, {
  requires: ['base', 'node']});
