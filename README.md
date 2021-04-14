# DataTables-Editable
Simple table editor for jQuery.dataTables.

This pckage support add, delete and inline editing and send form to server via AJAX

## USAGE
Include following libraries in the project(Necessary)

1. jQuery(Greater than 1.10.8)
2. jquery.dataTables

Follwing libraries may be helpful(Recommended);
1. dataTables.buttons

Define a DataTable as usual.

Pass to the DataTable constructor at least `editable:true`.

If you use buttons plug-in, you also need to pass `dom` and  `buttons` .

## OPTIONS
DataTables-Editable accept following options.

| Option | Type of accepted value | default | Description |
| --- | --- | --- | --- |
| [`add`](#add) | boolean | `true` | Enable to add new line to table |
| [`delete`](#delete) | boolean | `true` | Enable to delete line from table |
| [`columns`](#columns) | boolean / array | `true` | Set column index to be editable. All columns are editable on default. |
| [`rows`](#rows) | boolean / array  | `true` | Set row index to be editable. All rows are editable on default. |
| [`cells`](#cells) | null / array | `null` | Set perticular cells to be editable. |
| [`inputType`](#inputType) | string | `text` | Set HTML input type for all editable cell. Following will be accepted `text` `number` `date` `select` `textarea` |
| [`saveType`](#saveType) | string | `auto` | Set when to run saving method. `auto` Save data on every cell edit done.`manual` Save data when the "save" button is pushed |
| [`ajax`](#ajax) | object | | Set ajax properties. |
| [`keyData`](#keyData) | string | `false` | |
| [`validateDraw`](#validateDraw) | | `false` | |
| [`columnDefs`](#columnDefs) | array | `[]` | Set HTML input type and formulas for pericular column.|

#### add
#### delete

#### columns
#### rows
#### cells
#### inputType
#### saveType
#### ajax
#### keyData
#### validateDraw
#### columnDefs

## METHODS
DataTables-Editable has following methods.

#### editable().enabled()
Check dataTables-Editable has been activated or not.

return true/false

#### editable().addToFormData(name, data)
Add To FormData object used in DataTalbes-Editable.

args
name:property name

data:data

#### editable().reConstructFormData(name, data)

#### editable().setEditableColumns(array)
#### editable().setEditableRows(array)
#### editable().setEditableCells(array)
#### editable().getEditableMap()

#### editable().toggleValidateDraw()
#### editable().save()

#### editable().disable()



