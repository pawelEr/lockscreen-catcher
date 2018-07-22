import { sync } from 'read-chunk';
import fileType from 'file-type';
import { FileTypeResult } from 'file-type'

export class FileEntry {
    fileName: string;
    inputPath: string;
    uploadedPath: string;

    constructor(fileName: string, inputPath: string, uploadedPath: string) {
        this.fileName = fileName;
        this.inputPath = inputPath + "\\" + fileName;
        this.uploadedPath = uploadedPath + "\\" + fileName;
    }

    //TODO: push it to some service
    public detectAndAddExtension = (): void => {
        let buffer: Buffer = sync(this.inputPath, 0, 4100);
        let type: FileTypeResult = fileType(buffer);
        this.uploadedPath += "." + type.ext
    }
}