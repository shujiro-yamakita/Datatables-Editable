(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;

    var _instance = 0;

    var Editable = function( dt, opts )
    {
        if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
            throw( "Warning: Editable requires DataTables 1.10.8 or greater");
        }

        // User and defaults configuration object
        this.c = $.extend( true, {},
            DataTable.defaults.editable,
            Editable.defaults,
            opts
        );

        /**
        * @namespace Settings object which contains customisable information for Editable instance
        */
        this.s = {
            /** @type {DataTable.Api} DataTables' API instance */
            dt: new DataTable.Api( dt ),

            VDSwitch: 1,

            /** @type {String} Unique namespace for events attached to the document */
            namespace: 'editable-table_'+(_instance++),

            /** @type {object} FormData Object to send server via ajax*/
            fd: new FormData(),

            insCount:0,

            state:[],

            /**
            * Enabled setting
            * @type 。 /.,{Boolean}
            */
            enabled: false,
        };

        /* Constructor logic */
        this._constructor();
    }


    $.extend( Editable.prototype, {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Public methods (exposed via the DataTables API below)
        */
        enabled: function ()
        {
            return this.s.enabled;
        },


        enable: function ( flag )
        {

            if ( flag === false ) {
                return this.disable();
            }

            this.s.enabled = true;

            this._focusListener();

            return this;
        },

        disable: function ()
        {
            this.s.enabled = false;

            this._removeClasses();
            this._focusListenerRemove();
            this._buttonsInactivate();

            return this;
        },

        setEditableColumns : function (array)
        {
            this.c.columns = array;

            this._constructTargetCheckColumns();
            this._constructTargetMaps();

            return this;
        },

        setEditableRows : function (array)
        {
            this.c.rows = array;

            this._constructTargetCheckRows();
            this._constructTargetMaps();

            return this;
        },

        setEditableCells : function (array)
        {
            this.c.cells = array;

            this._constructTargetCheckCells();
            this._constructTargetMaps();

            return this;
        },

        reInilializeFormData: function(key, data = null)
        {
            this.c.ajax.data = {};
            this.s.fd = new FormData();
            if(typeof(key) === "object"){
                for(let i in key){
                    this.c.ajax.data[i] = key[i];
                }
            } else {
                this.c.ajax.data[key] = data
            }

            this._initializeFormData();
        },

        toggleValidateDraw: function()
        {
            if(this.s.VDSwitch === 0){
                this.s.VDSwitch = 1;
            } else {
                this.s.VDSwitch = 0;
            }

            return this.s.dt;
        },

        addToFormData: function(key, data = null)
        {
            if(typeof(key) === "object"){
                for(let i in key){
                    this.s.fd.append(i, key[i])
                }
            } else {
                this.s.fd.append(key,data)
            }

            this._save()
        },

        getEditableMap: function()
        {
            return this.c.map;
        },

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Constructor
        */
        _constructor: function ()
        {
            const _this = this;
            var dt = this.s.dt;


            // Make the instance accessible to the API
            dt.settings()[0]._oEditable = this;

            // Language setting
            this.lang = $.extend(true, {} ,
                this.c.language,
                dt.settings()[0].oLanguage.editable,
            );

            // create map of cells to be editabled
            if(!this._initializeMap()){
                return;
            };

            // initialize
            this._initializeColumnDefs();

            // ajax設定の確認
            if( this.c.ajax.url === "unset" ){
                console.warn(this.lang.console.ajax.no_ajax)
            } else {
                if (this.c.ajax.url === "unset"){
                    console.warn(this.lang.console.ajax.no_url)
                }
            }

            // FormDataの初期化
            this._initializeFormData();

            /**
             * DOM settings
             */
            // deploy 'submit', 'cancel' and 'auto redraw' buttons
            if(this.c.saveType === "manual"){
                this._deployButtonsForManualSave()
            }

            if(this.c.delete === true){
                this._deployDeleteButton()
            }

            if(this.c.add === true){
                this._deployAddButton()
                this._deployInsertWindow()
            }



            // activate focusListener
            if ( this.c.enabled !== false ) {
                this.enable();
            } else {
                return;
            }



            $(dt.table().node()).addClass('dataTable_editable')
            $(dt.table().node()).addClass(this.s.namespace)

            $(dt.table().node()).attr('tabindex', -1)


            dt
            .on( 'destroy.editable', function () {

                _this._focusListenerRemove();
                _this._removeClasses();
            })
        },

        /**
         * initialize map of editable cells base on setting
         * @return {boolean}
         */
        _initializeMap: function(){
            if(!(this._initializeEditableCells() ?
                this._initializeEditableColumns() ?
                this._initializeEditableRows()?
                this._integrateMap() : false : false :false
            )){
                console.error(this.lang.console.system.not_activated)
                return false;
            } else {
                return true;
            }
        },

        /**
         * initialize editable cells based on setting
         * @return boolean
         */
        _initializeEditableCells: function()
        {
            const cl = this.c.cells;

            if(!cl){
                this.c._oCells = [];
                return true;
            }

            if(!Array.isArray(cl)){
                console.error(this.lang.console.cells.not_array);
                return false;
            }

            for(let i = cl.length - 1; i >= 0; i--){
                if(!"row" in cl[i] || !"col" in cl[i]){
                    console.error(this.lang.console.cell.wrong_elements);
                    return false;
                }
            }
            this.c.cells.sort(function(a, b){
                if(a.row - b.row < 0){
                    return -1
                }
                if(a.row - b.row > 0){
                    return 1
                }
                if(a.row === b.row){
                    if(a.col < b.col){
                        return -1
                    }
                    if(a.col > b.col){
                        return 1
                    }
                    return 0
                }
            });

            this.c._oCells = this.c.cells.slice();
            return true;
        },

        /**
         * _initialize editable columns based on etting
         * @return {boolean}
         */
        _initializeEditableColumns: function()
        {
            const dt = this.s.dt;
            this.c._oColumns = [];

            if( this.c.columns === true){
                for(let i = 0; i < dt.columns()[0].length; i++){
                    if(dt.columns(i).visible()[0] === true){
                        this.c._oColumns.push(i);
                    }
                }
            } else if (Array.isArray(this.c.columns)) {
                if(this.c.columns.length > dt.columns()[0].length){
                    console.error(this.lang.console.columns.too_many_elements)
                    return false;
                }
                for(let i = 0; i < this.c.columns.length; i++){
                    if(isNaN(this.c.columns[i])){
                        console.error(this.lang.console.columns.not_number)
                        return false;
                    }
                    if(this.c.columns[i] >= dt.columns()[0].length){
                        console.error(this.lang.console.columns.wrong_index);
                        return false;
                    }
                    if(dt.columns(this.c.columns[i]).visible()[0] === false){
                        continue;
                    }
                    this.c._oColumns.push(this.c.columns[i])
                }
                this.c._oColumns.sort((first, second) => first - second);
            } else if(this.c.columns === false){
                return true;
            } else {
                console.error(this.lang.console.columns.not_array)
                return false;
            }

            return true;
        },

        /**
         * initialize editable rows based on etting
         * @return {boolean}
         */
        _initializeEditableRows: function()
        {
            const dt = this.s.dt;
            this.c._oRows = [];

            if(this.c.rows === true) {
                for(let i = 0; i < dt.rows()[0].length; i++){
                    if(dt.rows()[0].includes(i) === true){
                        this.c._oRows.push(i);
                    }
                }
            } else if(Array.isArray(this.c.rows)){
                    for(let i = 0; i < this.c.rows.length; i++){
                        if(isNaN(this.c.rows[i])){
                            console.error(this.lang.console.rows.not_number)
                            return false;
                        }
                        this.c._oRows.push(this.c.rows[i])
                    }
                    this.c._oRows.sort((first, second) => first - second);
            } else if(this.c.rows === false){
                return true
            } else {
                console.error(this.lang.console.rows.not_array)
                return false;
            }

            return true;
        },

        /**
         * integrate settings of cells, columns and rows and create map of all editable cells
         * @return {boolean}
         */
        _integrateMap : function()
        {
            const dt = this.s.dt;
            const columns = this.c._oColumns;
            const rows = this.c._oRows;
            const cells = this.c._oCells;
            const oRow = row => dt.rows({order:'applied'})[0].indexOf(row)
            this.c.map = {};

            for(let i = 0; i < rows.length; i++){
                this.c.map[oRow(rows[i])] = columns.slice();
            }
            for(let i = 0; i < cells.length; i++){
                if(oRow(cells[i].row) in this.c.map){
                    this.c.map[oRow(cells[i].row)].push(cells[i].col)
                } else {
                    this.c.map[oRow(cells[i].row)] = [cells[i].col];
                }
            }
            for(let i = 0; i < rows.length; i++){
                this.c.map[oRow(rows[i])].sort((a, b) => a - b);
            }

            return true;
        },

        /**
         * initalize input type settings from columnDefs option
         */
        _initializeColumnDefs : function()
        {
            const dt = this.s.dt;
            this.c._oColumnDefs = [];
            for(let i = 0; i < dt.columns()[0].length; i++){
                this.c._oColumnDefs[i] = {
                    inputType:this.c.inputType,
                    formula:this.c.formula,
                    format:this.c.format,
                }
                for(let d of this.c.columnDefs){
                    if(d.target.includes(i)){
                        $.extend(this.c._oColumnDefs[i], d)
                        delete this.c._oColumnDefs[i].target
                    }
                }
            }
        },

        /**
         * initialize FormData Object
         * @return {[type]} [description]
         */
        _initializeFormData:function()
        {
            this.s.fd = new FormData()
            this.s.insCount = 0;
            if( this.c.ajax.data ){
                const d = this.c.ajax.data;
                for( let key in d){
                    this.s.fd.append(key, d[key])
                }
            }
        },

        _stateSave:function(){
            const _this = this;
            this.s.state = []

            this.s.dt.rows().every( function(rowIdx) {
                if(Array.isArray(this.data())){
                    _this.s.state[rowIdx] = []
                } else {
                    _this.s.state[rowIdx] = {}
                }
                for(let i in this.data()){
                    _this.s.state[rowIdx][i] = this.data()[i]
                }
            })
        },

        _stateLoad:function(){
            const dt = this.s.dt;
            const qn = Editable.queryName;
            const current = {};
            if($(qn.FOCUS).length > 0){
                current.column = dt.cell(qn.FOCUS).index().column;
                current.row = dt.rows({order:'applied'})[0].indexOf(dt.row($(qn.FOCUS)).index())
            } else {
                current.row = Object.keys(this.c.map)[0]
                current.column = Object.keys(current.row)[0]
            }

            dt.rows().remove();
            for(let i in this.s.state){
                if(Array.isArray(this.s.state[i])){
                    dt.row.add([...this.s.state[i]])
                } else {
                    dt.row.add({...this.s.state[i]});
                }
            }

            this.s.insCount = 0;

            dt.draw();
            this._focusCell(current);
        },

        /**
         *
         * @return {[type]} [description]
         */
        _deployButtonsForManualSave:function()
        {
            const dt = this.s.dt;
            const _this = this;

            const VDMSG = {
                0:{
                    message: type => this.lang.message.stopRedraw,
                },
                1:{
                    message: type => this.lang.message.startRedraw(type),
                }
            }

            if('_buttons' in dt.context[0]){
                dt.button().add(0, {
                    action : function (e, dt, button , config) {
                        if(confirm(_this.lang.message.submit)){
                            _this._save(true);
                        }
                    },
                    className:"editable-buttons",
                    text:this.lang.button.submit,
                })
                dt.button().add(1, {
                    action : function (e, dt, button, config) {
                        if(confirm(_this.lang.message.cancel)){
                            _this._stateLoad();
                            _this._initializeFormData();
                        }
                    },
                    className:"editable-buttons",
                    text:this.lang.button.cancel,
                })
                if(this.c.validateDraw){
                    dt.button().add(2, {
                        action : function(e, dt, button, config) {
                            _this.toggleValidateDraw();
                            alert(VDMSG[_this.s.VDSwitch].message(_this.c.validateDraw));
                            button.text(_this.lang.button.validate)
                             .toggleClass('buttonOn')
                            if(_this.s.VDSwitch){
                                dt.rows().invalidate().draw();
                            }
                        },
                        className:"editable-buttons buttonOn",
                        text:this.lang.button.validate,
                    })
                }
            }
        },

        _deployAddButton:function()
        {
            const dt = this.s.dt;
            const _this = this;

            dt.button().add(0, {
                action : function(e, dt, button, config) {
                    _this._showInsertWindow();
                },
                text:this.lang.button.add,
                className:"editable-buttons",
            })
        },

        _deployDeleteButton:function()
        {
            const dt = this.s.dt;
            const _this = this;

            dt.button().add(0, {
                action : function(e, dt, button, config) {
                    if(confirm(_this.lang.message.confirmDelete)){
                        _this._deleteLine()
                    }
                },
                text:this.lang.button.delete,
                className:"editable-buttons",
            })
        },

        _deployInsertWindow:function()
        {
            const dt = this.s.dt;
            const oDefs = this.c._oColumnDefs;
            const dtId = dt.settings()[0].sTableId
            const toUp = str => str.charAt(0).toUpperCase() + str.slice(1);

            const box = $('<div></div>')
                .addClass(Editable.className.INSERT_BOX)
                .attr('id', `${dtId}-editable-insert-wrapper`);

            const title = $('<p></p>')
                .addClass('title')
                .text(this.lang.message.insertTitle)

            $(box).append(title);


            for(let i = 0; i < dt.columns()[0].length; i++){
                if(this.c._oColumns.includes(i)) {
                    const line = $('<p></p>').addClass('insertline');
                    const title = $('<span></span>').addClass('inserttitle')
                    .text($(dt.column(i).header()).text() + ":");
                    const name = dt.context[0].aoColumns[i].mData;

                    const input = this["_input" + toUp(oDefs[i].inputType)]("dum", oDefs[i])

                    input.attr('name', name);
                    input.addClass('input');

                    $(line).append(title);
                    $(line).append(input);
                    $(box).append(line);
                }
            }

            const btnarea = $('<p></p>').addClass('buttons');
            const submit = $('<button></button>')
                .addClass('insert-submit')
                .text(this.lang.button.submit);
            const cancel = $('<button></button>')
                .addClass('insert-cancel')
                .text(this.lang.button.cancel);
            $(btnarea).append(submit);
            $(btnarea).append(cancel);

            $(box).append(btnarea);

            $('body').append(box);

        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Private methods
        */

       _deleteLine:function(){
           const dt = this.s.dt;
           const c = this.c;
           const _this = this;

           const target = $(`.${this.s.namespace} ${Editable.queryName.FOCUS}`);

           this._addDeleteToFormData(target);

           dt.row(target).remove().draw();

           this._save()
       },

       _addDeleteToFormData:function(target, val){
           const dt = this.s.dt;

           const key = this.c.keyData ? dt.row(target).data()[this.c.keyData] : dt.row(target).index();

           this.s.fd.append(`deletes[]`, key);
       },

       _showInsertWindow:function(){
           const dt = this.s.dt;
           const dtId = dt.settings()[0].sTableId

           $(`#${dtId}-editable-insert-wrapper`)
           .css('display','block')

           $(`#${dtId}-editable-insert-wrapper .input:eq(0)`).trigger('focus')

           $(document).on('focusin',(e) => {
               if(!e.target.closest(`#${dtId}-editable-insert-wrapper`)){
                    $(`#${dtId}-editable-insert-wrapper .input:eq(0)`).trigger('focus')
               }
           })
       },

       _hideInsertWindow:function(){
           const dt = this.s.dt;
           const dtId = dt.settings()[0].sTableId;

           $(`#${dtId}-editable-insert-wrapper`)
               .css('display','none');
           $(`#${dtId}-editable-insert-wrapper :input`).each((i, e) =>{
               $(e).val("")
           })

           $(document).off('focusin',(e) => {
               if(!e.target.closest(`#${dtId}-editable-insert-wrapper`)){
                    $(`#${dtId}-editable-insert-wrapper .input:eq(0)`).trigger('focus')
               }
           })
       },

       _insertLine:function(){
           const dt = this.s.dt;
           const dtId = dt.settings()[0].sTableId
           let set = {};
           let arflag = true;

           for(let i = 0; i < dt.columns()[0].length; i++){
               const name = dt.context[0].aoColumns[i].mData
               if(typeof(name) !== "number"){
                   arflag = false;
               }
               const val = $(`#${dtId}-editable-insert-wrapper :input[name=${name}]`).val() || null;
               const type = $(`#${dtId}-editable-insert-wrapper :input[name=${name}]`).attr('type');

               if(type === "date"){
                   const date = new Date(val);
                   let formed_val;
                   for(let def of this.c.columnDefs){
                       if(def.target.includes(i)){
                           formed_val = this._formatDate(date, def.format || this.c.format)
                       }
                   }
                   set[name] = formed_val;
               } else if(type === "number"){
                   set[name] = Number(val)
               } else {
                   set[name] = val;
               }
           }
           if(arflag){
              set =  Object.keys(set).map(key => set[key])
           }
           dt.row.add(set).draw();
       },

       _addInsertToFormData:function(){
           const dt = this.s.dt;
           const dtId = dt.settings()[0].sTableId
           const unique = Date.now();

           for(let i = 0; i < dt.columns()[0].length; i++){
               const name = dt.context[0].aoColumns[i].mData
               const val = $(`#${dtId}-editable-insert-wrapper :input[name=${name}]`).val() || "";

               this.s.fd.append(`inserts[${this.s.insCount}][${name}]`,val);
           }
           this.s.insCount++;
       },

       _activateCell:function(target)
       {
           const dt = this.s.dt;

           const col = dt.column(target).index();
           const row = dt.rows({order:'applied'})[0].indexOf(dt.row(target).index());

           const oDefs = this.c._oColumnDefs;

           if(!row in this.c.map){
               return false;
           } else if(!this.c.map[row].includes(col)) {
               return false;
           }

           const toUp = str => str.charAt(0).toUpperCase() + str.slice(1);

           const box = this["_input" + toUp(oDefs[col].inputType)](target, oDefs[col])

           $(box).outerWidth( $(target).outerWidth() );
           $(box).outerHeight( $(target).outerHeight() );
           $(box).addClass(Editable.className.WRAPPER);

           $(dt.cell(target).nodes()).append(box);
           $(Editable.queryName.WRAPPER).trigger('focus');
           $(Editable.queryName.WRAPPER).trigger('select');

           return true;

       },

       /**
        * Create HTML input(select, textarea) tag
        */
       /**
        * Create input tag of type text
        * @param  {[any]} target cell
        * @param  {[object]} def    options
        * @return {[dom]}        DOM
        */
       _inputText: function(target, def){
           const ret =  $('<input></input>')
           .attr('type', 'text')
           .val(this.s.dt.cell(target).data())
           for(let i in def.attr){
               $(ret).attr(i, def.attr[i])
           }
           return ret;
       },

       /**
        * Create input tag of type number
        * @param  {any} target cell
        * @param  {object} def    options
        * @return {dom}        DOM
        */
       _inputNumber: function(target, def){
           const ret =  $('<input></input>')
           .attr('type', 'number')
           .val(this.s.dt.cell(target).data())
           for(let i in def.attr){
               $(ret).attr(i, def.attr[i])
           }
           return ret;
       },

       /**
        * Create input tag of type date
        * @param  {[any]} target  cell
        * @param  {[object]} def    options
        * @return {dom}
        */
       _inputDate: function(target, def){
           const date = new Date(this.s.dt.cell(target).data());
           const value = this._formatDate(date, 'Y-m-d');
           const ret = $('<input></input>')
           .attr('type', 'date')
           .val(value)
           for(let i in def.attr){
               $(ret).attr(i, def.attr[i])
           }
           return ret;
       },

       /**
        * [description]
        * @param  {object} date   date object
        * @param  {string} format format of date
        * @return {string}        formed date
        */
       _formatDate:function(date, format){
           const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
           let ret = format.replace('Y', date.getFullYear());
           ret = ret.replace('y', ("" + date.getFullYear()).slice(-2));
           ret = ret.replace('n', (date.getMonth() + 1));
           ret = ret.replace('M', MONTHS[date.getMonth()]);
           ret = ret.replace('m', ("00" + (date.getMonth() + 1)).slice(-2));
           ret = ret.replace('d', ("00" + (date.getDate())).slice(-2));
           ret = ret.replace('j', date.getDate());

           return ret;

       },

       /**
        * Create select tag and option tag
        * @param  {any} target cell
        * @param  {object} def    options
        * @return {dom}        DOM
        */
       _inputSelect:function(target, def){
           const data = this.s.dt.cell(target).data();
           const ret = $('<select></select>');
           for(let i in def.attr){
               $(ret).attr(i, def.attr[i])
           }
           for(let i of def.formula){
               if(typeof i === "object"){
                   $(ret).append($('<option></option>')
                     .val(i.val).text(i.text)
                     .attr(data == i.val ? {'selected':'on'} : {})
                   )
               } else {
                   $(ret).append($('<option></option>')
                        .text(i)
                        .attr(data == i ? {'selected':'on'} : {})
                    )
               }
           }
           return ret
       },

       /**
        * Create textarea tag
        * @param  {any} target cell
        * @param  {object} def    options
        * @return {dom}        DOM
        */
       _inputTextarea:function(target, def){
           const data = this.s.dt.cell(target).data();
           const ret = $('<textarea></textarea>').text(data);
           for(let i in def.attr){
               $(ret).attr(i, def.attr[i])
           }
           return ret
       },


       /***** セレクター操作関連 ***************/
       /**
        * 押しっぱなしのキー判別
        * @param  {[type]} keyCode [description]
        * @return {[type]}         [description]
        */
       _statePress:function(keyCode){
           this.keyOnPress = keyCode;
       },

       /**
        * 選択中のセルを入力可能状態にする
        * @return {[type]} [description]
        */
       _focusOn:function(){
           const target = $(`.${this.s.namespace} ${Editable.queryName.FOCUS}`)[0];

           this._activateCell(target);
       },

       /**
        * [description]
        * @param  {[type]} current [description]
        * @param  {[type]} way     [description]
        * @param  {[type]} status  [description]
        * @return {[type]}         [description]
        */
       _getRow:function(current, way, status){
           const w = way;
           if(way === 0){
               return current.row;
           }
           const map = this.c.map;
           let i = current.row;
           const keys = Object.keys(map);
           const posible = [];

           while( i >= Number(keys[0]) && i <= Number(keys[keys.length - 1])){
               if(keys.includes(String(i+w))){
                   if(map[i + w].includes(current.column)){
                       if(status === "nearest"){
                           return i + w;
                       } else {
                           posible.push(i + w)
                       }
                   }
               }
               i += w;
           }
           posible.sort((a, b) => a- b);
           if(status === "min" && posible.length > 0){
               return posible[0]
           }
           if(status === "max" && posible.length > 0){
               return posible[posible.length - 1]
           }

           return current.row;
       },

       _getColumn:function(current, way, status){
           const w = way;
           if(way === 0){
               return current.column;
           }
           const mapRow = this.c.map[current.row];
           let i = current.column;
           const posible = [];

           while( i >= mapRow[0] && i <= mapRow[mapRow.length - 1]){
               if(mapRow.includes(i + w)){
                   if(status === "nearest"){
                       return i + w
                   } else {
                       posible.push(i + w)
                   }
               }
               i += w
           }

           posible.sort((a, b) => a- b);
           if(status === "min" && posible.length > 0){
               return posible[0]
           }
           if(status === "max" && posible.length > 0){
               return posible[posible.length - 1]
           }

           return current.column
       },

       _move:function(way, rememberFlag = false){
           const dt = this.s.dt;
           const qn = Editable.queryName;

           const ways = {
               up: {row:-1, column:0},
               down:{row:1, column:0},
               right:{row:0, column:1},
               left:{row:0, column:-1},
               stay:{row:0,column:0},
           }

           const current = {};
           current.column = dt.cell(qn.FOCUS).index().column;
           current.row = dt.rows({order:'applied'})[0].indexOf(dt.cell(qn.FOCUS).index().row)

           if(rememberFlag && !this.tempBase){
               this.tempBase={
                   row:current.row,
                   column:current.column,
               }
           }

           const cell = {
               column:this._getColumn(current, ways[way].column, "nearest"),
               row:this._getRow(current, ways[way].row, "nearest")
           }

           if(rememberFlag && cell.column === current.column){
               this._lineFeed();
           } else {
               this._focusCell(cell, rememberFlag);
           }

       },

       _andFocus:function(callback){
           const dt = this.s.dt;
           const namespace = '.'+this.s.namespace;
           const q = Editable.queryName;
           dt.off('blur'+namespace, q.WRAPPER)
           this._checkInputData().then(()=>{
               callback()
           }).then(() => {
               this._focusOn();
           }).then(() => {
               const _this = this;
               dt.on('blur'+namespace, q.WRAPPER, function(){
                   _this._checkInputData()
               })
           })
       },

       _moveAndRemember:function(way){
           this._move(way, true);
       },

       _moveAndRememberAndFocus:function(way){
           this._andFocus(() => {
               this._move(way, true);
           })
       },

       _moveAndFocus:function(way){
           this._andFocus(() => {
               this._move(way, false);
           })
       },

       _lineFeed:function(){
           if(!this.tempBase){
               this._move('down');
               return
           }
           const cell = {
               row:this._getRow(this.tempBase, 1, "nearest"),
               column:this.tempBase.column
           }

           this._focusCell(cell, false);
       },

       _lineFeedAndFocus:function(){
           this._andFocus(() => {
               this._lineFeed();
           })
       },

       _go:function(where){
           const dt = this.s.dt;
           const qn = Editable.queryName;
           const map = this.c.map;
           const rows = Object.keys(map);
           const current = {};
           current.column = dt.cell(qn.FOCUS).index().column;
           current.row = dt.rows({order:'applied'})[0].indexOf(dt.row($(qn.FOCUS)).index())


           const wheres = {
               home: {row:Number(rows[0]), column:map[rows[0]][0]},
               end:{row:rows[rows.length - 1], column:map[rows[rows.length - 1]][map[rows[rows.length - 1]].length - 1]},
               top: {row:this._getRow(current, -1, "min"), column:current.column},
               bottom: {row:this._getRow(current, 1, "max"), column:current.column},
               leftEnd:{ row:current.row, column:this._getColumn(current, -1, 'min')},
               rightEnd:{ row:current.row, column:this._getColumn(current, 1, 'max')},
               stay: { row:current.row, column:current.column},
           }

           this._focusCell(wheres[where]);
       },

       _focusCell:function(cell, rememberFlag = false){
           const dt = this.s.dt;
           const cn = Editable.className;
           const qn = Editable.queryName;

           const target = {
               row:dt.rows({order:'applied'})[0][cell.row],
               column:cell.column,
           }

           $(dt.table().container()).find(qn.FOCUS).removeClass(cn.FOCUS);
           dt.cells().nodes().each((i) => {
               $(i).removeClass(cn.FOCUS);
           })
           $(dt.cell(target.row, target.column).node()).addClass(cn.FOCUS)
           if(this._checkFixedColumns()){
               $(dt.cell(target.row ,target.column).fixedNode()).addClass(cn.FOCUS);
           }

           this._jumpPage(cell.row)
           this._scrollToCell(target);

           if(!rememberFlag){
               this.tempBase = null;
           }
       },

       _jumpPage:function(rowIndex){
           const dt = this.s.dt;
           if(rowIndex >= dt.page.info().start && rowIndex < dt.page.info().end){
               return;
           };

           for(let i = 0; i < dt.page.info().pages; i++){
               dt.page(i);
               if(rowIndex >= dt.page.info().start && rowIndex < dt.page.info().end){
                   dt.draw('page');
                   return;
               }
           }
       },

       _scrollToCell:function(target){
           const dt = this.s.dt;
           const sbody = this._checkFixedColumns()
                        ? $($(dt.cell(target).fixedNode()).parents('div')[0])
                        :  $($(dt.cell(target).node()).parents('div')[0])
           const dtwrap = $(dt.tables().nodes()).parents('.dataTables_wrapper')
           const tcell = dt.cell(target.row, target.column).nodes();
           const pos = $(tcell).position();

           const leftWrapper = dtwrap.find('.DTFC_LeftBodyWrapper').outerWidth() || 0;

           if(pos.top < 0){
               sbody.scrollTop(sbody.scrollTop() + pos.top);
           }
           if(pos.top + $(tcell).outerHeight() > sbody.height()){
               sbody.scrollTop(sbody.scrollTop() + pos.top - sbody.height() + $(tcell).outerHeight())
           }
           if(pos.left < 0 + leftWrapper){
               sbody.scrollLeft(sbody.scrollLeft() + pos.left - leftWrapper)
           }
           if(pos.left + $(tcell).outerWidth() > sbody.outerWidth()){
               sbody.scrollLeft(sbody.scrollLeft() + pos.left - sbody.width() + $(tcell).outerWidth())
           }
       },

       _checkInputData:function(){

           const dt = this.s.dt;

           const target = $(`.${this.s.namespace} ${Editable.queryName.FOCUS}`);

           const wrap = $(target).find(Editable.queryName.WRAPPER)
           const org_val = dt.cell(target).data();

           const formed_val = this._formValue(target);

           if(org_val == formed_val){
               const promise = new Promise((resolve, reject)=>{
                   resolve(wrap.remove());
               });
               return promise;
           }else{
               dt.cell( target ).data(formed_val)
               this._controllDrawing(target)
               this._addToFormData(target,formed_val)
               return this._save().then(()=>{
                   wrap.remove()
               })
           }
       },

       _formValue:function(target){
           const dt = this.s.dt;
           const c = this.c;
           const wrap = $(target).find(Editable.queryName.WRAPPER)
           let formed_val;

           if($(wrap).attr('type') === "date"){
               const col = dt.cell(target).index().column;
               const date = new Date($(wrap).val());
               for(let def of c.columnDefs){
                   if(def.target.includes(col)){
                       formed_val = this._formatDate(date, def.format || this.c.format)
                   }
               }
           }else if($(wrap).attr('type') === "number"){
               formed_val = Number($(wrap).val())
           } else {
               formed_val = $(wrap).val();
           }

           return formed_val
       },

       _addToFormData:function(target, val){
           const dt = this.s.dt;

           const key = this.c.keyData ? dt.row(target).data()[this.c.keyData] : dt.row(target).index();
           const tcol = dt.columns()[0].indexOf(dt.column(target).index());
           const name = dt.context[0].aoColumns[tcol].mData
           this.s.fd.append(`updates[${key}][${name}]`, val);
       },

       _controllDrawing:function(target){

           const dt = this.s.dt;
           const v = this.c.validateDraw;
           const on = this.s.VDSwitch;
           const sbody = $($(dt.cell(target).node()).parents('div')[0]);
           const cs = {
               top:sbody.scrollTop(),
               left:sbody.scrollLeft()
           };

           if( v === "row" && on){
               dt.row( target ).invalidate().draw();
               sbody.scrollTop(cs.top).scrollLeft(cs.left);
           } else if( v === "table" && on){
               dt.rows().invalidate().draw();
               sbody.scrollTop(cs.top).scrollLeft(cs.left);
           }


       },

       _revertChange:function(){
           const dt = this.s.dt;
           const namespace = '.'+this.s.namespace;
           const q = Editable.queryName;
           const target = $(namespace +" " + q.FOCUS);
           const wrap = $(target).find(q.WRAPPER)
           const _this = this;


           dt.off('blur'+namespace, q.WRAPPER)
           const promise = new Promise((resolve, reject) => {
               resolve(wrap.remove())
           }).then(() => {
               dt.on('blur'+namespace, q.WRAPPER, function(){
                   _this._checkInputData()
               })
               $(namespace).trigger('focus');
           })
           return promise
       },

       _removeClasses:function(){
           const dt = this.s.dt;
           const c = Editable.className;
           const q = Editable.queryName;

           $(dt.table().node()).removeClass(this.s.namespace);
           $(dt.table().node()).find(q.WRAPPER).remove();
           $(dt.table().node()).find(q.FOCUS).removeClass(c.FOCUS);

       },

       _save:function(hardFlag = false){
           const _this = this;

           if(this.c.saveType === "auto" || hardFlag ){
               if(this.c.ajax.url !== "unset"){
                   return this._ajaxSave();
               } else {
                   const promise = new Promise((resolve, reject) => {
                       resolve(
                           _this._stateSave(),
                           _this._stateLoad()
                       );
                   })
                   return promise;
               }
           } else {
               const promise =  new Promise((resolve, reject) => {
                   resolve()
               })

               return promise;

           }
       },

       _ajaxSave: function(){
           this._screenLock('start')
           return $.ajax({
               url:this.c.ajax.url,
               type:this.c.ajax.type || 'post',
               data:this.s.fd,
               processData:false,
               contentType:false,
           })
           .done((xhr, status, errorThrown) => {
               this._stateSave();
               this.c.onSaveDone(xhr, status, errorThrown)
           }).fail((xhr, status, errorThrown)=>{
               alert('saving data failed');
               this.c.onSaveFailed(xhr, status, errorThrown)
           }).always((xhr, status, errorThrown) => {
               this._stateLoad();
               this._initializeFormData();
               this._screenLock('stop');
               this.c.onSave(xhr, status, errorThrown)
           })
       },



       /**
        * Controll Screen Lock
        * @param  {string} state 'start' to lock screen or 'stop' to unlock screen
        * @return {[type]}       [description]
        */
       _screenLock:function(state){
           const overScreen = $('<div></div>')
            .attr('id','dataTable_editable_screenLock')
            .append($('<span></span>')
                .attr('id','des_text')
                .text('Saving')
            );

            const addPeriod = ()=> {
                const bef = $('#des_text').text();
                $('#des_text').text(`${bef}.`)
            }

            const _this = this;

            if(state === "start"){
                $('body').append(overScreen);
                setTimeout( function callee(){
                    addPeriod();
                    if(_this._timeout_id === null) return;
                    _this._timeout_id = setTimeout(callee, 1000)
                }, 1000)
            } else if(state === "stop"){
                _this._timeout_id = null;
                $('#dataTable_editable_screenLock').remove();
            }
       },


       /**
        * Check if FixedColumns Expansion is applied to the table
        * @return {boolean} [description]
        */
       _checkFixedColumns : function()
       {
           const dt = this.s.dt;

           if('_oFixedColumns' in dt.context[0]){
               return true;
           } else {
               return false;
           }
       },


        /**
        * Attach suitable listeners (based on the configuration) that will attach
        * and detach the Editable handle in the document.
        *
        * @private
        */
        _focusListener: function ()
        {
            const __this = this;
            const dt = this.s.dt;
            const namespace = "."+this.s.namespace;
            const c = Editable.className;
            const q = Editable.queryName;

            const wrapper = () => {return $(q.WRAPPER).length > 0};
            const focus = () => {return $(q.FOCUS).length > 0};

            this._focusListenerRemove();

            $(document)
            .on('keydown', `${namespace}`, function(e){
                if(wrapper()){
                    let f = Editable.functionKeysForWrapper[e.keyCode];
                    if(__this.keyOnPress){
                        f = Editable.functionKeysWithStatePressForWrapper[__this.keyOnPress][e.keyCode];
                    }
                    if(f !== undefined){
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        __this[f.func](f.arguments);
                    }
                } else if(focus()){
                    let f = Editable.functionKeysForFocus[e.keyCode];
                    if(__this.keyOnPress){
                        f = Editable.functionKeysWithStatePressForFocus[__this.keyOnPress][e.keyCode];
                    }
                    if(f !== undefined){
                        e.preventDefault();
                        __this[f.func](f.arguments);
                    }
                }

            })
            .on('keyup', namespace, function(e){
                if(Editable.functionKeysForUp.indexOf(e.keyCode) >= 0){
                    __this.keyOnPress = false;
                }
            });

            dt
            .on('click'+namespace, `td${q.FOCUS}:not(:has(${q.WRAPPER}))`, function(){
                __this._activateCell(this);
            })
            .on('click'+namespace, 'td', function(){
                const col = dt.column(this).index();
                const row = dt.rows({order:'applied'})[0].indexOf(dt.row(this).index())
                if( row in __this.c.map && __this.c.map[row].includes(col)){
                    __this.tempBase = null;
                    __this._focusCell({row:row,column:col});
                }
            })
            .on('blur'+namespace, q.WRAPPER, function(){
                __this._checkInputData()
            })
            .on('order.dt', function(){
                __this._initializeMap();
            })


            .on('xhr', function (e, settings, json, xhr) {
                xhr.then(()=>{
                    __this._stateSave();
                    __this._initializeMap();
                })
            })

            const dtId = dt.settings()[0].sTableId


            $(`#${dtId}-editable-insert-wrapper`)
            .on('click', '.insert-submit', function(){
                if((confirm('Add data to the table?'))){
                    __this._insertLine();

                    __this._addInsertToFormData();

                    __this._hideInsertWindow();

                    __this._save()
                }
            })
            .on('click', '.insert-cancel', function(){
                __this._hideInsertWindow();
            })

        },


        _focusListenerRemove: function ()
        {
            const dt = this.s.dt;
            const namespace = "."+this.s.namespace

            $(document).off(namespace)
            dt.off(namespace);
            $(dt.table().body()).off( namespace );
            $(document.body).off( namespace );
        },

        _buttonsInactivate: function ()
        {
            const dt = this.s.dt;
            $(dt.button(0).node()).prop('disabled', true);
            $(dt.button(1).node()).prop('disabled', true);
            $(dt.button(2).node()).prop('disabled', true);
        }

    });

    /**
    * Editable version
    *
    * @static
    * @type      String
    */
    Editable.version = '1.0.0';


    /**
    * Editable defaults
    *
    * @namespace
    */
    Editable.defaults = {

        /** @type {Boolean} Enable Editable on load */
        enabled: true,

        add:true,

        delete:true,

        /** @type {string} default target columns */
        columns: true,

        /** @type {string} default target rows */
        rows: true,

        /** @type {string} default target cells */
        cells: null,

        /** @type {String} default data name for key to make form data*/
        keyData:false,

        /** @type {string} default wrap input type */
        inputType: "text",

        /** @type {string} default dateFormat to display */
        format:"Y-m-d",

        /** @type {Boolean} default draw type*/
        validateDraw: false,

        /** @type {String} default save type */
        saveType:"auto",

        /** @type {Array} */
        columnDefs:[],

        ajax:{
            url:"unset",
            type:"post",
        },

        onSaveDone:(xhr, status, errorThrown) => {

        },

        onSaveFail:(xhr, status, errorThrown) => {

        },

        onSave:(xhr, status, errorThrown) => {

        },

        language: {
            "console":{
                "system" : {
                    "not_activated" : "DataTables-Editable is not enabled"
                },
                "ajax" : {
                    "no_ajax" : "Warning! Anything you edit on the table not to be saved anywhere becouse the 'ajax' options are not set.",
                    "no_url" : "Warning! Please set url for saving methods otherwise nothing will be saved"
                },
                "cells" : {
                    "not_array" : "Error! 'cells' option must be set in array of objects which contains 'row' and 'col'",
                    "wrong_elements": "Error! elements of cell option does not includes 'row' or 'col' ",
                },
                "columns": {
                    "too_many_elements" : "Error! Too many elements are set on 'columns' option. If you want to set all columns editable, do not set 'columns' option.",
                    "not_number" : "Error! The 'columns' option you set includes elements which is not a Number.",
                    "wrong_index" : "Error! The 'columns' option includes index which does not exists on table.",
                    "not_array" : "Error! 'columns' option must be set by Array. If you want to set all columns editable, do not set 'columns' option.",
                },
                "rows": {
                    "not_number" : "Error! The 'rows' option you set includes elements which is not a Number.",
                    "not_array" : "Error! 'rows' option must be set by Array. If you want to set all rows editable, do not set 'rows' option.",
                }
            },
            "button" : {
                "add" : "add",
                "delete" : "delete",
                "submit" : "submit",
                "cancel" : "cancel",
                "validate" : "auto redraw "
            },
            "message" : {
                "submit" : "Save all changes?",
                "cancel" : "Clear all changes not saved?",
                "stopRedraw" : "Stopped auto redrawing",
                "startRedraw" : (type) => `Redraw table and target ${type} will be redrawn on every cell edit`,
                "confirmDelete": "Delete selected line?",
                "insertTitle":"Please insert values"
            }
        }

    };

    /*
    * classnames
     */
     Editable.className = {
         'WRAPPER' : 'editable-wrapper',
         'FOCUS' : 'editable-focus',
         'INSERT_BOX' : 'editable-insert-wrapper',
     }

     Editable.queryName = {
         'WRAPPER' : `.${Editable.className.WRAPPER}`,
         'FOCUS' : `.${Editable.className.FOCUS}`,
         'INSERT_BOX' : `.${Editable.className.INSERT_BOX}`,
     }

     //keyStatus
     Editable.functionKeysForFocus = {
         9:{ //tab
             func:'_moveAndRemember',
             arguments:'right',
         },
         13:{ //Enter
             func:'_lineFeed',
             arguments:'down',
         },
         16:{ //shift
             func:'_statePress',
             arguments:16,
         },
         17:{ //ctrl
             func:'_statePress',
             arguments:17,
         },
         33:{ //pageup
             func:'_go',
             arguments:'end',
         },
         34:{ //pagedown
             func:'_go',
             arguments:'end',
         },
         35:{ //end
             func:'_go',
             arguments:'end',
         },
         36:{ //home
             func:'_go',
             arguments:'home',
         },
         37:{ //左矢印
             func:'_move',
             arguments:'left',
         },
         38:{ //上矢印
             func:'_move',
             arguments:'up',
         },
         39:{ //右矢印
             func:'_move',
             arguments:'right',
         },
         40:{ //下矢印
             func:'_move',
             arguments:'down',
         },
         113:{ //F2
             func:'_focusOn',
             araguments:null,
         }
     }

     Editable.functionKeysForWrapper = {
         9:{ //tab
             func:'_moveAndRememberAndFocus',
             arguments:'right',
         },
         13:{ //Enter
             func:'_lineFeedAndFocus',
             arguments:'down',
         },
         16:{ //shift
             func:'_statePress',
             arguments:16,
         },
         17:{ //ctrl
             func:'_statePress',
             arguments:17,
         },
         27:{ //esc
             func:'_revertChange',
             arguments:null,
         },
     }

     Editable.functionKeysForUp = [
         16, //shift
         17, //ctrl
     ];

     Editable.functionKeysWithStatePressForFocus = {
         16:{ //shift
             9:{ //tab
                 func:'_move',
                 arguments:'left',
             },
             13:{ //Enter
                 func:'_move',
                 arguments:'up',
             },
         },
         17:{ //ctrl
             37:{ //ctrl + left arrow
                 func:'_go',
                 arguments:'leftEnd',
             },
             38:{ // ctrl + up arrow
                 func:'_go',
                 arguments:'top',
             },
             39:{ // ctrl + right arrow
                 func:'_go',
                 arguments:'rightEnd',
             },
             40:{ // ctrl + down arrow
                 func:'_go',
                 arguments:'bottom',
             }
         }
     }

     Editable.functionKeysWithStatePressForWrapper = {
         16:{ //shift
             9:{ //tab
                 func:'_moveAndFocus',
                 arguments:'left',
             },
             13:{ //Enter
                 func:'_moveAndFocus',
                 arguments:'up',
             },
         },
         17:{
             13:{ //Enter
                 func:'_checkInputData',
                 arguments:null,
             },
         }
     }

    /*
    * API
    */
    const Api = $.fn.dataTable.Api;


    // Doesn't do anything - Not documented
    Api.register( 'editable()', function () {
        return this;
    } );

    Api.register( 'editable().enabled()', function () {
        var ctx = this.context[0];

        return ctx._oEditable ?
        ctx._oEditable.enabled() :
        false;
    } );

    Api.register( 'editable().enable()', function ( flag ) {
        return this.iterator( 'table', function ( ctx ) {
            if ( ctx._oEditable ) {
                ctx._oEditable.enable( flag );
            }
        });
    });

    Api.register( 'editable().addToFormData()', function (key, data) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.addToFormData(key, data)
        }
    });

    Api.register( 'editable().getEditableMap()', function () {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             return ctx._oEditable.getEditableMap()
        }
    });

    Api.register( 'editable().reConstructFormData()', function (key, data) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.reConstructFormData(key, data)
        }
    });

    Api.register( 'editable().setEditableColumns()', function (array) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.setEditableColumns(array)
        }
    });

    Api.register( 'editable().setEditableRows()', function (array) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.setEditableRows(array)
        }
    });

    Api.register( 'editable().setEditableCells()', function (array) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.setEditableCells(array)
        }
    });

    Api.register( 'editable().toggleValidateDraw()', function () {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             return ctx._oEditable.toggleValidateDraw()
        }
    });

    Api.register( 'editable().save()', function () {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.save()
        }
    });

    Api.register( 'editable().disable()', function () {
        return this.iterator( 'table', function ( ctx ) {
            if ( ctx._oEditable ) {
                ctx._oEditable.disable();
            }
        });
    });

    $(document).on( 'preInit.dt.editable', function (e, settings, json) {
        if ( e.namespace !== 'dt' ) {
            return;
        }

        var init = settings.oInit.editable;
        var defaults = DataTable.defaults.editable;

        if ( init || defaults ) {
            var opts = $.extend( {}, init, defaults );

            if ( init.enabled !== false ) {
                new Editable( settings, opts );
            }
        }
    });


    // Alias for access
    DataTable.Editable = Editable;
    DataTable.editable = Editable;


    return Editable;
}));
