import express, { Request, Response } from 'express';

const app = express();
const port = 4000;

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// Start the server on your local IP address
const localIP: string = "192.168.34.146"; // Use the correct local IP address

app.listen(port, localIP, () => {
  console.log(`Server is running on http://${localIP}:${port}`);
});
