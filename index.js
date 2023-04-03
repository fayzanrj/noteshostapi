const connectToMongo = require('./db');
const express = require('express')
// const path = require('path')
var cors = require('cors')
connectToMongo();

const app = express()
app.use(cors())
const port = process.env.PORT || 5000


app.use(express.json())
// app.use(express.static(path.join(__dirname + "/public")))
app.use('/api/auth' , require('./routes/auth'))
app.use('/api/notes' , require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})