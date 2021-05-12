$(document).ready(function() {

    var columns = [{
        title: "Base",
        data: "base_number",
    }, {
        title: "Add 1",
        render: (data, type, row, meta) =>{
            return Number(row.base_number) + 1
        },
    }, {
        title: "Multiply 2",
        render: (data, type, row, meta) =>{
            return Number(row.base_number) * 2
        },
    }, {
        title: "Squared",
        render: (data, type, row, meta) =>{
            return Number(row.base_number) ** 2
        },
    },{
        title:"SomethingHard",
        render: (data, type, row, meta) =>{
            var start = new Date()
            while (new Date() - start < 100);
            return Number(row.base_number) ** 3
        }
    }];


    myTable = $('#example').DataTable({
        "sPaginationType": "full_numbers",
        ajax:"example13.txt",
        columns: columns,
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            columns:[0],
            saveType:"manual",
            validateDraw:'row'
        },
        buttons: []
    });


});
