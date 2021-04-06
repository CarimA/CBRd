import { express } from './integrations/express/instance';

// heroku requires that apps serve a web page to stay up
express.use('/', (req, res) => res.send('nothing to see here'));
