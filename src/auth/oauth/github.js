'use strict';

require('dotenv').config();
const superagent = require('superagent');
const Users = require('../users-model.js');

const API = 'http://localhost:3000/oauth/github';
const GITHUB_TOKEN_SERVER = 'https://github.com/login/oauth/access_token';
// const GITHUB_PROFILE_SERVICE = 'https://api.github.com/user';
const GITHUB_EMAIL_SERVICE = 'https://api.github.com/user/emails';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

let authorize = (request) => {
  let code = request.query.code;
  return superagent.post(GITHUB_TOKEN_SERVER)
    .type('form')
    .send({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: API,
      grant_type: 'authorization_code',
    })
    .then(response => {
      let token = response.body.access_token;
      return superagent.get(GITHUB_EMAIL_SERVICE)
        .set('Authorization', `token ${token}`);
    })
    .then(emailResponse => {
      let email = emailResponse.body[0].email;
      return Users.pCreateFromOauth(email);
    })
    .then(ourUser => {
      return ourUser.generateToken();
    })
    .catch(console.error);
};

module.exports = authorize;
