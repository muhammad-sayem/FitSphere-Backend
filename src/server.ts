/* eslint-disable @typescript-eslint/no-unused-vars */
import app from "./app";
import { seedAdmin } from "./app/utils/seed";
const bootstrap = async () => {
  try {
    await seedAdmin();
    app.listen(5000, () => {
      console.log(`The server is running on port: 5000`);  
    })
  } 
  catch (error) {
    console.log(`Failed to start the server`);
  }
}
bootstrap();