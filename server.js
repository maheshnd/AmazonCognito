const express = require('express');
require('dotenv').config();

//Routes file
const auth = require('./src/routes/auth');

const app = express();

//Bodyparser
app.use(express.json());

//Mount routes
app.use('/api/v1/aws-cognito', auth);

const PORT = process.env.PORT || 4000;

//Server created
const server = app.listen(PORT, () => {
  console.log(`Server stated on ${PORT}`);
});

//Handle unhandled prmise rejection
process.on('unhandledRejection', (err, promis) => {
  console.log(`Error:  ${err.message}`.red);
  //Close server and exit process
  server.close(() => process.exit(1));
});
