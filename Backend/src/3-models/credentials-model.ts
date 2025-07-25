export class CredentialsModel {

    public email: string;
    public password: string;

    public constructor(credentials: CredentialsModel) {
        this.email = credentials.email;
        this.password = credentials.password;
    }
    public validate(): void {
        if (!this.email || !this.password) {
            throw new Error("Email and password are required.");
        }
        if (this.password.length < 6) {
            throw new Error("Password must be at least 6 characters long.");
        }
        if (!this.email.includes("@")) {
            throw new Error("Invalid email format.");
        }
    }


}

