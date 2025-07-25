class AppConfig {
    private readonly baseUrl = process.env.REACT_APP_BASE_URL;

    constructor() {
        if (!this.baseUrl) {
            console.error("Base URL is not defined. Please check your .env file.");
            throw new Error("Base URL is missing");
        }
    }

    // General endpoints
    public readonly productsUrl = `${this.baseUrl}api/products`; // All products
    public readonly productById = `${this.baseUrl}api/products/`; // Single product
    public readonly searchproductsUrl = `${this.baseUrl}api/products/search`; // Search products
    public readonly productsImagesUrl = `${this.baseUrl}api/products/images`; // product images
    public readonly contactUsUrl = `${this.baseUrl}api/contact-us`; // Contact us endpoint

    // Likes endpoints
    public readonly likesUrl = `${this.baseUrl}api/likes`; // All likes
    public readonly likeproductUrl = (productId: string) => `${this.baseUrl}api/products/${productId}/likes`; // Like endpoint
    public readonly productLikesCountUrl = (productId: string) => `${this.baseUrl}api/products/${productId}/likes/count`; // product likes count
    public readonly userLikesUrl = `${this.baseUrl}api/users/likes`;

    // Authentication endpoints
    public readonly registerUrl = `${this.baseUrl}api/register`; // Register endpoint
    public readonly loginUrl = `${this.baseUrl}api/login`; // Login endpoint

    // Reports and contact endpoints
    public readonly reportsUrl = `${this.baseUrl}api/likes/report`; // Reports endpoint
    public readonly downloadCSVUrl = `${this.baseUrl}api/likes/report/csv`; // Download CSV report
}

export const appConfig = new AppConfig();
