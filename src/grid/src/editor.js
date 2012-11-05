﻿/**
 * @fileOverview This class specifies the definition for a cell editor of a grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/editor', function (S, Component) {

    var CLS_EDITOR = 'ks-grid-editor',
        CLS_EDITOR_ERROR = CLS_EDITOR + '-error',
		
        CLS_EDITOR_CONTROL = CLS_EDITOR + '-control',
		DATA_ERROR = 'data-error';

    /**
     * the render of grid's editor
     * @private
     */
    var GridEditorRender = Component.Render.extend({
        /**
         * @private
         */
        createDom:function () {
            var _self = this,
                el = _self.get('el'),
                tpl = _self.get('tpl');
            new S.Node(tpl).appendTo(el);
        }
    });

    /**
     * This is a base class of grid's editor,which can be used in column's configuration.
     * @name Grid.Editor
     * @constructor
     * @extends KISSY.Component.Controller
     */
    var GridEditor = Component.Controller.extend({

        /**
         * @private
         */
        bindUI:function () {
            var _self = this,
                binder = _self.get('binder'),
                
                events = _self.get('events');
               
            if (binder) {
                binder.call(this);
            }
            _self.bindControlEvent();
        },
		/**
		* 
		*/
		bindControlEvent : function(){
			var _self = this,
                el = _self.get('el'),
				control = _self.getEditControl(),
				triggerEvent = _self.get('triggerEvent'),
				validEvent = _self.get('validEvent');
				
			control.on(triggerEvent, function () {
                var hasError = _self.hasError(),
					text;
                if (!hasError) {
					text = _self._getControlText();
                    _self.fire('changed', {target:_self, text:text, value:_self.getValue(text)});
                }
            });
			
			control.on(validEvent,function(){
				var text = _self._getControlText(),
                    record = _self.get('record');
                _self.validEditor(text, record);
			});
			
			control.on('mouseenter',function(){
				_self.fire('editorenter',{target:_self});
			});
			control.on('mouseleave',function(){
				_self.fire('editorleave',{target:_self});
			});
			
		},
        /**
         * @protect
         * True to indicate that this editor contains the element
         */
        containsElement:function (element) {
            var _self = this,
                el = _self.get('el');
            return el.contains(element) || el[0] == element;
        },
        
        /**
         * make this editor's control focused
         */
        focus:function () {
            var _self = this,
                control = _self.getEditControl();
            if (control && control[0] && control[0].focus) {
                control[0].focus();
            }
        },
        /**
         * Get the element that the value in it.so as input,select,textarea and so on.
         * This element must have the method of 'val',so as Node,which can get or set value.
         * When you Inheritance this class,you can ovrride this method.
         */
        getEditControl:function () {
            var _self = this,
                el = _self.get('el');
            return el.one('.' + CLS_EDITOR_CONTROL);
        },
        /**
         * Get the user's input,and format it.
         * When you Inheritance this class,you can ovrride this method.
         */
        getValue:function (text) {
            var _self = this,
                formatter = _self.get('formatter');
            text = text || _self._getControlText();
            return formatter(text);
        },
        /**
         * Verify user input is correct
         * @return {Boolean}
         */
        hasError:function () {
            return this.get('el').hasClass(CLS_EDITOR_ERROR);
        },
        /**
        * get the error message of the validation.
        */
        getErrorMsg : function(){
            var _self = this,
				control = _self.getEditControl(),
				msg = control.attr(DATA_ERROR);
            return msg;
        },
        /**
         * Set the cell's value.
         * When you Inheritance this class,you can override this method.
         */
        setValue:function (v) {
            var _self = this,
                control = _self.getEditControl();
            control.val(v);
        },
		
		//remove the error status
		_clearError : function(){
			var _self = this,
				control = _self.getEditControl();
			_self.get('el').removeClass(CLS_EDITOR_ERROR);
			control.removeAttr(DATA_ERROR);
		},
        //the text of user's input
        _getControlText:function () {
            var _self = this,
                control = _self.getEditControl();
            return control.val();
        },
        //get the error of user's input
        _getError:function (text, record) {
            var _self = this,
                basicValidator = _self.get('basicValidator'),
                validator = _self.get('validator');
            record = record || _self.get('record');
            return basicValidator(text) || validator(text, record);
        },
		//set the error status
		_setError:function(errorMsg){
			var _self = this,
				control = _self.getEditControl();
			_self.get('el').addClass(CLS_EDITOR_ERROR);
			control.attr(DATA_ERROR,errorMsg);
		},
		
        /**
         * Verify user input is correct,and show error if there are any error.
         * @return {Boolean}
         */
        validEditor:function (text, record) {
            var _self = this, 
				
				errorMsg;
            text = text || _self._getControlText();
            errorMsg = _self._getError(text, record);
            if (errorMsg) {
                _self.fire('error', {target:_self, msg:errorMsg, text:text});
                _self._setError(errorMsg);
            } else {
                _self._clearError();
            }
            return !errorMsg;
        },
        //set the value of this component
        _uiSetValue:function (v) {
            var _self = this;
            v = v ? v.toString() : '';
            _self.setValue(v);
            _self.validEditor();
        },
        _uiSetRecord:function (v) {
            if (!v) {
                return;
            }
            var _self = this,
                field = _self.get('field');
            if (field) {
                _self.set('value', v[field]);
            }
        },
		/**
		* @private
		*/
		destructor:function(){
			
		}
    }, {
        ATTRS:/** * @lends Grid.Editor.prototype*/
        {
            /**
             * This is a default function which is used to verify user's input.
             * For example when the editor's type is 'number',You don't have to test the user input type is 'number'.
             * If there is any error,the return value is a message which is not an empty string.
             * This property is usually overridden by its subclass.
             * @type {Function}
             */
            basicValidator:{
                value:function (v) {
                    return '';
                }
            },
            /**
             * When you use custom editor,you can config the tpl and binder that bind event to the custom dom.
             * @type {Function}
             * @default null;
             */
            binder:{

            },
            /**
             * The initial set of data to apply to the tpl to update the content area of the Component.
             * @type {Object}
             * @default {}
             */
            data:{
                value:{}
            },
            /**
             * Verify if users can edit the cell, if can't edit, do not show.
             * @param {Object} v The data value of the underlying field.
             * @param {Object} record The record that user is editing.
             * @return {Boolean}
             */
            editFunction:{
                value:function (v, record) {
                    return false;
                }
            },
            /**
             * the collection of editor's events
             * @type {Array}
             */
            events:{
                value:[
                    /**
                     * @event changed
                     * Fires when this editor's value changed
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     * @param {String} text the user's input text
                     * @param {Object} value format the user's input text to value
                     */
                    'changed',
                    /**
                     * @event error
                     * Fires when this editor's value changed
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     * @param {String} msg the error msg of the user's input
                     * @param {String} text the user's input text
                     */
                    'error',
                    /**
                     * @event error
                     * Fires when this editor's value changed
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     * @param {String} msg the error msg of the user's input
                     * @param {String} text the user's input text
                     */
                    '',
                    /**
                     * @event editorenter
                     * Fires when mouse entered this editor
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     */
                    'editorenter',
                    /**
                     * @event editorleave
                     * Fires when mouse entered this editor
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     */
                    'editorleave'
                ]
            },
            /**
             * The field of the record,which is being editing.
             * @type {String}
             */
            field:{

            },
            /**
             * @private
             *
             */
            focusable:{
                value:false
            },
            /**
             * User input is usually text, so need to convert format.This is a function you can format user's input.
             * @type {Function}
             * @default function(v){return v;}
             */
            formatter:{
                value:function (v) {
                    return v;
                }
            },
			
            /**
             * The record which user is editing
             * @type {Object}
             * @default null
             */
            record:{
                value:null
            },
            /**
             * The built-in validation rules,followed by kissy 's validation framework.
             * @type {Object}
             * @default null
             */
            rules:{

            },
            /**
             * The event which triggers editing,this event default is binded to the input of this editor. Maybe :
             * <ul>
             *     <li>change</li>
             *     <li>blur</li>
             * </ul>
             */
            triggerEvent:{
                value:'change'
            },
			/**n 
			* The event which can fire validation of the user's input
			*/
			validEvent : {
				value:'keyup'
			},
            /**
             * An template used to create the internal structure inside this Component's encapsulating Element.
             * User can use the syntax of KISSY's template component.
             * Only in the configuration of the editor.
             * @type {String}
             * <pre>
             *    '&lt;input type="text" class="ks-grid-editor-control" /&gt;'
             * </pre>
             */
            tpl:{
                view:true,
                value:'<input type="text" class="' + CLS_EDITOR_CONTROL + '"/>'
            },
            /**
             * This is a function which is used to verify user's input.
             * @type {Function}
             * @default
             *    <pre>function(v){ return '';}</pre>
             */
            validator:{
                value:function (v) {
                    return '';
                }
            },
            /**
             * The data value of the underlying field.
             * When the editor showed,the value of the cell was be set in this component.
             * After user's editing,the value of this component was be set to the cell.
             * @type {Object}
             */
            value:{
                //get the value of this component
                getter:function () {
                    return this.getValue();
                }
            },
            /**
             * @private
             */
            xrender:{
                value:GridEditorRender
            }
        }
    }, {
        xclass:'grid-editor',
        priority:1
    });

	/**
     * This is a subclass of grid's editor,which can be used in column's configuration.
     * @name Grid.Editor.Text
     * @constructor
     * @extends KISSY.Component.Controller
     */
	var textEditor = GridEditor.extend({},{
		xclass:'grid-text-editor',
        priority:2
	});
	
	var numberEditor = GridEditor.extend({
		
	},{
		ATTRS:/** * @lends Grid.Editor.Text.prototype*/
        {
			/**
			* @override
			*/
			basicValidator : {
				value : function(v){
					var n = Number(v);
					if(isNaN(n)){
						return '不是有效的数字！';
					}
					return '';
				}
			},
			/**
			* @override
			*/
			formatter : {
				value : function(v){
					return Number(v);
				}
			}
		}
	
	},{
		xclass:'grid-number-editor',
        priority:2
	});
	
    return GridEditor;
}, {
    requires:['component']
});