import express, { NextFunction, Request, Response } from "express";
import { dataService } from "../4-services/data-service";

class DataController {

    public readonly router = express.Router();

    public constructor() {
        this.router.get("/___", this.getAll___);
    }

    private async getAll___(request: Request, response: Response, next: NextFunction) {
        try {
            const data = await dataService.getAll___();
            response.json(data);
        }
        catch (err: any) { next(err); }
    }

}

export const dataController = new DataController();
