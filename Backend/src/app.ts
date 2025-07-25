import cors from "cors";
import express, { Express } from "express";
import { appConfig } from "./2-utils/app-config";
import { dataController } from "./5-controllers/data-controller";
import { errorMiddleware } from "./6-middleware/error-middleware";

class App {

    public server: Express; // Make server public for the testing.

    public start(): void {

        // Create the server: 
        this.server = express();

        this.server.use(cors()); // Enabling CORS for any frontend address.

        // Tell express to create a request.body object from the body json:
        this.server.use(express.json());

        // Connect controllers to the server:
        this.server.use("/api", dataController.router);

        // Register route not found middleware: 
        this.server.use("*", errorMiddleware.routeNotFound);

        // Register catch-all middleware: 
        this.server.use(errorMiddleware.catchAll);

        this.server.listen(appConfig.port, () => console.log("Listening on http://localhost:" + appConfig.port));
    }

}

export const app = new App(); // export app for the testing.
app.start();

