// like-service.ts
import { v4 as uuid } from "uuid";
import { dal } from "../2-utils/dal";
import { LikeModel } from "../3-models/like-model";
import { BadRequestError, NotFoundError } from "../3-models/error-models";
import { appConfig } from "../2-utils/app-config";

class LikeService {
    public async addLike(userId: string, productId: string): Promise<LikeModel> {
        try {
            // Check if product exists
            const productExists = await this.checkProductExists(productId);
            if (!productExists) {
                throw new NotFoundError("Product not found");
            }

            // Check if like already exists
            const existingLike = await this.getLike(userId, productId);
            if (existingLike) {
                // Return existing like instead of throwing an error
                return existingLike;
            }

            // Generate new UUID for the like
            const likeId = uuid();
            const now = new Date();

            // SQL query to insert like and update like count
            const sql = `
                INSERT INTO likes (id, userId, productId, likeDate) 
                VALUES (?, ?, ?, ?)
            `;

            // Execute query
            await dal.execute(sql, [likeId, userId, productId, now]);

            // Return the new like model
            return new LikeModel({
                id: likeId,
                userId,
                productId,
                likeDate: now
            });
        } catch (err) {
            if (err instanceof NotFoundError) throw err; // Re-throw NotFoundError directly
            const error = err as Error;
            throw new BadRequestError("Failed to add like: " + error.message);
        }
    }

    public async removeLike(userId: string, productId: string): Promise<void> {
        try {
            // Check if product exists
            const productExists = await this.checkProductExists(productId);
            if (!productExists) {
                throw new NotFoundError("Product not found");
            }

            // Check if like exists before deleting
            const existingLike = await this.getLike(userId, productId);
            if (!existingLike) {
                throw new NotFoundError("Like not found");
            }

            const sql = `DELETE FROM likes WHERE userId = ? AND productId = ?`;
            const result = await dal.execute(sql, [userId, productId]);
        } catch (err) {
            if (err instanceof NotFoundError) throw err; // Re-throw NotFoundError directly
            const error = err as Error;
            throw new BadRequestError("Failed to remove like: " + error.message);
        }
    }

    public async getAllLikes(): Promise<LikeModel[]> {
        const sql = `
            SELECT 
                l.productId,
                l.userId,
                l.likeDate,
                u.firstName,
                u.lastName,
                p.name AS productName,
                p.price AS productPrice
            FROM likes l
            JOIN users u ON l.userId = u.id
            JOIN products p ON l.productId = p.id
            ORDER BY l.likeDate DESC
        `;
        const result = await dal.execute(sql);
        return result.map((row: any) => new LikeModel(row));
    }

    public async getLikesByProduct(productId: string): Promise<number> {
        const sql = `
            SELECT COUNT(*) as count 
            FROM likes 
            WHERE productId = ?
        `;
        const result = await dal.execute(sql, [productId]);
        return result[0].count;
    }

    public async getUserLikedProducts(userId: string): Promise<any[]> {
        const sql = `
            SELECT 
                p.id AS productId,
                p.name,
                p.price,
                l.likeDate,
                CONCAT('${(appConfig as any).productImagesWebPath}', p.imageName) AS imageUrl
            FROM likes l
            JOIN products p ON l.productId = p.id
            WHERE l.userId = ?
            ORDER BY l.likeDate DESC
        `;
        return await dal.execute(sql, [userId]);
    }

    private async getLike(userId: string, productId: string): Promise<LikeModel | null> {
        const sql = `
            SELECT * FROM likes 
            WHERE userId = ? AND productId = ?
        `;
        const result = await dal.execute(sql, [userId, productId]);
        return result.length > 0 ? new LikeModel(result[0]) : null;
    }

    private async checkProductExists(productId: string): Promise<boolean> {
        const sql = `SELECT 1 FROM products WHERE id = ?`;
        const result = await dal.execute(sql, [productId]);
        return result.length > 0;
    }
}

export const likeService = new LikeService();