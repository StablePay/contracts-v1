const AppConfig = require('./AppConfig');
const appConfig = new AppConfig();
appConfig.validate();
console.log('App configuration was validated.');
console.log(appConfig);
module.exports = appConfig;
