
export class FileEntry {
    fileName: string;
    inputPath: string;
    uploadedPath: string;

    constructor(fileName: string, inputPath: string, uploadedPath: string) {
        this.fileName = fileName;
        this.inputPath = inputPath + "\\" + fileName;
        this.uploadedPath = uploadedPath + "\\" + fileName;
    }

    /**
     * addExtension
     */
    public addExtension = (extension: string): void => {
        this.uploadedPath += "." + extension;
    }
}