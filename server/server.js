const express= require("express");
const bodyParser=require("body-parser");
const _ = require('lodash');
var {User}=require("./models/User");
var {Todo}=require("./models/Todo");
var {authenticate} = require('./middleware/authenticate');
var app=express();
app.use(bodyParser.json());
//get todos using token
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo(req.body);
  todo.creator = req.user._id;
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});
//get all data using 
app.get('/todos', authenticate, (req, res) => {
  console.log(req.user)
  Todo.find({ 
    creator:req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post("/todos",authenticate,(req,res)=>{
  var task = new RegExp(req.task,"gi");
  Todo.find({ 
    "task":task
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
})
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove(
    {
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST signup
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    
    return user.generateAuthToken();
  }).then((token) => {
  
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    
    res.status(400).send(e);
  })
});
//login details
app.get('/users/me', authenticate, (req, res) => {  
  res.send(req.user);
});

module.exports = {app};

app.listen(3000);