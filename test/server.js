const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.send('Hello Yash Gautam!');
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
