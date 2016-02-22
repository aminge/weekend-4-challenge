$(document).ready(function(){
    loadTasks();
    $('#submit-task').on('click', clickSubmitTask);
    $('#task-table').on('click', '.complete_task', clickCompleteTask);
    $('#task-table').on('click', '.delete_task', clickDeleteTask);
});

function clickSubmitTask(){

    event.preventDefault();

    var values = {};
    $.each($('#task-entry-form').serializeArray(), function(i, field) {
        values[field.name] = field.value;
    });
    values.task_status = 'active';
    $('#task-entry-form').find('input[type=text]').val('');

    $.ajax({
        type: 'POST',
        url: 'submit-task',
        data: values,
        success: function(data){
            appendTaskToTable(data);
            console.log(data);
        }
    });
}

function appendTaskToTable(task){
    var taskRow = '<tr id="task-' + task.task_id + '" data-id="' + task.task_id + '">';
    taskRow += '<td class="task_name">' + task.task_name + '</td>';
    taskRow += '<td class="complete_task">Complete This Task</td>';
    taskRow += '<td class="delete_task">Delete This Task</td></tr>';

    $('#task-table').append(taskRow);

    if (task.task_status == 'complete'){
        $('#task-' + task.task_id).addClass('complete');
    }
}

function clickCompleteTask(){
    var task_id = $(this).parent().data('id');
    var data = {task_id: task_id};

    $.ajax({
        type: 'POST',
        url: 'complete-task',
        data: data,
        success: function(data){
            console.log("Task successfuly completed");
        }
    });
    $(this).parent().addClass('complete');
}

function clickDeleteTask(){
    var task_id = $(this).parent().data('id');
    var data = {task_id: task_id};

    $.ajax({
        type: 'POST',
        // I'd like to make this a DELETE request, but I can't figure out how to make it work. Since DELETE requests
        // can't have bodies, I'm not sure how to tell the server which person to delete from the database
        url: 'delete-task',
        data: data,
        success: function(data){
            console.log("Delete successful");
        }
    });
    $('#task-' + task_id).remove();
}

function loadTasks(){
    $.ajax({
        type: 'GET',
        url: 'tasks',
        success: function(data){
            data.forEach(function(task) {
                appendTaskToTable(task);
            });
        }
    });
}