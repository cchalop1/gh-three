let express = require('express');
let app = express();
let path = require("path");
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');


app.use(express.static(path.join(__dirname)));

app.get('/:username', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/contributions/:username', (req, res) => {
    const username = req.params['username'];
    if (!username) {
        res.status = 404;
    }
    fetch(`https://github.com/users/${username}/contributions`)
        .then(res => res.text())
        .then(body => {
            const html = HTMLParser.parse(body);
            let data = [];
            // html.querySelector('.js-calendar-graph-svg').childNodes
            //     .forEach(el => {
            //         console.log(el);
            //     });
            res.json({ body: body });
        });
});

let port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening on port ', port);