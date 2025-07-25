import Joi from "joi";
import { BadRequestError } from "./error-models";

export class LikeModel {
    public id: string;
    public userId: string;
    public productId: string;
    public likeDate: Date;

    public constructor(like: Partial<LikeModel>) {
        this.id = like.id ?? "";
        this.userId = like.userId ?? "";
        this.productId = like.productId ?? "";
        this.likeDate = like.likeDate ?? new Date();
    }

    private static validationSchema = Joi.object({
        id: Joi.string().optional().uuid(),
        userId: Joi.string().optional().uuid(),
        productId: Joi.string().optional().uuid(),
        likeDate: Joi.date().optional()
    });

    public validate(): void {
        const result = LikeModel.validationSchema.validate(this);
        if (result.error) throw new BadRequestError(result.error.message);
    }
}
