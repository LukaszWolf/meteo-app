export default {
  Auth: {
    region: 'eu-north-1',
    userPoolId: 'eu-north-1_5zc4S8sxc',
    userPoolWebClientId: '3kdablgigh9g93dpo1tkgkm1ge',
    identityPoolId: 'eu-north-1:0951e714-67ce-4f23-84d0-15d0e167e8b9',
    oauth: {
      domain: 'meteo-auth.auth.eu-north-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'https://meteo-web-app-nine.vercel.app/',
      redirectSignOut: 'https://meteo-web-app-nine.vercel.app/',
      // redirectSignIn: 'http://localhost:5173/',
      // redirectSignOut: 'http://localhost:5173/',
      responseType: 'code'
    }
  },

  Storage: {AWSS3: {bucket: 'meteo-station', region: 'eu-north-1'}}
};
