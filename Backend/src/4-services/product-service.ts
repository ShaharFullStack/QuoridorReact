import { OkPacketParams } from "mysql2";
import { v4 as uuid } from "uuid";
import { fileSaver } from "uploaded-file-saver";
import { dal } from "../2-utils/dal";
import { NotFoundError } from "../3-models/error-models";
import { ProductModel } from "../3-models/product-model";
import { appConfig } from "../2-utils/app-config";

class ProductService {

    public async getAllProducts(): Promise<ProductModel[]> {
        const sql = `
            SELECT 
                productId, 
                name, 
                description, 
                startDate, 
                endDate, 
                price, 
                CONCAT('${appConfig.productImagesWebPath}', imageName) AS imageUrl 
            FROM products
            ORDER BY startDate;
        `;
        const products = await dal.execute(sql);
        return products;
    }

    public async getOneProduct(productId: string): Promise<ProductModel> {
        const sql = `
            SELECT 
                productId, 
                name, 
                description, 
                startDate, 
                endDate, 
                price, 
                CONCAT('${appConfig.productImagesWebPath}', imageName) AS imageUrl 
            FROM products 
            WHERE productId = ?;
        `;
        const values = [productId];
        const products = await dal.execute(sql, values);
        const product = products[0];
        if (!product) throw new NotFoundError(`Product with ID ${productId} not found.`);
        return product;
    }

    public async addProduct(product: ProductModel): Promise<ProductModel> {
        // Validate
        product.validateInsert();
        // Create UUID
        const productId = uuid();

        // Handle image if exists
        let imageName = null;
        if (product.image) {
            imageName = await fileSaver.add(product.image);
        }
        
        // Create SQL
        const sql = `
            INSERT INTO products(
                productId,
                name,
                description,
                startDate,
                endDate,
                price,
                imageName
            ) VALUES(?, ?, ?, ?, ?, ?, ?);
        `;

        // Create values array
        const values = [
            productId,
            product.name,
            product.description,
            product.startDate,
            product.endDate,
            product.price,
            imageName
        ];

        // Execute
        await dal.execute(sql, values);

        // Get the new Product
        const dbProduct = await this.getOneProduct(productId);
        return dbProduct;
    }

    public async updateProduct(product: ProductModel): Promise<ProductModel> {
        // Validate
        product.validateUpdate();
        // Get existing image name
        let imageName = await this.getImageName(product.productId);

        // Handle new image if exists
        if (product.image) {
            imageName = await fileSaver.update(imageName, product.image);
        }

        const sql = `
            UPDATE Products SET
                name = ?,
                description = ?,
                startDate = ?,
                endDate = ?,
                price = ?,
                imageName = ?
            WHERE ProductId = ?
        `;

        const values = [
            product.name,
            product.description,
            product.startDate,
            product.endDate,
            product.price,
            imageName,
            product.productId
        ];

        const result: OkPacketParams = await dal.execute(sql, values);
        if (result.affectedRows === 0) {
            throw new NotFoundError(`Product with ID ${product.productId} not found.`);
        }

        const updatedProduct = await this.getOneProduct(product.productId);
        return updatedProduct;
    }

    public async deleteProduct(productId: string): Promise<void> {
        // Get image name for deletion
        const imageName = await this.getImageName(productId);

        const sql = `DELETE FROM products WHERE productId = ?;`;
        const result: OkPacketParams = await dal.execute(sql, [productId]);
        
        if (result.affectedRows === 0) {
            throw new NotFoundError(`Product with ID ${productId} not found.`);
        }

        // Delete image if exists
        if (imageName) {
            await fileSaver.delete(imageName);
        }
    }

    private async getImageName(productId: string): Promise<string> {
        const sql = `SELECT imageName FROM products WHERE productId = ?`;
        const result = await dal.execute(sql, [productId]);

        if (result.length === 0) {
            throw new NotFoundError(`Product with ID ${productId} not found.`);
        }

        return result[0].imageName;
    }

    public async getProducts(filter: string, userId?: string): Promise<ProductModel[]> {
        let query = "SELECT * FROM products";
        const params: any[] = [];
    
        switch (filter) {
            case "upcoming":
                query += " WHERE startDate > ?";
                params.push(new Date());
                break;
            case "active":
                query += " WHERE startDate <= ? AND endDate >= ?";
                params.push(new Date(), new Date());
                break;
            case "liked":
                if (!userId) throw new Error("User ID is required for liked products");
                query = `
                    SELECT v.* FROM products v
                    JOIN likes l ON v.productId = l.productId
                    WHERE l.userId = ?
                `;
                params.push(userId);
                break;
        }
    
        const [products] = await dal.execute(query, params);
        return products;
    }
    

    public async searchProducts(searchValue: string, page: number = 1, pageSize: number = 10): Promise<{ products: ProductModel[], total: number }> {
        const offset = (page - 1) * pageSize;

        const sql = `
            SELECT 
                productId, 
                name, 
                description, 
                startDate, 
                endDate, 
                price,
                CONCAT('${appConfig.productImagesWebPath}', imageName) AS imageUrl
            FROM products
            WHERE name LIKE CONCAT('%', ?, '%')
            ORDER BY startDate
            LIMIT ? OFFSET ?;
        `;

        const totalSql = `
            SELECT COUNT(*) AS count
            FROM products
            WHERE name LIKE CONCAT('%', ?, '%');
        `;

        const [products, totalResult] = await Promise.all([
            dal.execute(sql, [searchValue, pageSize, offset]),
            dal.execute(totalSql, [searchValue])
        ]);

        const total = totalResult[0]?.count || 0;

        return { products, total };
    }
}

export const productService = new ProductService();