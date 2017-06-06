
module.exports = require('./lib/DaemonRunner');

module.exports.mocks = {
    MockSpawn: require('./test/mocks/MockSpawn'),
    MockChild: require('./test/mocks/MockChild'),
    MockDaemonRunner: require('./test/mocks/MockDaemonRunner')
};
