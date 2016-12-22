$(function() {
    console.log('Document ready!');
    getTasks();
    enable();
});

function enable() {
    $('#post_task').unbind().on('click', postTask);
    $('.complete').unbind().on('click', putTask);
    $('.delete').unbind().on('click', delTask);
    $("#new_task").unbind().keydown(function(event) {
        if (event.keyCode == 13) {
            $("#post_task").click();
        }
    });
}

function getTasks() {
    tasks = [];
    $.ajax({
        type: "GET",
        url: '/getTasks',
        success: function(response) {
            console.log('back from getTasks: ', response);
            for (var i = 0; i < response.length; i++) {
                tasks.push(response[i]);
                printTasks(tasks);
                enable();
            }
        },
        error: function() {
            console.log("error with ajax call");
        }
    });
}

function postTask() {
    var newTask = {
        task: $('#new_task').val()
    };
    console.log('sending a new task ' + newTask);
    $('#new_task').val('');
    $.ajax({
        type: "POST",
        url: '/postTask',
        data: newTask,
        success: function(response) {
            console.log('back from postTasks: ', response);
            getTasks();
        },
        error: function() {
            console.log("error with ajax call");
        }
    });
}

function putTask() {
    var updateTask = {
        id: this.getAttribute('data')
    };
    $.ajax({
        type: "PUT",
        url: '/putTask',
        data: updateTask,
        success: function(response) {
            console.log('back from postTasks: ', response);
            getTasks();
        },
        error: function() {
            console.log("error with ajax call");
        }
    });
}

function delTask() {
    $('#display').hide();
    $('<div></div>').appendTo('body')
        .html('<div><h6>Cyberman: DELETE DELETE DELETE! Are you sure you want to DELETE this task?</h6></div>')
        .dialog({
            modal: true,
            title: 'Delete message',
            zIndex: 10000,
            autoOpen: true,
            width: '50%',
            resizable: false,
            buttons: {
                Yes: function() {
                    var delTask = {
                        id: this.getAttribute('data')
                    };
                    $.ajax({
                        type: "DELETE",
                        url: '/delTask',
                        data: delTask,
                        success: function(response) {
                            console.log('back from delTasks: ', response);
                            getTasks();
                        },
                        error: function() {
                            console.log("error with ajax call");
                        }
                    });
                    $(this).dialog("close");
                    $('#display').show();
                },
                No: function() {
                    $(this).dialog("close");
                    $('#display').show();
                }
            },
            close: function(event, ui) {
                $(this).remove();
                $('#display').show();
            }
        });
}

function printTasks(tasks) {
    console.log("now printing tasks: " + tasks);
    var allTasks = '<table> <tr><td>Task</td><td>Complete Task</td><td>Delete Task</td>';
    for (var i = 0; i < tasks.length; i++) {
        allTasks += '<tr><td  id="first" class=' + tasks[i].active + '>' + tasks[i].task + '</td>';
        allTasks += '<td><button type="button" class="complete ' + tasks[i].active + '_button" data="' +
            tasks[i].id + '"></button> </td>';
        allTasks += '<td><button type="button" class="delete" data="' + tasks[i].id +
            '"></button> </td>';
    }
    allTasks += '</table>';
    $('#tasks').html(allTasks);
}
