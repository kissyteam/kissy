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
if (! _$jscoverage['/button.js']) {
  _$jscoverage['/button.js'] = {};
  _$jscoverage['/button.js'].lineData = [];
  _$jscoverage['/button.js'].lineData[6] = 0;
  _$jscoverage['/button.js'].lineData[7] = 0;
  _$jscoverage['/button.js'].lineData[10] = 0;
  _$jscoverage['/button.js'].lineData[16] = 0;
  _$jscoverage['/button.js'].lineData[20] = 0;
  _$jscoverage['/button.js'].lineData[21] = 0;
  _$jscoverage['/button.js'].lineData[26] = 0;
  _$jscoverage['/button.js'].lineData[27] = 0;
  _$jscoverage['/button.js'].lineData[32] = 0;
  _$jscoverage['/button.js'].lineData[36] = 0;
  _$jscoverage['/button.js'].lineData[40] = 0;
  _$jscoverage['/button.js'].lineData[45] = 0;
  _$jscoverage['/button.js'].lineData[49] = 0;
  _$jscoverage['/button.js'].lineData[50] = 0;
  _$jscoverage['/button.js'].lineData[51] = 0;
  _$jscoverage['/button.js'].lineData[52] = 0;
  _$jscoverage['/button.js'].lineData[55] = 0;
  _$jscoverage['/button.js'].lineData[59] = 0;
  _$jscoverage['/button.js'].lineData[61] = 0;
  _$jscoverage['/button.js'].lineData[65] = 0;
  _$jscoverage['/button.js'].lineData[69] = 0;
}
if (! _$jscoverage['/button.js'].functionData) {
  _$jscoverage['/button.js'].functionData = [];
  _$jscoverage['/button.js'].functionData[0] = 0;
  _$jscoverage['/button.js'].functionData[1] = 0;
  _$jscoverage['/button.js'].functionData[2] = 0;
  _$jscoverage['/button.js'].functionData[3] = 0;
  _$jscoverage['/button.js'].functionData[4] = 0;
  _$jscoverage['/button.js'].functionData[5] = 0;
  _$jscoverage['/button.js'].functionData[6] = 0;
  _$jscoverage['/button.js'].functionData[7] = 0;
}
if (! _$jscoverage['/button.js'].branchData) {
  _$jscoverage['/button.js'].branchData = {};
  _$jscoverage['/button.js'].branchData['26'] = [];
  _$jscoverage['/button.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['36'] = [];
  _$jscoverage['/button.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/button.js'].branchData['36'][3] = new BranchData();
  _$jscoverage['/button.js'].branchData['37'] = [];
  _$jscoverage['/button.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['38'] = [];
  _$jscoverage['/button.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/button.js'].branchData['39'] = [];
  _$jscoverage['/button.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['45'] = [];
  _$jscoverage['/button.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['51'] = [];
  _$jscoverage['/button.js'].branchData['51'][1] = new BranchData();
}
_$jscoverage['/button.js'].branchData['51'][1].init(79, 21, 'self.get(\'checkable\')');
function visit10_51_1(result) {
  _$jscoverage['/button.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['45'][1].init(470, 27, 'e.keyCode === KeyCode.SPACE');
function visit9_45_1(result) {
  _$jscoverage['/button.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['39'][1].init(47, 18, 'e.type === \'keyup\'');
function visit8_39_1(result) {
  _$jscoverage['/button.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['38'][2].init(109, 27, 'e.keyCode === KeyCode.SPACE');
function visit7_38_2(result) {
  _$jscoverage['/button.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['38'][1].init(88, 66, 'e.keyCode === KeyCode.SPACE && e.type === \'keyup\'');
function visit6_38_1(result) {
  _$jscoverage['/button.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['37'][1].init(47, 20, 'e.type === \'keydown\'');
function visit5_37_1(result) {
  _$jscoverage['/button.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['36'][3].init(18, 27, 'e.keyCode === KeyCode.ENTER');
function visit4_36_3(result) {
  _$jscoverage['/button.js'].branchData['36'][3].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['36'][2].init(18, 68, 'e.keyCode === KeyCode.ENTER && e.type === \'keydown\'');
function visit3_36_2(result) {
  _$jscoverage['/button.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['36'][1].init(18, 155, 'e.keyCode === KeyCode.ENTER && e.type === \'keydown\' || e.keyCode === KeyCode.SPACE && e.type === \'keyup\'');
function visit2_36_1(result) {
  _$jscoverage['/button.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['26'][1].init(243, 18, 'renderData.checked');
function visit1_26_1(result) {
  _$jscoverage['/button.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/button.js'].functionData[0]++;
  _$jscoverage['/button.js'].lineData[7]++;
  var Node = require('node'), Control = require('component/control');
  _$jscoverage['/button.js'].lineData[10]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/button.js'].lineData[16]++;
  return Control.extend({
  isButton: 1, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/button.js'].functionData[1]++;
  _$jscoverage['/button.js'].lineData[20]++;
  var self = this;
  _$jscoverage['/button.js'].lineData[21]++;
  S.mix(renderData.elAttrs, {
  role: 'button', 
  title: renderData.tooltip, 
  'aria-describedby': renderData.describedby});
  _$jscoverage['/button.js'].lineData[26]++;
  if (visit1_26_1(renderData.checked)) {
    _$jscoverage['/button.js'].lineData[27]++;
    renderData.elCls.push(self.getBaseCssClasses('checked'));
  }
}, 
  bindUI: function() {
  _$jscoverage['/button.js'].functionData[2]++;
  _$jscoverage['/button.js'].lineData[32]++;
  this.$el.on('keyup', this.handleKeyDownInternal, this);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/button.js'].functionData[3]++;
  _$jscoverage['/button.js'].lineData[36]++;
  if (visit2_36_1(visit3_36_2(visit4_36_3(e.keyCode === KeyCode.ENTER) && visit5_37_1(e.type === 'keydown')) || visit6_38_1(visit7_38_2(e.keyCode === KeyCode.SPACE) && visit8_39_1(e.type === 'keyup')))) {
    _$jscoverage['/button.js'].lineData[40]++;
    return this.handleClickInternal(e);
  }
  _$jscoverage['/button.js'].lineData[45]++;
  return visit9_45_1(e.keyCode === KeyCode.SPACE);
}, 
  handleClickInternal: function() {
  _$jscoverage['/button.js'].functionData[4]++;
  _$jscoverage['/button.js'].lineData[49]++;
  var self = this;
  _$jscoverage['/button.js'].lineData[50]++;
  self.callSuper();
  _$jscoverage['/button.js'].lineData[51]++;
  if (visit10_51_1(self.get('checkable'))) {
    _$jscoverage['/button.js'].lineData[52]++;
    self.set('checked', !self.get('checked'));
  }
  _$jscoverage['/button.js'].lineData[55]++;
  self.fire('click');
}, 
  _onSetChecked: function(v) {
  _$jscoverage['/button.js'].functionData[5]++;
  _$jscoverage['/button.js'].lineData[59]++;
  var self = this, cls = self.getBaseCssClasses('checked');
  _$jscoverage['/button.js'].lineData[61]++;
  self.$el[v ? 'addClass' : 'removeClass'](cls);
}, 
  _onSetTooltip: function(title) {
  _$jscoverage['/button.js'].functionData[6]++;
  _$jscoverage['/button.js'].lineData[65]++;
  this.el.setAttribute('title', title);
}, 
  _onSetDescribedby: function(describedby) {
  _$jscoverage['/button.js'].functionData[7]++;
  _$jscoverage['/button.js'].lineData[69]++;
  this.el.setAttribute('aria-describedby', describedby);
}}, {
  ATTRS: {
  value: {}, 
  describedby: {
  value: '', 
  render: 1, 
  sync: 0}, 
  tooltip: {
  value: '', 
  render: 1, 
  sync: 0}, 
  checkable: {}, 
  checked: {
  value: false, 
  render: 1, 
  sync: 0}}, 
  xclass: 'button'});
});
