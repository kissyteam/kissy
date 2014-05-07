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
if (! _$jscoverage['/control/manager.js']) {
  _$jscoverage['/control/manager.js'] = {};
  _$jscoverage['/control/manager.js'].lineData = [];
  _$jscoverage['/control/manager.js'].lineData[6] = 0;
  _$jscoverage['/control/manager.js'].lineData[7] = 0;
  _$jscoverage['/control/manager.js'].lineData[24] = 0;
  _$jscoverage['/control/manager.js'].lineData[32] = 0;
  _$jscoverage['/control/manager.js'].lineData[39] = 0;
  _$jscoverage['/control/manager.js'].lineData[48] = 0;
  _$jscoverage['/control/manager.js'].lineData[71] = 0;
  _$jscoverage['/control/manager.js'].lineData[73] = 0;
  _$jscoverage['/control/manager.js'].lineData[74] = 0;
  _$jscoverage['/control/manager.js'].lineData[75] = 0;
  _$jscoverage['/control/manager.js'].lineData[76] = 0;
  _$jscoverage['/control/manager.js'].lineData[78] = 0;
  _$jscoverage['/control/manager.js'].lineData[79] = 0;
  _$jscoverage['/control/manager.js'].lineData[80] = 0;
  _$jscoverage['/control/manager.js'].lineData[81] = 0;
  _$jscoverage['/control/manager.js'].lineData[85] = 0;
  _$jscoverage['/control/manager.js'].lineData[86] = 0;
  _$jscoverage['/control/manager.js'].lineData[87] = 0;
  _$jscoverage['/control/manager.js'].lineData[88] = 0;
  _$jscoverage['/control/manager.js'].lineData[90] = 0;
  _$jscoverage['/control/manager.js'].lineData[92] = 0;
  _$jscoverage['/control/manager.js'].lineData[93] = 0;
  _$jscoverage['/control/manager.js'].lineData[96] = 0;
  _$jscoverage['/control/manager.js'].lineData[105] = 0;
  _$jscoverage['/control/manager.js'].lineData[111] = 0;
  _$jscoverage['/control/manager.js'].lineData[112] = 0;
  _$jscoverage['/control/manager.js'].lineData[113] = 0;
  _$jscoverage['/control/manager.js'].lineData[114] = 0;
  _$jscoverage['/control/manager.js'].lineData[115] = 0;
  _$jscoverage['/control/manager.js'].lineData[118] = 0;
  _$jscoverage['/control/manager.js'].lineData[127] = 0;
  _$jscoverage['/control/manager.js'].lineData[134] = 0;
}
if (! _$jscoverage['/control/manager.js'].functionData) {
  _$jscoverage['/control/manager.js'].functionData = [];
  _$jscoverage['/control/manager.js'].functionData[0] = 0;
  _$jscoverage['/control/manager.js'].functionData[1] = 0;
  _$jscoverage['/control/manager.js'].functionData[2] = 0;
  _$jscoverage['/control/manager.js'].functionData[3] = 0;
  _$jscoverage['/control/manager.js'].functionData[4] = 0;
  _$jscoverage['/control/manager.js'].functionData[5] = 0;
  _$jscoverage['/control/manager.js'].functionData[6] = 0;
}
if (! _$jscoverage['/control/manager.js'].branchData) {
  _$jscoverage['/control/manager.js'].branchData = {};
  _$jscoverage['/control/manager.js'].branchData['73'] = [];
  _$jscoverage['/control/manager.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['74'] = [];
  _$jscoverage['/control/manager.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['75'] = [];
  _$jscoverage['/control/manager.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['78'] = [];
  _$jscoverage['/control/manager.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['80'] = [];
  _$jscoverage['/control/manager.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['85'] = [];
  _$jscoverage['/control/manager.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['87'] = [];
  _$jscoverage['/control/manager.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['92'] = [];
  _$jscoverage['/control/manager.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['111'] = [];
  _$jscoverage['/control/manager.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['113'] = [];
  _$jscoverage['/control/manager.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/control/manager.js'].branchData['113'][2] = new BranchData();
}
_$jscoverage['/control/manager.js'].branchData['113'][2].init(65, 21, '(t = uic.priority) > p');
function visit11_113_2(result) {
  _$jscoverage['/control/manager.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['113'][1].init(57, 29, 'uic && (t = uic.priority) > p');
function visit10_113_1(result) {
  _$jscoverage['/control/manager.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['111'][1].init(188, 13, 'i < cs.length');
function visit9_111_1(result) {
  _$jscoverage['/control/manager.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['92'][1].init(943, 29, 'component.isControl && parent');
function visit8_92_1(result) {
  _$jscoverage['/control/manager.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['87'][1].init(106, 17, '!ChildConstructor');
function visit7_87_1(result) {
  _$jscoverage['/control/manager.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['85'][1].init(550, 51, '!component.isControl && (xclass = component.xclass)');
function visit6_85_1(result) {
  _$jscoverage['/control/manager.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['80'][1].init(98, 15, 'component.xtype');
function visit5_80_1(result) {
  _$jscoverage['/control/manager.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['78'][1].init(170, 43, '!component.xclass && component.prefixXClass');
function visit4_78_1(result) {
  _$jscoverage['/control/manager.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['75'][1].init(26, 20, '!component.prefixCls');
function visit3_75_1(result) {
  _$jscoverage['/control/manager.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['74'][1].init(22, 30, '!component.isControl && parent');
function visit2_74_1(result) {
  _$jscoverage['/control/manager.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].branchData['73'][1].init(78, 9, 'component');
function visit1_73_1(result) {
  _$jscoverage['/control/manager.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/manager.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/control/manager.js'].functionData[0]++;
  _$jscoverage['/control/manager.js'].lineData[7]++;
  var basePriority = 0, Manager, uis = {}, componentInstances = {};
  _$jscoverage['/control/manager.js'].lineData[24]++;
  Manager = {
  __instances: componentInstances, 
  addComponent: function(component) {
  _$jscoverage['/control/manager.js'].functionData[1]++;
  _$jscoverage['/control/manager.js'].lineData[32]++;
  componentInstances[component.get('id')] = component;
}, 
  removeComponent: function(component) {
  _$jscoverage['/control/manager.js'].functionData[2]++;
  _$jscoverage['/control/manager.js'].lineData[39]++;
  delete componentInstances[component.get('id')];
}, 
  getComponent: function(id) {
  _$jscoverage['/control/manager.js'].functionData[3]++;
  _$jscoverage['/control/manager.js'].lineData[48]++;
  return componentInstances[id];
}, 
  createComponent: function(component, parent) {
  _$jscoverage['/control/manager.js'].functionData[4]++;
  _$jscoverage['/control/manager.js'].lineData[71]++;
  var ChildConstructor, xclass;
  _$jscoverage['/control/manager.js'].lineData[73]++;
  if (visit1_73_1(component)) {
    _$jscoverage['/control/manager.js'].lineData[74]++;
    if (visit2_74_1(!component.isControl && parent)) {
      _$jscoverage['/control/manager.js'].lineData[75]++;
      if (visit3_75_1(!component.prefixCls)) {
        _$jscoverage['/control/manager.js'].lineData[76]++;
        component.prefixCls = parent.get('prefixCls');
      }
      _$jscoverage['/control/manager.js'].lineData[78]++;
      if (visit4_78_1(!component.xclass && component.prefixXClass)) {
        _$jscoverage['/control/manager.js'].lineData[79]++;
        component.xclass = component.prefixXClass;
        _$jscoverage['/control/manager.js'].lineData[80]++;
        if (visit5_80_1(component.xtype)) {
          _$jscoverage['/control/manager.js'].lineData[81]++;
          component.xclass += '-' + component.xtype;
        }
      }
    }
    _$jscoverage['/control/manager.js'].lineData[85]++;
    if (visit6_85_1(!component.isControl && (xclass = component.xclass))) {
      _$jscoverage['/control/manager.js'].lineData[86]++;
      ChildConstructor = Manager.getConstructorByXClass(xclass);
      _$jscoverage['/control/manager.js'].lineData[87]++;
      if (visit7_87_1(!ChildConstructor)) {
        _$jscoverage['/control/manager.js'].lineData[88]++;
        S.error('can not find class by xclass desc : ' + xclass);
      }
      _$jscoverage['/control/manager.js'].lineData[90]++;
      component = new ChildConstructor(component);
    }
    _$jscoverage['/control/manager.js'].lineData[92]++;
    if (visit8_92_1(component.isControl && parent)) {
      _$jscoverage['/control/manager.js'].lineData[93]++;
      component.setInternal('parent', parent);
    }
  }
  _$jscoverage['/control/manager.js'].lineData[96]++;
  return component;
}, 
  getConstructorByXClass: function(classNames) {
  _$jscoverage['/control/manager.js'].functionData[5]++;
  _$jscoverage['/control/manager.js'].lineData[105]++;
  var cs = classNames.split(/\s+/), p = -1, t, i, uic, ui = null;
  _$jscoverage['/control/manager.js'].lineData[111]++;
  for (i = 0; visit9_111_1(i < cs.length); i++) {
    _$jscoverage['/control/manager.js'].lineData[112]++;
    uic = uis[cs[i]];
    _$jscoverage['/control/manager.js'].lineData[113]++;
    if (visit10_113_1(uic && visit11_113_2((t = uic.priority) > p))) {
      _$jscoverage['/control/manager.js'].lineData[114]++;
      p = t;
      _$jscoverage['/control/manager.js'].lineData[115]++;
      ui = uic.constructor;
    }
  }
  _$jscoverage['/control/manager.js'].lineData[118]++;
  return ui;
}, 
  setConstructorByXClass: function(className, ComponentConstructor) {
  _$jscoverage['/control/manager.js'].functionData[6]++;
  _$jscoverage['/control/manager.js'].lineData[127]++;
  uis[className] = {
  constructor: ComponentConstructor, 
  priority: basePriority++};
}};
  _$jscoverage['/control/manager.js'].lineData[134]++;
  return Manager;
});
