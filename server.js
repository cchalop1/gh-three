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
            let data = html.querySelectorAll('.day')
                .map(day => {
                    return {
                        x: Number(day.attributes.x),
                        y: Number(day.attributes.y),
                        color: day.attributes.fill.substr(1, 6),
                        count: Number(day.attributes['data-count']),
                        date: day.attributes['data-date']
                    };
                });
            res.json({ body: data });
        });
});

let port = process.env.PORT || 8080;
app.listen(port, () => console.log(`http://localhost:${port}/`));