//global variables
var tasks = [];
var debug = true;
setInterval(displayClock(), 1000);

$(function() {
    if (debug) {
        console.log('Document ready!');
    }
    //get tasks from the server
    getTasks();
});

//event listeners this will be called multiple times so .unbind is used to prevent douplicate clicks
function enable() {
    $('#post_task').unbind().on('click', postTask);
    $('.complete').unbind().on('click', putTask);
    $('.delete').unbind().on('click', warning);
    $("#new_task").unbind().keydown(function(event) {
        if (event.keyCode == 13) {
            $("#post_task").click();
        }
    });
}

//makes ajax get call to the server and pushes recieved tasks to the global tasks variable
function getTasks() {
    tasks = [];
    $.ajax({
        type: "GET",
        url: '/getTasks',
        success: function(response) {
            if (debug) {
                console.log('back from getTasks: ', response);
            }
            for (var i = 0; i < response.length; i++) {
                tasks.push(response[i]);
                //when tasks are recieved from the server they are printed to the DOM
            }
            displayTasks();
        },
        error: function() {
            if (debug) {
                console.log("error with ajax call");
            }
        }
    });
}

//makes ajax post to the server and then gets tasks to update the local task list
function postTask() {
    var newTask = {
        task: $('#new_task').val()
    };
    if (debug) {
        console.log('sending a new task ' + newTask);
    }
    $('#new_task').val('');
    $.ajax({
        type: "POST",
        url: '/postTask',
        data: newTask,
        success: function(response) {
            if (debug) {
                console.log('back from postTasks: ', response);
            }
            getTasks();
        },
        error: function() {
            if (debug) {
                console.log("error with ajax call");
            }
        }
    });
}

//makes put call to server
function putTask() {
    var updateTask = {
        id: this.getAttribute('data')
    };
    $.ajax({
        type: "PUT",
        url: '/putTask',
        data: updateTask,
        success: function(response) {
            if (debug) {
                console.log('back from postTasks: ', response);
            }
            //after a task is updated the current task list is requested from the server
            getTasks();
        },
        error: function() {
            if (debug) {
                console.log("error with ajax call");
            }
        }
    });
}

//display warning message before deleteing a task
//I know the instructions said to use vannilla JS but the built in confirm cant be stylized and is boring
function warning() {
    //hide everything on the DOM
    $('#display').hide();
    //change background to grey
    $("body").css("background-color", "silver");
    //pullin task id from data attribute
    var taskID = {
        id: this.getAttribute('data')
    };
    //display a modal asking if the user is sure they want to delete the task
    $('<div id="warning"></div>').appendTo('body')
        .html('<div><h1>Cyberman</h1> <h6>DELETE DELETE DELETE! <br>Are you sure you want to DELETE this task?</h6></div>')
        .dialog({
            modal: true,
            zIndex: 10000,
            autoOpen: true,
            width: '25%',
            buttons: {
                Yes: function() {
                    delTask(taskID);
                    $(this).dialog("close");
                },

                No: function() {
                    $(this).dialog("close");
                }
            },
            close: function(event, ui) {
                //when this window is closed the taks will be displayed again
                displayTasks();
                //remove the warning window
                $(this).remove();

            }
        });
    //make the warning window draggable because why not.
    $('.dialog').draggable();
}

//makes an ajacks call to delete a task
function delTask(taskID) {
    $.ajax({
        type: "DELETE",
        url: '/delTask',
        data: taskID,
        success: function(response) {
            if (debug) {
                console.log('back from delTasks: ', response);
            }
            getTasks();
        },
        error: function() {
            if (debug) {
                console.log("error with ajax call");
            }
        }
    });
}

//prints tasks to the DOM
function displayTasks() {
    if (debug) {
        console.log('now in display tasks');
    }
    $('#display').show();
    $("body").css("background-color", "white");
    //check to make sure there are tasks to display
    if (tasks.length > 0) {
        if (debug) {
            console.log("now printing tasks: " + tasks);
        }
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
    //display message if there are no tasks to display
    else {
        if (debug) {
            console.log('the length of tasks is: ' + tasks.length);
        }
        $('#tasks').html('<h3>No tasks to display at this time.</h3>');
    }
    //after everything is printed to the DOM enable the clickibles
    enable();
}

function displayClock() {
    //var clock=setInterval(displayClock(),1000);
    console.log('in display clock');
    var dt = new Date();
    var utcDate = dt.toUTCString();
    $('#clock').html('current time: '+utcDate);
    alert(utcDate);
}
