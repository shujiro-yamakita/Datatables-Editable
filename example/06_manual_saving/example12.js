$(document).ready(function() {

    var columns = [{
        title: "Id",
        data: "id",
    }, {
        title: "Name",
        data: "name",
    }, {
        title: "Position",
        data:"position",
    }, {
        title: "Office",
        data:"office",
    }, {
        title: "Extn.",
        data:"extn",
    }, {
        title: "Start date",
        data:"start_date",
    }, {
        title: "Salary",
        data:"salary",
    }];


    myTable = $('#example').DataTable({
        "sPaginationType": "full_numbers",
        ajax:"example12.txt",
        columns: columns,
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            ajax:{
                url:"example.php",
                data:{
                    user:"username",
                    dateTime: new Date(),
                }
            },
            onSave:(xhr, status, errorThrows) => {
                console.log(xhr)
            },
            keyData:'id',
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
            saveType:"manual",
            validateDraw:"table",
        },
        buttons: []
    });


});
