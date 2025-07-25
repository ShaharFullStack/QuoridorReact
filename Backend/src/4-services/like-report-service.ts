import { dal } from "../2-utils/dal";

class LikeReportService {
    public async generateGlobalLikesReport(): Promise<any[]> {
        const sql = `
            SELECT 
                p.name,
                COUNT(l.id) AS likeCount
            FROM products p
            LEFT JOIN likes l ON p.productId = l.productId
            GROUP BY p.productId, p.name
            ORDER BY likeCount DESC
        `;

        interface LikeReportRow {
            name: string;
            likeCount: number;
        }

        const result = await dal.execute(sql);
        return result.map((row: LikeReportRow) => ({
            name: row.name,
            nameLong: row.name || "",
            likeCount: row.likeCount || 0,
        }));
    }

    public async generateLikesCSV(): Promise<string> {
        const reportData = await this.generateGlobalLikesReport();
        const csvData = reportData.map(row => `"${row.name}",${row.likeCount}`).join("\n");
        return `Name,Likes\n${csvData}`;
    }

}

export const likeReportService = new LikeReportService();
