const express = require('express');
const request = require('request');
const html2json = require('html2json').html2json;
const app = express();
const port = 3000;

const template = {
  id: "",
  likes: "",
  quotes: []
};



app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/latest', (req, res) => {
  const options = {
    url: `http://www.bash.org/?latest`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
    }
  };
  request(options, function (error, response, body) {
    res.send(calcResponse(body));
  });
});

app.get('/api/random', (req, res) => {
  const options = {
    url: `http://www.bash.org/?random`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
    }
  };
  request(options, function (error, response, body) {
    res.send(calcResponse(body));
  });
});

app.get('/api/search', (req, res) => {
  const options = {
    url: `http://www.bash.org/?search=204`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
    }
  };
  request(options, function (error, response, body) {
    res.send(calcResponse(body));
  });
});

//204
//30513
//8153

//33681
app.get('/api/quote/:id', (req, res) => {
  const options = {
    url: `http://www.bash.org/?quote=${req['params']['id']}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
    }
  };
  request(options, function (error, response, body) {
    res.send(calcResponse(body));
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function calcResponse(body) {
  const htmlBody = body.toString();
  const jsonBody = html2json(htmlBody);

  const conversations = jsonBody.child[0].child[3].child[5].child[1].child[1].child[1].child[0].child;

  const quotes = [];

  for (let i = 0; i < conversations.length; i++) {
    if (conversations[i].attr && conversations[i].attr.class && conversations[i].attr.class == 'qt') {
      const quote = {
        id: parseInt(conversations[i - 1].child[0].child[0].child[0].text.split('#')[1]),
        likes: parseInt(conversations[i - 1].child[4].child[0].text),
        quotes: conversations[i].child.filter(q => q.node === 'text').map(q => q = calcQuote(q.text))
      }
      quotes.push(quote);
    }
  }
  return quotes;
}

function calcQuote(text) {
  const userRegex = new RegExp(/(?<=&lt;|\().*(?=&gt;|\))/g);
  const userColonRegex = new RegExp(/(.).*(?=:&nbsp;)/g);
  const quoteUserRegex = new RegExp(/(?<=&gt;|\)).*/g);
  const quoteActionRegex = new RegExp(/(\*\*\*).*/g);
  const quoteColonRegex = new RegExp(/(?<=:&nbsp;).*/g);

  let user = '';
  if (text.match(userRegex)) {
    user = text.match(userRegex)[0].trim();
  } else if (text.match(userColonRegex)) {
    user = text.match(userColonRegex)[0].trim();
  } else {
    user = null;
  }

  let quote = '';
  if (text.match(quoteUserRegex)) {
    quote = text.match(quoteUserRegex)[0].trim();
  } else if (text.match(quoteActionRegex)) {
    quote = text.match(quoteActionRegex)[0].trim();
  } else if (text.match(quoteColonRegex)) {
    quote = text.match(quoteColonRegex)[0].trim();
  } else {
    quote = text.trim();
  }
  return {user: user, quote: quote};
}
