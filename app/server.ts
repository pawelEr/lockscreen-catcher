// Import everything from express and assign it to the express variable
import express from 'express';

// Import WelcomeController from controllers entry point
import { WelcomeController, HomeController } from './controllers';

// Create a new express application instance
const app: express.Application = express();
// The port the express app will listen on
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const welcomeController: WelcomeController = new WelcomeController();

app.set('view engine', 'pug')
app.use('/welcome', welcomeController.getRouter());
app.use('/', HomeController);

app.use('/upload', express.static('upload'))
app.use('/static', express.static('static'))

// Serve the application at the given port
app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});