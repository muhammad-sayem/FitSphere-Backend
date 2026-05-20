import app from "./app";
const bootstrap = () => {
  try {
    app.listen(5000, () => {
      console.log(`The server is running on port: 5000`);  
    })
  } 
  catch (error) {
    console.log(`Failed to start the server`);
  }
}
bootstrap();
