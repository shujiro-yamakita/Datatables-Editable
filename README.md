# DataTables-Editable
Simple table editor for jQuery.dataTables.

This pckage support add, delete and inline editing and send form to server via AJAX

## USAGE
Include following libraries in the project.

1. jQuery
2. jquery.dataTables(Greater than 1.10.8)
3. dataTables.buttons

Define a DataTable as usual.

Pass to the DataTable constructor at least `editable:true`.

You also need to pass `dom` and  `buttons` .

## OPTIONS
DataTables-Editable accept following options.

| Option | Type of accepted value | default | Description |
| --- | --- | --- | --- |
| `add` | boolean | `true` | Enable to add new line to table |
| `delete` | boolean | `true` | Enable to delete line from table |
| `columns` | boolean / array | `true` | Set column index to be editable. All columns are editable on default. |
| `rows` | boolean / array  | `true` | Set row index to be editable. All rows are editable on default. |
| `cells` | null / array | `null` | Set perticular cells to be editable. |
| [`inputType`](#inputType) | string | `text` | Set HTML input type for all editable cell. Following will be accepted `text` `number` `date` `select` `textarea` |
| [`saveType`] | string | `auto` | Set when to run saving method. `auto` Save data on every cell edit done.`manual` Save data when the "save" button is pushed |
| [`ajax`](#ajax) | object | | Set ajax properties. |
| [`keyData`](#keyData) | string | `false` | |
| [`validateDraw`](#validateDraw) | | `false` | |
| [`columnDefs`](#columnDefs) | array | `[]` | Set HTML input type and formulas for pericular column.|
| [`saveDoneCallback`] | function | | Callback start when saving on server succeed. |
| [`saveFailCallback`] | function | | Callback start when saving on server fail. |
| [`saveAlwaysCallback`] | function | | Callback start after saving to server method run. |

### inputType
`text`,`number`,`date`,`select`,`textarea`

Set the type and attributes of the input tab displayed at the time of input.  
In the case of select tag, additional settings are required to set options.  
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

### ajax

You can send edited data to server by setting _ajax_ option.  
Set at least _url_ and set others if you need.  

`url`(ajax.url)`string`-Set url to send data.

`type`(ajax.type)`string`-Set _post_ or _get_. "post" on Default.

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


## METHODS
DataTables-Editable has following methods.

#### editable().enabled()
Check dataTables-Editable is activated or not.

return true/false

#### editable().addToFormData(name, data)
Add To FormData object used in DataTalbes-Editable.

##### args  
`name`:property name

`data`:data

### editable().reConstructFormData(name, data)

### editable().setEditableColumns(array)
### editable().setEditableRows(array)
### editable().setEditableCells(array)
### editable().getEditableMap()

### editable().toggleValidateDraw()
### editable().save()

### editable().disable()
