$(document).ready(function() {

    var columns = [ {
        title:"id",
    },{
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
        ajax:"example9.txt",
        columns: columns,
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            ajax:{
                url:"example.php",
            },
            onSave:(xhr, status, errorThrows) => {
                console.log(xhr)
            },
            keyData:'0',
            columns:[1,2,3,4,5,6],
            columnDefs:[
                {
                    target:[3],
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
                    target:[4],
                    inputType:'number',
                },
                {
                    target:[5],
                    inputType:'date',
                    format:'Y/m/d',
                },
            ],
        },
        buttons: []
    });


});
