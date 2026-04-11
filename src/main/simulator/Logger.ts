export class DebugLogger {

    private static readonly logging: boolean = false;

    public static isLoggingEnabled(): boolean {

        return this.logging;
    }

    public static log(message?: any, ...optionalParams: any[]): void {

        if (this.logging) {
            console.log(message, optionalParams);
        }
    }
}