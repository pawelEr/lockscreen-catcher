import { sync } from 'read-chunk';
import fileType from 'file-type';
import { FileTypeResult } from 'file-type'

export class fileTypeService {
    public static detectExtension(inputPath: string): string {
        let buffer: Buffer = sync(inputPath, 0, 4100);
        let type: FileTypeResult = fileType(buffer);
        return type.ext;
    }

    public static detectIsImage(inputPath: string): boolean {
        let buffer: Buffer = sync(inputPath, 0, 4100);
        let type: FileTypeResult = fileType(buffer);
        return type.mime.startsWith('image');
    }
}