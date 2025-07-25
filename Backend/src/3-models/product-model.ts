import Joi from "joi";
import { BadRequestError } from "./error-models";
import { UploadedFile } from "express-fileupload";

export class ProductModel {
    public productId: string;
    public name: string;
    public description: string;
    public startDate: string;
    public endDate: string;
    public price: number;
    public image: UploadedFile;
    public imageUrl: string;


    public constructor(product: ProductModel) {
        this.productId = product.productId;
        this.name = product.name;
        this.description = product.description;
        this.startDate = product.startDate;
        this.endDate = product.endDate;
        this.price = product.price;
        this.image = product.image;
        this.imageUrl = product.imageUrl;
    }
    public formatDateForMySQL(date: string): string {
        const isoDate = new Date(date);
        return isoDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    private static insertValidationSchema = Joi.object({
        productId: Joi.string().forbidden().uuid(),
        name: Joi.string().required().min(2).max(255),
        description: Joi.string().required().min(10).max(1000),
        startDate: Joi.date().required(),
        endDate: Joi.date().required().greater(Joi.ref("startDate")),
        price: Joi.number().required().min(100).max(10000),
        image: Joi.object().optional(),
        imageUrl: Joi.string().optional().max(200),
    });

    // Validate insert: 
    public validateInsert(): void {
        const result = ProductModel.insertValidationSchema.validate(this);
        if (result.error) throw new BadRequestError(result.error.message);
    }

    private static updateValidationSchema = Joi.object({
        productId: Joi.string().optional().uuid(),
        name: Joi.string().optional().max(255),
        description: Joi.string().optional().max(1000),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional().greater(Joi.ref("startDate")),
        price: Joi.number().optional().min(100).max(10000),
        image: Joi.object().optional(),
        imageUrl: Joi.string().optional().max(200),
    });

    
    // Validate update: 
    public validateUpdate(): void {
        const result = ProductModel.updateValidationSchema.validate(this);
        if (result.error) throw new BadRequestError(result.error.message);
    }
}
