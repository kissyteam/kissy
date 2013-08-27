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
if (! _$jscoverage['/constrain.js']) {
  _$jscoverage['/constrain.js'] = {};
  _$jscoverage['/constrain.js'].lineData = [];
  _$jscoverage['/constrain.js'].lineData[6] = 0;
  _$jscoverage['/constrain.js'].lineData[8] = 0;
  _$jscoverage['/constrain.js'].lineData[12] = 0;
  _$jscoverage['/constrain.js'].lineData[13] = 0;
  _$jscoverage['/constrain.js'].lineData[18] = 0;
  _$jscoverage['/constrain.js'].lineData[19] = 0;
  _$jscoverage['/constrain.js'].lineData[20] = 0;
  _$jscoverage['/constrain.js'].lineData[27] = 0;
  _$jscoverage['/constrain.js'].lineData[28] = 0;
  _$jscoverage['/constrain.js'].lineData[29] = 0;
  _$jscoverage['/constrain.js'].lineData[35] = 0;
  _$jscoverage['/constrain.js'].lineData[36] = 0;
  _$jscoverage['/constrain.js'].lineData[38] = 0;
  _$jscoverage['/constrain.js'].lineData[39] = 0;
  _$jscoverage['/constrain.js'].lineData[40] = 0;
  _$jscoverage['/constrain.js'].lineData[45] = 0;
  _$jscoverage['/constrain.js'].lineData[46] = 0;
  _$jscoverage['/constrain.js'].lineData[51] = 0;
  _$jscoverage['/constrain.js'].lineData[52] = 0;
  _$jscoverage['/constrain.js'].lineData[53] = 0;
  _$jscoverage['/constrain.js'].lineData[54] = 0;
  _$jscoverage['/constrain.js'].lineData[58] = 0;
  _$jscoverage['/constrain.js'].lineData[59] = 0;
  _$jscoverage['/constrain.js'].lineData[67] = 0;
  _$jscoverage['/constrain.js'].lineData[79] = 0;
  _$jscoverage['/constrain.js'].lineData[82] = 0;
  _$jscoverage['/constrain.js'].lineData[91] = 0;
  _$jscoverage['/constrain.js'].lineData[115] = 0;
  _$jscoverage['/constrain.js'].lineData[116] = 0;
  _$jscoverage['/constrain.js'].lineData[117] = 0;
  _$jscoverage['/constrain.js'].lineData[118] = 0;
  _$jscoverage['/constrain.js'].lineData[119] = 0;
  _$jscoverage['/constrain.js'].lineData[122] = 0;
}
if (! _$jscoverage['/constrain.js'].functionData) {
  _$jscoverage['/constrain.js'].functionData = [];
  _$jscoverage['/constrain.js'].functionData[0] = 0;
  _$jscoverage['/constrain.js'].functionData[1] = 0;
  _$jscoverage['/constrain.js'].functionData[2] = 0;
  _$jscoverage['/constrain.js'].functionData[3] = 0;
  _$jscoverage['/constrain.js'].functionData[4] = 0;
  _$jscoverage['/constrain.js'].functionData[5] = 0;
  _$jscoverage['/constrain.js'].functionData[6] = 0;
}
if (! _$jscoverage['/constrain.js'].branchData) {
  _$jscoverage['/constrain.js'].branchData = {};
  _$jscoverage['/constrain.js'].branchData['18'] = [];
  _$jscoverage['/constrain.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['19'] = [];
  _$jscoverage['/constrain.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['27'] = [];
  _$jscoverage['/constrain.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['35'] = [];
  _$jscoverage['/constrain.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['38'] = [];
  _$jscoverage['/constrain.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['51'] = [];
  _$jscoverage['/constrain.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['115'] = [];
  _$jscoverage['/constrain.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['116'] = [];
  _$jscoverage['/constrain.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['118'] = [];
  _$jscoverage['/constrain.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/constrain.js'].branchData['118'][3] = new BranchData();
}
_$jscoverage['/constrain.js'].branchData['118'][3].init(156, 20, 'typeof v == \'string\'');
function visit11_118_3(result) {
  _$jscoverage['/constrain.js'].branchData['118'][3].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['118'][2].init(139, 37, 'S.isWindow(v) || typeof v == \'string\'');
function visit10_118_2(result) {
  _$jscoverage['/constrain.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['118'][1].init(125, 51, 'v.nodeType || S.isWindow(v) || typeof v == \'string\'');
function visit9_118_1(result) {
  _$jscoverage['/constrain.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['116'][1].init(30, 10, 'v === true');
function visit8_116_1(result) {
  _$jscoverage['/constrain.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['115'][1].init(26, 1, 'v');
function visit7_115_1(result) {
  _$jscoverage['/constrain.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['51'][1].init(162, 9, 'constrain');
function visit6_51_1(result) {
  _$jscoverage['/constrain.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['38'][1].init(821, 22, 'self.__constrainRegion');
function visit5_38_1(result) {
  _$jscoverage['/constrain.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['35'][1].init(708, 26, 'S.isPlainObject(constrain)');
function visit4_35_1(result) {
  _$jscoverage['/constrain.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['27'][1].init(359, 20, 'constrain.getDOMNode');
function visit3_27_1(result) {
  _$jscoverage['/constrain.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['19'][1].init(18, 24, 'S.isWindow(constrain[0])');
function visit2_19_1(result) {
  _$jscoverage['/constrain.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].branchData['18'][1].init(185, 9, 'constrain');
function visit1_18_1(result) {
  _$jscoverage['/constrain.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/constrain.js'].lineData[6]++;
KISSY.add('dd/plugin/constrain', function(S, Base, Node) {
  _$jscoverage['/constrain.js'].functionData[0]++;
  _$jscoverage['/constrain.js'].lineData[8]++;
  var $ = Node.all, CONSTRAIN_EVENT = '.-ks-constrain' + S.now(), WIN = S.Env.host;
  _$jscoverage['/constrain.js'].lineData[12]++;
  function onDragStart(e) {
    _$jscoverage['/constrain.js'].functionData[1]++;
    _$jscoverage['/constrain.js'].lineData[13]++;
    var self = this, drag = e.drag, l, t, lt, dragNode = drag.get('dragNode'), constrain = self.get('constrain');
    _$jscoverage['/constrain.js'].lineData[18]++;
    if (visit1_18_1(constrain)) {
      _$jscoverage['/constrain.js'].lineData[19]++;
      if (visit2_19_1(S.isWindow(constrain[0]))) {
        _$jscoverage['/constrain.js'].lineData[20]++;
        self.__constrainRegion = {
  left: l = constrain.scrollLeft(), 
  top: t = constrain.scrollTop(), 
  right: l + constrain.width(), 
  bottom: t + constrain.height()};
      } else {
        _$jscoverage['/constrain.js'].lineData[27]++;
        if (visit3_27_1(constrain.getDOMNode)) {
          _$jscoverage['/constrain.js'].lineData[28]++;
          lt = constrain.offset();
          _$jscoverage['/constrain.js'].lineData[29]++;
          self.__constrainRegion = {
  left: lt.left, 
  top: lt.top, 
  right: lt.left + constrain.outerWidth(), 
  bottom: lt.top + constrain.outerHeight()};
        } else {
          _$jscoverage['/constrain.js'].lineData[35]++;
          if (visit4_35_1(S.isPlainObject(constrain))) {
            _$jscoverage['/constrain.js'].lineData[36]++;
            self.__constrainRegion = constrain;
          }
        }
      }
      _$jscoverage['/constrain.js'].lineData[38]++;
      if (visit5_38_1(self.__constrainRegion)) {
        _$jscoverage['/constrain.js'].lineData[39]++;
        self.__constrainRegion.right -= dragNode.outerWidth();
        _$jscoverage['/constrain.js'].lineData[40]++;
        self.__constrainRegion.bottom -= dragNode.outerHeight();
      }
    }
  }
  _$jscoverage['/constrain.js'].lineData[45]++;
  function onDragAlign(e) {
    _$jscoverage['/constrain.js'].functionData[2]++;
    _$jscoverage['/constrain.js'].lineData[46]++;
    var self = this, info = {}, l = e.left, t = e.top, constrain = self.__constrainRegion;
    _$jscoverage['/constrain.js'].lineData[51]++;
    if (visit6_51_1(constrain)) {
      _$jscoverage['/constrain.js'].lineData[52]++;
      info.left = Math.min(Math.max(constrain.left, l), constrain.right);
      _$jscoverage['/constrain.js'].lineData[53]++;
      info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
      _$jscoverage['/constrain.js'].lineData[54]++;
      e.drag.setInternal('actualPos', info);
    }
  }
  _$jscoverage['/constrain.js'].lineData[58]++;
  function onDragEnd() {
    _$jscoverage['/constrain.js'].functionData[3]++;
    _$jscoverage['/constrain.js'].lineData[59]++;
    this.__constrainRegion = null;
  }
  _$jscoverage['/constrain.js'].lineData[67]++;
  return Base.extend({
  pluginId: 'dd/plugin/constrain', 
  __constrainRegion: null, 
  pluginInitializer: function(drag) {
  _$jscoverage['/constrain.js'].functionData[4]++;
  _$jscoverage['/constrain.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/constrain.js'].lineData[82]++;
  drag['on']('dragstart' + CONSTRAIN_EVENT, onDragStart, self).on('dragend' + CONSTRAIN_EVENT, onDragEnd, self).on('dragalign' + CONSTRAIN_EVENT, onDragAlign, self);
}, 
  pluginDestructor: function(drag) {
  _$jscoverage['/constrain.js'].functionData[5]++;
  _$jscoverage['/constrain.js'].lineData[91]++;
  drag['detach'](CONSTRAIN_EVENT, {
  context: this});
}}, {
  ATTRS: {
  constrain: {
  value: $(WIN), 
  setter: function(v) {
  _$jscoverage['/constrain.js'].functionData[6]++;
  _$jscoverage['/constrain.js'].lineData[115]++;
  if (visit7_115_1(v)) {
    _$jscoverage['/constrain.js'].lineData[116]++;
    if (visit8_116_1(v === true)) {
      _$jscoverage['/constrain.js'].lineData[117]++;
      return $(WIN);
    } else {
      _$jscoverage['/constrain.js'].lineData[118]++;
      if (visit9_118_1(v.nodeType || visit10_118_2(S.isWindow(v) || visit11_118_3(typeof v == 'string')))) {
        _$jscoverage['/constrain.js'].lineData[119]++;
        return $(v);
      }
    }
  }
  _$jscoverage['/constrain.js'].lineData[122]++;
  return v;
}}}});
}, {
  requires: ['base', 'node']});
