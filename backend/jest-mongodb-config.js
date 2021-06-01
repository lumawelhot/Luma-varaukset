module.exports = {
    mongodbMemoryServerOptions: {
       instance: {
        dbName: 'jest',
      },
       binary: {
        version: 'latest', // Version of MongoDB
        skipMD5: true
      },
      autoStart: false
    }
  }