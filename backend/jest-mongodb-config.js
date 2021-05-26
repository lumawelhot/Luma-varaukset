module.exports = {
    mongodbMemoryServerOptions: {
      /* instance: {
        dbName: 'jest'
      }, */
      binary: {
        version: '6.9.6', // Version of MongoDB
        skipMD5: true
      },
      autoStart: false
    }
  }