import express, { NextFunction, Request, Response } from "express";
import { likeService } from "../4-services/like-service";
import { securityMiddleware } from "../6-middleware/security-middleware";
import { likeReportService } from "../4-services/like-report-service";
import { StatusCode } from "../3-models/enums";
import { BadRequestError, UnauthorizedError } from "../3-models/error-models";
import jwt from "jsonwebtoken";

class LikeController {
    public readonly router = express.Router();

    public constructor() {
        this.router.get(
            "/likes",
            securityMiddleware.validateToken,
            this.getAllLikes.bind(this)
        );

        this.router.post(
            "/products/:productId/likes",
            securityMiddleware.validateToken,
            this.addLike.bind(this)
        );

        this.router.delete(
            "/products/:productId/likes",
            securityMiddleware.validateToken,
            this.removeLike.bind(this)
        );

        this.router.get(
            "/products/:productId/likes/count",
            this.getLikesByProduct.bind(this)
        );

        this.router.get(
            "/users/likes/",
            securityMiddleware.validateToken,
            this.getUserLikedProducts.bind(this)
        );

        this.router.get(
            "/likes/report",
            securityMiddleware.validateAdmin,
            this.getLikesReport.bind(this)
        );
        this.router.get("/likes/report/csv", 
            securityMiddleware.validateAdmin,
            this.downloadLikesCSV
        );
        
    }

    private getUserIdFromToken(request: Request): string {
        const token = request.headers.authorization?.split(" ")[1];
        if (!token) throw new UnauthorizedError("Authorization token is missing");

        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new UnauthorizedError("JWT secret is not defined");
            const decoded = jwt.verify(token, secret) as unknown as { user: { id: string } };
            return decoded.user.id;
        } catch (err) {
            throw new UnauthorizedError("Invalid or expired token");
        }
    }

    private async getAllLikes(request: Request, response: Response, next: NextFunction) {
        try {
            const likes = await likeService.getAllLikes();
            response.json(likes.length ? likes : []);
        } catch (err: any) {
            next(err);
        }
    }

    private async addLike(request: Request, response: Response, next: NextFunction) {
        try {
            const userId = this.getUserIdFromToken(request);
            const productId = request.params.productId;

            if (!productId) {
                throw new BadRequestError("Product ID is required");
            }

            const like = await likeService.addLike(userId, productId);
            response.status(StatusCode.Created).json(like);
        } catch (err: any) {
            next(err);
        }
    }

    private async removeLike(request: Request, response: Response, next: NextFunction) {
        try {
            const userId = this.getUserIdFromToken(request);
            const productId = request.params.productId;

            if (!productId) {
                throw new BadRequestError("Product ID is required");
            }

            await likeService.removeLike(userId, productId);
            response.status(StatusCode.NoContent).send();
        } catch (err: any) {
            next(err);
        }
    }

    private async getLikesByProduct(request: Request, response: Response, next: NextFunction) {
        try {
            const productId = request.params.productId;

            if (!productId) {
                throw new BadRequestError("Product ID is required");
            }

            const count = await likeService.getLikesByProduct(productId);
            response.json({ productId, count });
        } catch (err: any) {
            next(err);
        }
    }

    private async getUserLikedProducts(request: Request, response: Response, next: NextFunction) {
        try {
            const userId = this.getUserIdFromToken(request);
            const products = await likeService.getUserLikedProducts(userId);
            response.json(products);
        } catch (err: any) {
            next(err);
        }
    }

    private async getLikesReport(request: Request, response: Response, next: NextFunction) {
        try {
            const reportData = await likeReportService.generateGlobalLikesReport();
            response.json(reportData);
        } catch (err: any) {
            next(err);
        }
    }

    private async downloadLikesCSV(request: Request, response: Response, next: NextFunction) {
        try {
            const csvData = await likeReportService.generateLikesCSV();
            response.setHeader("Content-Type", "text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=products_likes_report.csv");
            response.send(csvData);
        } catch (err: any) {
            next(err);
        }
    }
    
}


export const likeController = new LikeController();
