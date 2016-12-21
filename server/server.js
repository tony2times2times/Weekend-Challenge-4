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
    console.log('Updating task: ', req.body);
    //check the status and toggle it
    toggle(req.body.id);
    res.send('task updated');

});

//check the status and toggle it
function toggle(incommingID) {
  console.log('incommingID is: '+ incommingID);
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.log(err);
        } else {
            console.log('connected to database searching for id: ' + incommingID);
            // check for active status
            var query = client.query("SELECT * from tasks WHERE id=" + incommingID + " ;");
            var task = [];
            query.on('row', function(row) {
                task.push(row);
            });
            query.on('end', function() {
                done();
                //check status and call updateActive function with opposite value.
                if (task[0].active) {
                  console.log('Task is currently active changing to false.');
                    updateActive('false', incommingID);
                    return;
                } else {
                  console.log('Task is currently inactive changing to true.');
                    updateActive('true', incommingID);
                    return;
                }
            });
        }
    });
}
//updates active status in data base
function updateActive(newStatus, incommingID){
  pg.connect(connectionString, function(err, client, done) {
      if (err) {
          console.log(err);
      } else {
          console.log('connected to database updating task ID: ' + incommingID);
          console.log( 'New status: ' + newStatus);
          var query = client.query("UPDATE tasks SET active=" + newStatus + " WHERE id=" + incommingID + " ;");
          done();
      }
  });
}

app.delete('/delTask', urlEncodedParser, function(req, res) {
  pg.connect(connectionString, function(err, client, done) {
      if (err) {
          console.log(err);
      } else {
          console.log('connected to database updating task ID: ' + req.body.id);
          var query = client.query("DELETE from tasks WHERE id=" + req.body.id + " ;");
          done();
      }
  });
    res.send('task updated');

});





app.use(express.static('public'));
