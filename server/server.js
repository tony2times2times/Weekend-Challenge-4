var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');
var urlEncodedParser = bodyParser.urlencoded({
    extended: true
});
var port = process.env.PORT || 3000;
var connectionString = 'postgres://localhost:5432/todo';

app.listen(port, function(req, res) {
    console.log('server listening on', port);
});

app.get('/', function(req, res) {
    console.log('Base URL reached sending index.html');
    res.sendFile(path.resolve('public/index.html'));
});

app.get('/getTasks', function(req, res) {
    console.log('Getting tasks.');
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.log('Error connecting to database' + err);
        } else {
            console.log('connected to database');
            var query = client.query('SELECT * from tasks;');
            var tasks = [];
            query.on('row', function(row) {
                tasks.push(row);
            });
            query.on('end', function() {
                done();
                console.log('sending array back to client' + tasks);
                res.send(tasks);
            });
        }
    });
});

app.post('/postTask', urlEncodedParser, function(req, res) {
    console.log('Adding new task', req.body);
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.log(err);
        } else {
            console.log('connected to database recieving: ' + req.body);
            //All tasks will start active (incomplete)
            client.query('INSERT INTO tasks (task, active) values($1, $2);', [req.body.task, true]);
            done();
            res.send('successful post task');

        }
    });
});

app.put('/putTask', urlEncodedParser, function(req, res) {
    console.log('Adding new task', req.body);
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.log(err);
        } else {
            console.log('connected to database updating task ID: ' + req.body.id);
            // check for active status and toggles it
            var query = client.query("SELECT active from tasks WHERE id=" + req.body.id + ";");
            //var databaseTask =

            //console.log('match found: ' + databaseTask.active);
            //client.query('UPDATE tasks SET (active) values($1, $2)', [req.body.task, true]);
            done();
            res.send(query);

        }

    });
});

app.put('/putTask', urlEncodedParser, function(req, res) {
    console.log('Adding new task', req.body);
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.log(err);
        } else {
            console.log('connected to database updating task ID: ' + req.body.id);
            // check for active status and toggles it
            var query = client.query("SELECT active from tasks WHERE id=" + req.body.id + ";");
            //var databaseTask =

            //console.log('match found: ' + databaseTask.active);
            //client.query('UPDATE tasks SET (active) values($1, $2)', [req.body.task, true]);
            done();
            res.send(query);

        }

    });
});


// app.put('/putMesa', urlEncodedParser, function(req, res) {
//     console.log('Updating: ', req.body);
//     pg.connect(connectionString, function(err, client, done) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("mesa status: " + req.body.mesa_status);
//             console.log('connected to database updating: ' + req.body);
//             client.query('UPDATE mesa SET mesa_status =' + req.body.mesa_status + 'WHERE mesa_number =' + req.body.mesa_number);
//             done();
//             res.send('successful post mesa');
//
//         }
//     });
// });
app.use(express.static('public'));
