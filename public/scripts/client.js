$(function(){
  console.log('Document ready!');
  getTasks();
  enable();
});

function enable(){
$('#post-task').unbind().on('click',postTask);
$('.complete').unbind().on('click', putTask);

}

function getTasks() {
  tasks=[];
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

function postTask(){
  var newTask = {task:$('#new-task').val()};
  console.log('sending a new task ' + newTask);
    $('#new-task').val('');
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

function putTask(){
  var updateTask = {id:this.getAttribute('data')};
  $.ajax({
      type: "PUT",
      url: '/putTask',
      data: updateTask,
      success: function(response) {
          console.log('back from postTasks: ', response);
          //getTasks();
      },
      error: function() {
              console.log("error with ajax call");
          }
  });
}


function printTasks(tasks){
  console.log("now printing tasks: " + tasks);
var allTasks = '<tr><td>Task</td><td>Date Created</td><td>Complete Task</td><td>Delete Task</td>';
  for (var i = 0; i < tasks.length; i++) {
    allTasks += '<tr><td>' + tasks[i].task + '</td>';
    allTasks += '<td>' + tasks[i].created + '</td>';
    allTasks += '<td><button type="button" class="complete" data="' + tasks[i].id + '"> Complete </button> </td>';
    allTasks += '<td><button type="button" class="delete" data="' + tasks[i].id + '"> Delete </button> </td>';
  }
$('#tasks').html(allTasks);
}
