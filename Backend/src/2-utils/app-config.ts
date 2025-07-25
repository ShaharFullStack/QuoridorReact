import dotenv from "dotenv";

// Load ".env" file into process.env object:
dotenv.config();

class AppConfig {

    public readonly isDevelopment = process.env.ENVIRONMENT === "development";
    public readonly isProduction = process.env.ENVIRONMENT === "production";
    public readonly port = process.env.PORT !== undefined ? Number(process.env.PORT) : 4000; // Default to 4000 if undefined
    public readonly host = process.env.MYSQL_HOST;
    public readonly user = process.env.MYSQL_USER;
    public readonly password = process.env.MYSQL_PASSWORD;
    public readonly database = process.env.MYSQL_DATABASE;
    public readonly jwtSecret = process.env.JWT_SECRET;
    public readonly hashingSalt = process.env.HASHING_SALT;
    public readonly productImagesWebPath = process.env.PRODUCT_IMAGES_WEB_PATH;

    
}
export const appConfig = new AppConfig();