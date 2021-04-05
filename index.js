require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

app.get('/api/accesstokens', (req, res, next) => {
    const sql = `select "property",
                        "key"
                from "accesstokens";
                `;
    db.query(sql)
        .then(result => {
            const keys = result.rows;
            res.status(200).send(keys)
        })
        .catch(err=>{
            console.error(err);
            return res.status(500).send('An unexpected error has occurred')
        });
});

const test = IGQVJXRWVkUkUweEJkTEY5N3UxZAFpKX0lQaHktUmRIUFVxdEZASandWS0NjanIta29YRkhFU3l4RGdaR3QydWl0SzVlZAzlxQXdBV2RfTEtITjJ6SkVaWkFGbER4QmpoOWxWREY4eUpB

// refresh tokens
app.get('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token='+ test, (req, res, next) => {
  
})

app.use('/api', (req, res, next) => {
    next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
  });
  
  app.use((err, req, res, next) => {
    if (err instanceof ClientError) {
      res.status(err.status).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({
        error: 'an unexpected error occurred'
      });
    }
  });

app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log('Listening on port', process.env.PORT);
  });