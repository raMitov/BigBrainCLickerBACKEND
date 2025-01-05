const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors'); 
const knex = require('knex')
const db = knex({
    client: 'pg',
    connection: {
        host : 'localhost',
        user : 'postgres',
        password: '0810',
        database: 'clicker'
    }
});

db.select('*').from('users').then(data => {
    console.log(data);
});
const app = express();
app.use(bodyParser.json());
app.use(cors());  

app.get('/',(req, res) => {
    res.send(database.users);
})
app.post('/signin', (req,res) => {
   db.select('email', 'hash').from('login')
   .where('email', '=', req.body.email)
   .then(data => {
    const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
    if(isValid){
        return db.select('*').from('users')
        .where('email','=', req.body.email)
        .then(user => {
            res.json(user[0])

        })
        .catch(err => res.status(400).json('unable to get user'))
    }else{
        res.status(400).json('wrong credentials')
    }
   })
   .catch(err => res.status(400).json('wrong credentials'))
})
app.post('/register', (req, res) => {
    const { email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            const extractedEmail = loginEmail[0].email || loginEmail[0];
            return trx('users')
            .returning('*')
            .insert({
                email: extractedEmail,
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
  
    .catch(err => res.status(400).json('unable to register'))
})
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id}).then(user => {
       if(user.length){
        res.json(user[0])

       }
       else{
        res.status(400).json('not found')   
       }
    }).catch(err => res.status(400).json('not found'))
    // if(!found){
    //     res.status(404).json('no such user')
    // }
}) 
app.put('/button', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'))
})
// bcrypt.hash("bacon", null, null,  function(err, hash){

// })
// bcrypt.compare("bacon", hash, function(err, res){

// })
// bcrypt.compare("veggies", hash, function(err, res){

// })

app.listen(3000, () => {
    console.log('app is running on port 3000')
})