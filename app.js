let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let id;

mongoose.connect('mongodb://localhost/bankDB,', { useNewUrlParser: true });
let db = mongoose.connection;

//Check for db errors
db.on('error', function(error){
    console.log(error);
});

//Check connection
db.once('open', function(){
    console.log('Connected to mongoDB');
});

let accountSchema = new mongoose.Schema({
    name : String,
    deposit : String,
    card : String
});

//Bring in model
let Accounts = mongoose.model('Accounts', accountSchema);

let urlencodedParser = bodyParser.urlencoded({ extended: false });

let app = express();

//set up a template engine
app.set('view engine', 'ejs');

// static files
app.use(express.static('public'));

app.get('/', function(req, res){
    // get data from the db and add them to the view
    Accounts.find({}, function(err, accounts){
        if (err) {
            console.log(err)
        } else {
            // console.log(accounts);
            res.render('accounts', {
                accounts: accounts
            }); 
        }
    });
}); 

app.get('/add_account', function(req, res){
    res.render('add_account');
}); 

app.post('/add_account', urlencodedParser, function (req, res) {
    // get data from the view and add it to mongodb
    // console.log(req.body);
    let newAccount = Accounts(req.body).save(function (err, accounts) {
        if (err) {
            throw err
        } else {
            res.redirect('/');
        }
    })
});

app.get('/edit_delete', function(req, res){
    // get data from the db and add them to the edit_delete view
    Accounts.find({}, function (err, accounts) {
        if (err) {
            throw err;
        } else {
            // console.log(data); 
            res.render('edit_delete', {
                accounts: accounts
            });
        };
    });
});

app.get('/edit/:id', function(req, res){
    // get single account 
    id = req.params.id;
    Accounts.findById(req.params.id, function(err, acc){
        if (err) {
            throw err;
        } else {
            // console.log(acc);
            res.render('edit', {
                account : acc
            });
        }
    });
});

app.post('/edit/:id', urlencodedParser, function (req, res) {
    // edit single account
    let account = {};
    account.name = req.body.name;
    account.deposit = req.body.deposit;
    account.card = req.body.card;

    // console.log(account);
    // console.log(id);
    
    let query = {_id : id};
    Accounts.updateOne(query, account, function(err){
        if (err) {
            throw err;
            // return;
        } else {
            res.redirect('/')
        }
    });
});

app.get('/delete/:id', function(req, res){
    // delete single account
    let query = {
        _id: req.params.id
    };
    Accounts.deleteOne(query, function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect('/');
        }
    });
});

//listen to port
app.listen(3000);
console.log('You are listening to port 3000!!!');