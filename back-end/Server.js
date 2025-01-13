const {app} = require('./App');

const port = 3001;
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});