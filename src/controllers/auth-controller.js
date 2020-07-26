const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
global.fetch = require('node-fetch');

//Initial setup
const poolData = {
  UserPoolId: process.env.AWS_Cognito_UserPoolId,
  ClientId: process.env.AWS_Cognito_ClientId,
};

const pool_region = process.env.AWS_pool_region;

//Initiate user pool
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// @desc    SignUp User
// @route   POST /api/v1/aws-cognito/signup
// @access  Public
exports.signUp = async (req, res, next) => {
  const { email, name, password, phone_number } = req.body;

  const attributeList = [];

  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'name',
      Value: name,
    })
  );
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'email',
      Value: email,
    })
  );
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'phone_number',
      Value: phone_number,
    })
  );

  userPool.signUp(email, password, attributeList, null, (err, result) => {
    if (err) {
      //console.log(err.message);
      return res.status(400).json({ success: false, error: err.message });
    }

    cognitoUser = result.user;
    console.log('User name is : - ' + cognitoUser.getUsername());

    return res
      .status(200)
      .json({ success: true, data: { data: cognitoUser.getUsername() } });
  });
};

// @desc    SignUp User
// @route   POST /api/v1/aws-cognito/signin
// @access  Public
exports.signIn = (req, res, next) => {
  const { email, password } = req.body;

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: email,
      Password: password,
    }
  );

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      return res.status(200).json({
        success: true,
        data: {
          AccessToken: result.getAccessToken().getJwtToken(),
          IdToken: result.getIdToken().getJwtToken(),
          RefreshToken: result.getRefreshToken().getToken(),
        },
      });
    },
    onFailure: function (error) {
      return res
        .status(400)
        .json({ success: false, data: { error: error.message } });
    },
  });
};
