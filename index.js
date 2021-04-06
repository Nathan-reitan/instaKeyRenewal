require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');
const fetch = require("node-fetch");

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

app.get('/api/accesstokens', (req, res, next) => {
    const sql = `select "property",
                        "key"
                from "accesstokens"
                order by "property";
                `;
    db.query(sql)
        .then(results => {
            return results.rows
        })
        .then(property =>{
          const name = property[0].property;
          const key = property[0].key;
          fetch("https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token="+key)
              .then(response => {
                return response.json()
              })
              .then(data=>{
                return data.access_token
              })
              .then(token => {
                const params = [token, name]
                let newToken = `update "accesstokens"
                                  set  "key" = $1
                                where  "property" = $2
                                returning *;`
                    db.query(newToken, params)
                        .then(upd => {
                          res.status(200).send(upd.rows[0])
                        })
              })
          // for (let i=0; i<property.length; i++){
            
          // }
        })
        .catch(err=>{
            console.error(err);
            return res.status(500).send('An unexpected error has occurred')
        });
});

app.get('/test', (req, res, next) =>{
  fetch("http://github.com")
  .then(response => console.log(response))
  // .then(data=>{
  //   console.log(data)
  // })
  .catch(err=>{
    console.error(err);
    return res.status(500).send('An unexpected error has occurred')
  });
})

// refresh tokens
// app.get('', (req, res, next) => {
  
// })

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