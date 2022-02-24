const express = require('express');
const app = express();
const port = process.env.PORT || 3000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const db = 'mongodb://localhost/mtech';
mongoose.connect(db);
const udb = mongoose.connection;
const path = require('path')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    role: String,
    age: { type: Number, min: 18, max: 70 },
    createdDate: { type: Date, default: Date.now }
})

const user = mongoose.model('User', userSchema)

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/createUser', (req, res) => {
    res.render('create')
})

app.post('/createUser', (req, res) => {
    const newUser = new user();
    newUser.firstName = req.body.first_name;
    newUser.lastName = req.body.last_name;
    newUser.email = req.body.email
    newUser.age = req.body.age
    newUser.save((err, data) => {
        if (err) {
            return console.error(err);
        }
        res.redirect('/userListing')
    });
})

app.get('/userListing', (req, res) => {
    user.find({}, {}, {}, (err, data) => {
        res.render('listings', { userArray: data })
    })
})
app.get('/userListing/firstName/:order', (req, res) => {
    let order = req.params.order
    user.find({}, {}, { sort: { firstName: order } }, (err, data) => {
        res.render('listings', { userArray: data })
    })
})
app.get('/userListing/lastName/:order', (req, res) => {
    let order = req.params.order
    user.find({}, {}, { sort: { lastName: order } }, (err, data) => {
        res.render('listings', { userArray: data })
    })
})
app.get('/userListing/age/:order', (req, res) => {
    let order = req.params.order
    user.find({}, {}, { sort: { age: order } }, (err, data) => {
        res.render('listings', { userArray: data })
    })
})


app.get('/editUser/:id', (req, res) => {
    let userID = req.params.id;
    user.find({ "_id": userID }, {}, {}, (err, data) => {
        res.render('edit', { currentUser: data })
    })
})

app.post('/editUser/:id', async (req, res) => {
    const userID = req.params.id
    const updatedUser = req.body
    await user.updateOne({ "_id": userID }, { $set: { "firstName": `${updatedUser.first_name}`, "lastName": `${updatedUser.last_name}`, "email": `${updatedUser.email}`, "age": `${updatedUser.age}` } })
    res.redirect('/userListing')
})

app.post('/deleteUser/:id', async (req, res) => {
    let userID = req.params.id;
    await user.deleteOne({ "_id": userID })
    res.redirect('/userListing')
})

app.get(`/search`, (req, res) => {
    res.render('search')
})
app.post(`/userSearch`, (req, res) => {
    let searchQuery = req.body.search
    res.redirect(`/userSearch/${searchQuery}`)
})

app.get('/userSearch/:query', (req, res) => {
    let userSearch = req.params.query
    user.find({ $or: [{ "firstName": userSearch }, { 'lastName': userSearch }] }, {}, {}, (err, data) => {
        res.render('searchResults', { userArray: data, search: userSearch })
    })
})

udb.on('error', console.error.bind(console, 'connection error:'));
udb.once('open', function () {
    console.log('db connected');
});
app.listen(port, () => {
    console.log(`server is up on port ${port}`)
})