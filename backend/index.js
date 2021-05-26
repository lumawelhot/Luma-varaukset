const app = require('./app');

app.listen({ port: process.env.PORT || 3001 }, () => {
    console.log('Running on port 3001');
});