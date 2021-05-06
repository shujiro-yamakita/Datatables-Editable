$(document).ready(function() {

    var columns = [{
        title: "Name",
    }, {
        title: "Position",
    }, {
        title: "Office",
    }, {
        title: "Extn.",
    }, {
        title: "Start date",
    }, {
        title: "Salary",
    }];


    myTable = $('#example').DataTable({
        "sPaginationType": "full_numbers",
        ajax:"example8.txt",
        columns: columns,
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            columns:[0,1,2,3,4,5],
            columnDefs:[
                {
                    target:[2],
                    inputType:"select",
                    formula:[
                        "Edinburgh",
                        "Tokyo",
                        "San Francisco",
                        "New York",
                        "London",
                        "Sidney",
                        "Singapore"
                    ]
                },
                {
                    target:[3],
                    inputType:'number',
                },
                {
                    target:[4],
                    inputType:'date',
                    format:'Y/m/d',
                },
            ],
        },
        buttons: []
    });


});
