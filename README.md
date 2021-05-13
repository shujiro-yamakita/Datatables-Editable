# DataTables-Editable
Simple table editor for jQuery.dataTables.

This pckage support adding line, deleting line, direct editing of a cell and send form to server via ajax

## USAGE
Include following libraries in the project.

1. jQuery
2. jquery.dataTables(Greater than 1.10.8)
3. dataTables.buttons

Define a DataTable as usual.

Pass to the DataTable constructor at least `editable:true`.

You also need to pass `dom` and  `buttons` .

## Structure of data to be transmitted
The data to be sent will be sent with different names by updating, inserting, or deleting the data.  
The keyData that represents a row is the row number by default, but can be changed by setting option.

    {
        updates:{
            keyData : {
                name : data
            },
            keyData:{
                name : data
            },
        },
        inserts:[
            {
                name : data,
                name : data,...
            },
        ],
        deletes:[
            keyData , keyData, ....
        ]
    }

## OPTIONS
DataTables-Editable accept following options.

| Option | Type of accepted value | default | Description |
| --- | --- | --- | --- |
| `add` | boolean | `true` | Enable to add new row to table |
| `delete` | boolean | `true` | Enable to delete row from table |
| `columns` | boolean / array | `true` | Sets the index of the columns that allows editing. All columns are editable on default. |
| `rows` | boolean / array  | `true` | Set row index of the rows that allows editing. All rows are editable on default. |
| `cells` | null / array | `null` | Set perticular cells to be editable. |
| [`inputType`](#inputType) | string | `text` | Set HTML input type for all editable cell. Following will be accepted `text` `number` `date` `select` `textarea` |
| `attr` | object | `{}` | Add attirbute to the input tag |
| `format` | object | `Y-m-d` | Set the format when changed on the input tag of type date |
| `formula` | object | `{}` | Setting option tags when using select tag |
| `columnDefs` | array | `[]` | Set HTML input type and other settings for pericular column.|
| [`saveType`](#saveType) | string | `auto` | Set when to run saving method.   `auto` Save data on every cell edit done.  `manual` Save data when the "save" button is pushed |
| [`ajax`](#ajax) | object | | Set ajax properties. |
| [`keyData`](#keyData) | string / boolean | `false` | Set data to use unique key of data to send |
| [`validateDraw`](#validateDraw) | string / boolean | `false` | Redraw rows or tables when editing cells when using manual mode. Set `row` or `table` |
| [`onSave`](#onSave (onSaveDone, onSaveFailed)) | function | | Callback start when saving on server done. |
| [`onSaveDone`](#onSave (onSaveDone, onSaveFailed)) | function | | Callback start when saving on server successfully done. |
| [`onSaveFailed`](#onSave (onSaveDone, onSaveFailed)) | function | | Callback start when saving on server failed. |

### inputType
`text`,`number`,`date`,`select`,`textarea`

Set the type of the input tag displayed at the time of input.
To customise input tag, `attr`,`foramt`,`formula` options are ready.
In the case of select tag, format option is required to set option tags.  
To change the input method for each column, set it with the columnDefs option.

simple example  

    var table = $('#example').DataTable({
        ajax:"example.json",
        dom: 'Bfrtip',
        editable:{
            inputType:"number",
            attr:{
                "min": 1,
                "max": 9999,
            }
        },
        buttons: []
    });


For more , see source of "example".

### saveType
`auto` `manual`

Set'manual' if you want to save your changes manually. Autosave is turned off and the'save' and'cancel' buttons appear, allowing you to decide on changes and revert to before changes.

### ajax

You can send edited data to server by setting _ajax_ option.  
Set at least _url_ and set others if you need.  

`url`(ajax.url)`string`-Set url to send data.

`type`(ajax.type)`string`-Set _"post"_ or _"get"_. _"post"_ on Default.

`data`(ajax.data)`object`-If there is data you want to send in addition to the edited data of the table, set the data option.  

simple example  

    var table = $('#example').DataTable({
        ajax:"example.json",
        dom: 'Bfrtip',
        editable:{
            ajax:{
                url:"example10.php",
                type:"post",
                data:{
                    user:"username",
                    date:"2021-05-07",
                }
            },
        },
        buttons: []
    });


### keyData

The data sent has a unique key value. By default, the table row number is used as the key.
_keyData_ option allows you to set the value of a specific data in row as a key.

_*CAUTION It will NOT be checked whether the data in the set has a unique value or not_.


### validateDraw

### onSave (onSaveDone, onSaveFailed)

Callback runs after saving data to server via ajax.

## METHODS
DataTables-Editable has following methods.  
Please wait for a while until the explanation is completed

### editable().enabled()
Check dataTables-Editable is activated or not.

return true/false

### editable().addToFormData(name, data)
Add To FormData object used in DataTalbes-Editable.

##### args  
`name`:property name

`data`:data

### editable().reInitializeFormData(name, data)
### editable().setEditableColumns(array)
### editable().setEditableRows(array)
### editable().setEditableCells(array)
### editable().getEditableMap()
### editable().toggleValidateDraw()
### editable().save()
### editable().disable()
