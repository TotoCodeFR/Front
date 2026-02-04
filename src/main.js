import express from 'express';

const app = express();

app.use(express.json());

app.use('/app', express.static('src/app'));
app.use('/', express.static('src/public'));

app.listen(3000, () => {
    console.log('Front is running on port 3000');
});