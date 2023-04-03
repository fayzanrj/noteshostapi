const mongoose = require('mongoose');

// const mongoURI = 'mongodb://127.0.0.1:27017/inotebook';
const mongoURI = 'mongodb+srv://fayzanrj:a4b65595@cluster0.d9nedvi.mongodb.net/?retryWrites=true&w=majority';

const connectToMongo = async ()=>{
    mongoose.connect(mongoURI).then(()=>{
        console.log('connected')
    }).catch((err)=>{
        console.log("err")
    })
}

module.exports = connectToMongo;
