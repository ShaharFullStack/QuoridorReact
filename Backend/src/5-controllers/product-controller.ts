import express, { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { fileSaver } from "uploaded-file-saver";
import { StatusCode } from "../3-models/enums";
import { ProductModel } from "../3-models/product-model";
import { productService } from "../4-services/product-service";
import { securityMiddleware } from "../6-middleware/security-middleware";

class ProductController {

    public readonly router = express.Router();

    public constructor() {
        this.router.get("/products", this.getAllProducts);
        this.router.get("/products/:id", this.getOneProduct);
        this.router.post("/products", securityMiddleware.validateAdmin, this.addProduct);
        this.router.put("/products/:id", securityMiddleware.validateToken, this.updateProduct);
        this.router.delete("/products/:id", securityMiddleware.validateAdmin, this.deleteProduct);
        this.router.get("/products/images/:imageName", this.getImage);
        this.router.get("/products/search", this.searchProducts);
    }

    private async getAllProducts(request: Request, response: Response, next: NextFunction) {
        try {
            const products = await productService.getAllProducts();
            response.json(products);
        }
        catch (err: any) {
            next(err);
        }
    }

    private async getOneProduct(request: Request, response: Response, next: NextFunction) {
        try {
            const id = request.params.id;
            const product = await productService.getOneProduct(id);
            response.json(product);
        }
        catch (err: any) {
            next(err);
        }
    }

    private async addProduct(request: Request, response: Response, next: NextFunction) {
        try {
            const image = request.files?.image as UploadedFile;
            if (!image) {
                return response.status(StatusCode.BadRequest).json({ message: '"image" is required' });
            }

            request.body.image = image;
            const product = new ProductModel(request.body);

            const dbProduct = await productService.addProduct(product);

            response.status(StatusCode.Created).json(dbProduct);
        } catch (err: any) {
            response.status(StatusCode.BadRequest).json(err);
            next(err);
        }
    }

    private async updateProduct(request: Request, response: Response, next: NextFunction) {
        try {
            const id = request.params.id;
            request.body.productId = id;

            const image = request.files?.image as UploadedFile;
            if (image) {
                request.body.image = image;
            }

            const product = new ProductModel(request.body);
            const dbProduct = await productService.updateProduct(product);

            response.status(StatusCode.OK).json(dbProduct);
        } catch (err: any) {
            response.status(StatusCode.BadRequest).json(err);
            next(err);
        }
    }

    private async deleteProduct(request: Request, response: Response, next: NextFunction) {
        try {
            const id = request.params.id;
            await productService.deleteProduct(id);
            response.sendStatus(StatusCode.NoContent);
        }
        catch (err: any) {
            next(err);
        }
    }

    private async getImage(request: Request, response: Response, next: NextFunction) {
        try {
            const imageName = request.params.imageName;
            const absolutePath = fileSaver.getFilePath(imageName);
            response.status(StatusCode.OK).sendFile(absolutePath);
        }
        catch (err: any) {
            response.status(StatusCode.NotFound).send("Image not found");
            next(err);
        }
    }

    private async searchProducts(request: Request, response: Response, next: NextFunction) {
        try {
            const searchValue = request.query.search as string || "";
            const page = +(request.query.page ?? 1);
            const pageSize = +(request.query.pageSize ?? 10);

            const result = await productService.searchProducts(searchValue, page, pageSize);
            response.json(result);
        } catch (err: any) {
            next(err);
        }
    }

}
export const productController = new ProductController();

