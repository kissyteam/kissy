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
  _$jscoverage['/manager.js'].lineData[33] = 0;
  _$jscoverage['/manager.js'].lineData[40] = 0;
  _$jscoverage['/manager.js'].lineData[49] = 0;
  _$jscoverage['/manager.js'].lineData[72] = 0;
  _$jscoverage['/manager.js'].lineData[74] = 0;
  _$jscoverage['/manager.js'].lineData[75] = 0;
  _$jscoverage['/manager.js'].lineData[76] = 0;
  _$jscoverage['/manager.js'].lineData[77] = 0;
  _$jscoverage['/manager.js'].lineData[79] = 0;
  _$jscoverage['/manager.js'].lineData[80] = 0;
  _$jscoverage['/manager.js'].lineData[81] = 0;
  _$jscoverage['/manager.js'].lineData[82] = 0;
  _$jscoverage['/manager.js'].lineData[86] = 0;
  _$jscoverage['/manager.js'].lineData[87] = 0;
  _$jscoverage['/manager.js'].lineData[88] = 0;
  _$jscoverage['/manager.js'].lineData[89] = 0;
  _$jscoverage['/manager.js'].lineData[91] = 0;
  _$jscoverage['/manager.js'].lineData[93] = 0;
  _$jscoverage['/manager.js'].lineData[94] = 0;
  _$jscoverage['/manager.js'].lineData[97] = 0;
  _$jscoverage['/manager.js'].lineData[106] = 0;
  _$jscoverage['/manager.js'].lineData[112] = 0;
  _$jscoverage['/manager.js'].lineData[113] = 0;
  _$jscoverage['/manager.js'].lineData[114] = 0;
  _$jscoverage['/manager.js'].lineData[115] = 0;
  _$jscoverage['/manager.js'].lineData[116] = 0;
  _$jscoverage['/manager.js'].lineData[119] = 0;
  _$jscoverage['/manager.js'].lineData[128] = 0;
  _$jscoverage['/manager.js'].lineData[135] = 0;
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
  _$jscoverage['/manager.js'].branchData['74'] = [];
  _$jscoverage['/manager.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['75'] = [];
  _$jscoverage['/manager.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['76'] = [];
  _$jscoverage['/manager.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['79'] = [];
  _$jscoverage['/manager.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['81'] = [];
  _$jscoverage['/manager.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['86'] = [];
  _$jscoverage['/manager.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['88'] = [];
  _$jscoverage['/manager.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['93'] = [];
  _$jscoverage['/manager.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['112'] = [];
  _$jscoverage['/manager.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['114'] = [];
  _$jscoverage['/manager.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/manager.js'].branchData['114'][2] = new BranchData();
}
_$jscoverage['/manager.js'].branchData['114'][2].init(65, 21, '(t = uic.priority) > p');
function visit11_114_2(result) {
  _$jscoverage['/manager.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['114'][1].init(57, 29, 'uic && (t = uic.priority) > p');
function visit10_114_1(result) {
  _$jscoverage['/manager.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['112'][1].init(188, 13, 'i < cs.length');
function visit9_112_1(result) {
  _$jscoverage['/manager.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['93'][1].init(943, 29, 'component.isControl && parent');
function visit8_93_1(result) {
  _$jscoverage['/manager.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['88'][1].init(106, 17, '!ChildConstructor');
function visit7_88_1(result) {
  _$jscoverage['/manager.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['86'][1].init(550, 51, '!component.isControl && (xclass = component.xclass)');
function visit6_86_1(result) {
  _$jscoverage['/manager.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['81'][1].init(98, 15, 'component.xtype');
function visit5_81_1(result) {
  _$jscoverage['/manager.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['79'][1].init(170, 43, '!component.xclass && component.prefixXClass');
function visit4_79_1(result) {
  _$jscoverage['/manager.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['76'][1].init(26, 20, '!component.prefixCls');
function visit3_76_1(result) {
  _$jscoverage['/manager.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['75'][1].init(22, 30, '!component.isControl && parent');
function visit2_75_1(result) {
  _$jscoverage['/manager.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].branchData['74'][1].init(78, 9, 'component');
function visit1_74_1(result) {
  _$jscoverage['/manager.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/manager.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/manager.js'].functionData[0]++;
  _$jscoverage['/manager.js'].lineData[8]++;
  var basePriority = 0, Manager, uis = {}, componentInstances = {};
  _$jscoverage['/manager.js'].lineData[25]++;
  Manager = {
  __instances: componentInstances, 
  addComponent: function(component) {
  _$jscoverage['/manager.js'].functionData[1]++;
  _$jscoverage['/manager.js'].lineData[33]++;
  componentInstances[component.get('id')] = component;
}, 
  removeComponent: function(component) {
  _$jscoverage['/manager.js'].functionData[2]++;
  _$jscoverage['/manager.js'].lineData[40]++;
  delete componentInstances[component.get('id')];
}, 
  getComponent: function(id) {
  _$jscoverage['/manager.js'].functionData[3]++;
  _$jscoverage['/manager.js'].lineData[49]++;
  return componentInstances[id];
}, 
  createComponent: function(component, parent) {
  _$jscoverage['/manager.js'].functionData[4]++;
  _$jscoverage['/manager.js'].lineData[72]++;
  var ChildConstructor, xclass;
  _$jscoverage['/manager.js'].lineData[74]++;
  if (visit1_74_1(component)) {
    _$jscoverage['/manager.js'].lineData[75]++;
    if (visit2_75_1(!component.isControl && parent)) {
      _$jscoverage['/manager.js'].lineData[76]++;
      if (visit3_76_1(!component.prefixCls)) {
        _$jscoverage['/manager.js'].lineData[77]++;
        component.prefixCls = parent.get('prefixCls');
      }
      _$jscoverage['/manager.js'].lineData[79]++;
      if (visit4_79_1(!component.xclass && component.prefixXClass)) {
        _$jscoverage['/manager.js'].lineData[80]++;
        component.xclass = component.prefixXClass;
        _$jscoverage['/manager.js'].lineData[81]++;
        if (visit5_81_1(component.xtype)) {
          _$jscoverage['/manager.js'].lineData[82]++;
          component.xclass += '-' + component.xtype;
        }
      }
    }
    _$jscoverage['/manager.js'].lineData[86]++;
    if (visit6_86_1(!component.isControl && (xclass = component.xclass))) {
      _$jscoverage['/manager.js'].lineData[87]++;
      ChildConstructor = Manager.getConstructorByXClass(xclass);
      _$jscoverage['/manager.js'].lineData[88]++;
      if (visit7_88_1(!ChildConstructor)) {
        _$jscoverage['/manager.js'].lineData[89]++;
        S.error('can not find class by xclass desc : ' + xclass);
      }
      _$jscoverage['/manager.js'].lineData[91]++;
      component = new ChildConstructor(component);
    }
    _$jscoverage['/manager.js'].lineData[93]++;
    if (visit8_93_1(component.isControl && parent)) {
      _$jscoverage['/manager.js'].lineData[94]++;
      component.setInternal('parent', parent);
    }
  }
  _$jscoverage['/manager.js'].lineData[97]++;
  return component;
}, 
  getConstructorByXClass: function(classNames) {
  _$jscoverage['/manager.js'].functionData[5]++;
  _$jscoverage['/manager.js'].lineData[106]++;
  var cs = classNames.split(/\s+/), p = -1, t, i, uic, ui = null;
  _$jscoverage['/manager.js'].lineData[112]++;
  for (i = 0; visit9_112_1(i < cs.length); i++) {
    _$jscoverage['/manager.js'].lineData[113]++;
    uic = uis[cs[i]];
    _$jscoverage['/manager.js'].lineData[114]++;
    if (visit10_114_1(uic && visit11_114_2((t = uic.priority) > p))) {
      _$jscoverage['/manager.js'].lineData[115]++;
      p = t;
      _$jscoverage['/manager.js'].lineData[116]++;
      ui = uic.constructor;
    }
  }
  _$jscoverage['/manager.js'].lineData[119]++;
  return ui;
}, 
  setConstructorByXClass: function(className, ComponentConstructor) {
  _$jscoverage['/manager.js'].functionData[6]++;
  _$jscoverage['/manager.js'].lineData[128]++;
  uis[className] = {
  constructor: ComponentConstructor, 
  priority: basePriority++};
}};
  _$jscoverage['/manager.js'].lineData[135]++;
  return Manager;
});
