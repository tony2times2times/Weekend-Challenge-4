//global variables
var tasks = [];
var debug = true;

$(function() {
    if (debug) {
        console.log('Document ready!');
    }
    //get tasks from the server
    getTasks();
});

//event listeners this will be called multiple times so .unbind is used to prevent douplicate clicks
function enable() {
    $('#post_task').unbind().on('click', createTask);
    $('.complete').unbind().on('click', putTask);
    $('.delete').unbind().on('click', warning);
    $("#new_task").unbind().keydown(function(event) {
        if (event.keyCode == 13) {
            $("#post_task").click();
        }
    });
    $("#due").unbind().keydown(function(event) {
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
            timeLeft();
        },
        error: function() {
            if (debug) {
                console.log("error with ajax call");
            }
        }
    });
}

function createTask() {
    var dueInMS;
    //defaul due is in 24 hours
    if ($('#due').val() === '') {
        dueInMS = 86400000;
    } else {
        if ($('#time_unit').val() === 'days') {
            dueInMS = 86400000 * $('#due').val();
        } else if ($('#time_unit').val() === 'weeks') {
            dueInMS = 604800000 * $('#due').val();
        } else {
            //default time unit is hours
            dueInMS = 3600000 * $('#due').val();
        }
    }
    var newTask = {
        task: $('#new_task').val(),
        dueInMS: dueInMS
    };
    //reset input boxes
    $('#due').val('');
    $('#new_task').val('');
    //post task to server
    postTask(newTask);
}

//makes ajax post to the server and then gets tasks to update the local task list
function postTask(newTask) {
    if (debug) {
        console.log('sending a new task ' + newTask);
    }
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
            //after a task is updated wait a tenth of a second for the task toupdate then get the current task list is requested from the server
            setTimeout(getTasks, 100);
        },
        error: function() {
            if (debug) {
                console.log("error with ajax call");
            }
        }
    });
}

//display warning message before deleteing a task
//I know the instructions said to use vannilla JS but the built in confirm cant be stylized
function warning() {
    //hide everything on the DOM
    $('#display').hide();
    //change background to grey
    $("body").css("background-color", "#EFEFEF");
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
                timeLeft();
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
    //make sure main screen is viewable, very important because the DELETE warning message hides everything
    $('#display').show();
    $("body").css("background-color", "white");
    //check to make sure there are tasks to display if so display them if not display instructions
    if (tasks.length > 0) {
        if (debug) {
            console.log("now printing tasks: " + tasks);
        }
        var allTasks = '<table> <tr><td>Task</td><td>Time Left</td><td>Complete Task</td><td>Delete Task</td>';
        for (var i = 0; i < tasks.length; i++) {
            //if task is complete give it a class of completed
            if (tasks[i].active === false) {
                allTasks += '<tr class="completed"><td class= "first">' + tasks[i].task + '</td>';
            }
            //if task is active give it a class equal to its status
            else {
                allTasks += '<tr class="' + tasks[i].status + '"><td class= "first">' + tasks[i].task + '</td>';
            }
            allTasks += '<td>' + tasks[i].timeLeft + '</td>';
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

//uses moment.js to calculate current time left for each task and add it has a property to that task
function timeLeft() {
    for (var i = 0; i < tasks.length; i++) {
        var timeLeft = tasks[i].due_in_ms - moment().diff(tasks[i].created);
        if (timeLeft < 0) {
            tasks[i].timeLeft = "due";
        } else {
            timeLeft = moment.duration(timeLeft);
            if (timeLeft.years() > 0) {
                tasks[i].timeLeft = timeLeft.years() + ' Years';
            } else if (timeLeft.months() > 0) {
                tasks[i].timeLeft = timeLeft.months() + ' Months';
            } else if (timeLeft.weeks() > 0) {
                tasks[i].timeLeft = timeLeft.weeks() + ' Weeks';
            } else if (timeLeft.days() > 0) {
                tasks[i].timeLeft = timeLeft.days() + ' Days';
            } else if (timeLeft.hours() > 0) {
                tasks[i].timeLeft = timeLeft.hours() + ' Hours';
            } else if (timeLeft.minutes() > 0) {
                tasks[i].timeLeft = timeLeft.minutes() + ' Minutes';
            } else {
                tasks[i].timeLeft = timeLeft.seconds() + ' Seconds';
            }
        }
    }
//once all tasks have been assigned a time left attribute print the tasks
displayTasks();
}
