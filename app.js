var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var pg = require('pg');

var connectionString = '';

if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL + 'ssl';
} else {
    connectionString = 'postgres://localhost:5432/weekend-4-challenge';
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('port', process.env.PORT || 5000);

app.post('/submit-task', function(req, res){
    var addTask = {
        task_name: req.body.task_name,
        task_status: req.body.task_status
    };
    pg.connect(connectionString, function(err, client, done) {
        client.query("INSERT INTO to_do_list (task_name, task_status) VALUES ($1, $2)",
            [addTask.task_name, addTask.task_status],
            function (err, result) {
                done();
                if(err) {
                    console.log('Error inserting data: ', err);
                    res.send(false);
                } else {
                    var results = [];
                    pg.connect(connectionString, function(err, client, done) {
                        var query = client.query("SELECT max(task_id) FROM to_do_list");
                        query.on('row', function (row) {
                            results.push(row);
                        });

                        query.on('end', function () {
                            done();
                            addTask.task_id = results[0].max;
                            return res.json(addTask);
                        });

                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
    });
});

app.get('/tasks', function(req, res){
    var results = [];
    pg.connect(connectionString, function(err, client, done) {
        var query = client.query("SELECT * FROM to_do_list ORDER BY task_status ASC;");

        query.on('row', function(row) {
            results.push(row);
        });

        query.on('end', function() {
            done();
            return res.json(results);
        });

        if(err) {
            console.log(err);
        }
    });
});

app.post('/delete-task', function(req, res){
    var idToDelete = req.body.task_id;
    pg.connect(connectionString, function(err, client, done){
        client.query("DELETE FROM to_do_list WHERE task_id = " + idToDelete,
            function (err, result) {
                if(err) {
                    console.log("Error deleting data: ", err);
                    res.send(false);
                } else {
                    res.send(result);
                }
            });
    });
});

app.post('/complete-task', function(req, res){
    var idToComplete = req.body.task_id;
    pg.connect(connectionString, function(err, client, done){
        client.query("UPDATE to_do_list SET task_status = 'complete' WHERE task_id = " + idToComplete,
            function (err, result) {
                if(err) {
                    console.log("Error deleting data: ", err);
                    res.send(false);
                } else {
                    res.send(result);
                }
            });
    });
});

app.get('/*', function(req, res){
    console.log("Here is the request: " , req.params);
    var file = req.params[0] || '/views/index.html';
    res.sendFile(path.join(__dirname, './public/', file));
});

app.listen(app.get('port'), function() {
    console.log('Server is ready on port ' + app.get('port'));
});