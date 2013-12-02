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
if (! _$jscoverage['/manager.js']) {
  _$jscoverage['/manager.js'] = {};
  _$jscoverage['/manager.js'].lineData = [];
  _$jscoverage['/manager.js'].lineData[6] = 0;
  _$jscoverage['/manager.js'].lineData[8] = 0;
  _$jscoverage['/manager.js'].lineData[25] = 0;
  _$jscoverage['/manager.js'].lineData[35] = 0;
  _$jscoverage['/manager.js'].lineData[43] = 0;
  _$jscoverage['/manager.js'].lineData[52] = 0;
  _$jscoverage['/manager.js'].lineData[75] = 0;
  _$jscoverage['/manager.js'].lineData[77] = 0;
  _$jscoverage['/manager.js'].lineData[78] = 0;
  _$jscoverage['/manager.js'].lineData[79] = 0;
  _$jscoverage['/manager.js'].lineData[80] = 0;
  _$jscoverage['/manager.js'].lineData[82] = 0;
  _$jscoverage['/manager.js'].lineData[83] = 0;
  _$jscoverage['/manager.js'].lineData[84] = 0;
  _$jscoverage['/manager.js'].lineData[85] = 0;
  _$jscoverage['/manager.js'].lineData[89] = 0;
  _$jscoverage['/manager.js'].lineData[90] = 0;
  _$jscoverage['/manager.js'].lineData[91] = 0;
  _$jscoverage['/manager.js'].lineData[92] = 0;
  _$jscoverage['/manager.js'].lineData[94] = 0;
  _$jscoverage['/manager.js'].lineData[96] = 0;
  _$jscoverage['/manager.js'].lineData[97] = 0;
  _$jscoverage['/manager.js'].lineData[100] = 0;
  _$jscoverage['/manager.js'].lineData[109] = 0;
  _$jscoverage['/manager.js'].lineData[115] = 0;
  _$jscoverage['/manager.js'].lineData[116] = 0;
  _$jscoverage['/manager.js'].lineData[117] = 0;
  _$jscoverage['/manager.js'].lineData[118] = 0;
  _$jscoverage['/manager.js'].lineData[119] = 0;
  _$jscoverage['/manager.js'].lineData[122] = 0;
  _$jscoverage['/manager.js'].lineData[131] = 0;
  _$jscoverage['/manager.js'].lineData[138] = 0;
}
if (! _$jscoverage['/manager.js'].functionData) {
  _$jscoverage['/manager.js'].functionData = [];
  _$jscoverage['/manager.js'].functionData[0] = 0;
  _$jscoverage['/manager.js'].functionData[1] = 0;
  _$jscoverage['/manager.js'].functionData[2] = 0;
  _$jscoverage['/manager.js'].functionData[3] = 0;
  _$jscoverage['/manager.js'].functionData[4] = 0;
  _$jscoverage['/manager.js'].functionData[5] = 0;
  _$jscoverage['/manager.js'].functionData[6] = 0;
}
if (! _$jscoverage['/manager.js'].branchData) {
  _$jscoverage['/manager.js'].branchData = {};
  _$jscoverage['/manager.js'].branchData['77'] = [];
  _$jscoverage['/manager.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['78'] = [];
  _$jscoverage['/manager.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['79'] = [];
  _$jscoverage['/manager.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['82'] = [];
  _$jscoverage['/manager.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['84'] = [];
  _$jscoverage['/manager.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['89'] = [];
  _$jscoverage['/manager.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['91'] = [];
  _$jscoverage['/manager.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['96'] = [];
  _$jscoverage['/manager.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['115'] = [];
  _$jscoverage['/manager.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['117'] = [];
  _$jscoverage['/manager.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['117'][2] = new BranchData();
}
_$jscoverage['/manager.js'].branchData['117'][2].init(63, 21, '(t = uic.priority) > p');
function visit11_117_2(result) {
  _$jscoverage['/manager.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['117'][1].init(55, 29, 'uic && (t = uic.priority) > p');
function visit10_117_1(result) {
  _$jscoverage['/manager.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['115'][1].init(181, 13, 'i < cs.length');
function visit9_115_1(result) {
  _$jscoverage['/manager.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['96'][1].init(924, 29, 'component.isControl && parent');
function visit8_96_1(result) {
  _$jscoverage['/manager.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['91'][1].init(104, 17, '!ChildConstructor');
function visit7_91_1(result) {
  _$jscoverage['/manager.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['89'][1].init(538, 51, '!component.isControl && (xclass = component.xclass)');
function visit6_89_1(result) {
  _$jscoverage['/manager.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['84'][1].init(96, 15, 'component.xtype');
function visit5_84_1(result) {
  _$jscoverage['/manager.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['82'][1].init(166, 43, '!component.xclass && component.prefixXClass');
function visit4_82_1(result) {
  _$jscoverage['/manager.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['79'][1].init(25, 20, '!component.prefixCls');
function visit3_79_1(result) {
  _$jscoverage['/manager.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['78'][1].init(21, 30, '!component.isControl && parent');
function visit2_78_1(result) {
  _$jscoverage['/manager.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['77'][1].init(75, 9, 'component');
function visit1_77_1(result) {
  _$jscoverage['/manager.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/manager.js'].functionData[0]++;
  _$jscoverage['/manager.js'].lineData[8]++;
  var basePriority = 0, Manager, uis = {}, componentInstances = {};
  _$jscoverage['/manager.js'].lineData[25]++;
  Manager = {
  __instances: componentInstances, 
  addComponent: function(id, component) {
  _$jscoverage['/manager.js'].functionData[1]++;
  _$jscoverage['/manager.js'].lineData[35]++;
  componentInstances[id] = component;
}, 
  removeComponent: function(id) {
  _$jscoverage['/manager.js'].functionData[2]++;
  _$jscoverage['/manager.js'].lineData[43]++;
  delete componentInstances[id];
}, 
  'getComponent': function(id) {
  _$jscoverage['/manager.js'].functionData[3]++;
  _$jscoverage['/manager.js'].lineData[52]++;
  return componentInstances[id];
}, 
  'createComponent': function(component, parent) {
  _$jscoverage['/manager.js'].functionData[4]++;
  _$jscoverage['/manager.js'].lineData[75]++;
  var ChildConstructor, xclass;
  _$jscoverage['/manager.js'].lineData[77]++;
  if (visit1_77_1(component)) {
    _$jscoverage['/manager.js'].lineData[78]++;
    if (visit2_78_1(!component.isControl && parent)) {
      _$jscoverage['/manager.js'].lineData[79]++;
      if (visit3_79_1(!component.prefixCls)) {
        _$jscoverage['/manager.js'].lineData[80]++;
        component.prefixCls = parent.get('prefixCls');
      }
      _$jscoverage['/manager.js'].lineData[82]++;
      if (visit4_82_1(!component.xclass && component.prefixXClass)) {
        _$jscoverage['/manager.js'].lineData[83]++;
        component.xclass = component.prefixXClass;
        _$jscoverage['/manager.js'].lineData[84]++;
        if (visit5_84_1(component.xtype)) {
          _$jscoverage['/manager.js'].lineData[85]++;
          component.xclass += '-' + component.xtype;
        }
      }
    }
    _$jscoverage['/manager.js'].lineData[89]++;
    if (visit6_89_1(!component.isControl && (xclass = component.xclass))) {
      _$jscoverage['/manager.js'].lineData[90]++;
      ChildConstructor = Manager.getConstructorByXClass(xclass);
      _$jscoverage['/manager.js'].lineData[91]++;
      if (visit7_91_1(!ChildConstructor)) {
        _$jscoverage['/manager.js'].lineData[92]++;
        S.error('can not find class by xclass desc : ' + xclass);
      }
      _$jscoverage['/manager.js'].lineData[94]++;
      component = new ChildConstructor(component);
    }
    _$jscoverage['/manager.js'].lineData[96]++;
    if (visit8_96_1(component.isControl && parent)) {
      _$jscoverage['/manager.js'].lineData[97]++;
      component.setInternal('parent', parent);
    }
  }
  _$jscoverage['/manager.js'].lineData[100]++;
  return component;
}, 
  getConstructorByXClass: function(classNames) {
  _$jscoverage['/manager.js'].functionData[5]++;
  _$jscoverage['/manager.js'].lineData[109]++;
  var cs = classNames.split(/\s+/), p = -1, t, i, uic, ui = null;
  _$jscoverage['/manager.js'].lineData[115]++;
  for (i = 0; visit9_115_1(i < cs.length); i++) {
    _$jscoverage['/manager.js'].lineData[116]++;
    uic = uis[cs[i]];
    _$jscoverage['/manager.js'].lineData[117]++;
    if (visit10_117_1(uic && visit11_117_2((t = uic.priority) > p))) {
      _$jscoverage['/manager.js'].lineData[118]++;
      p = t;
      _$jscoverage['/manager.js'].lineData[119]++;
      ui = uic.constructor;
    }
  }
  _$jscoverage['/manager.js'].lineData[122]++;
  return ui;
}, 
  setConstructorByXClass: function(className, ComponentConstructor) {
  _$jscoverage['/manager.js'].functionData[6]++;
  _$jscoverage['/manager.js'].lineData[131]++;
  uis[className] = {
  constructor: ComponentConstructor, 
  priority: basePriority++};
}};
  _$jscoverage['/manager.js'].lineData[138]++;
  return Manager;
});
