// Import only what we need from express
import { Router, Request, Response } from 'express';
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { sync } from 'read-chunk';
import FileType from 'file-type';
import { FileTypeResult } from 'file-type'

// Assign router to the express.Router() instance
const router: Router = Router();


export class WelcomeController {
    private router: Router
    private imagesPath: string = process.env.LocalAppData + "\\Packages\\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets"

    constructor() {
        this.router = Router();
        this.init();
    }

    init() {
        this.prepareUploadsDir();

        this.router.get('/', this.getHelloWorld)
        this.router.get('/scan', this.getScan)
        this.router.get('/:name', this.getName)
    }

    private prepareUploadsDir(): void {
        if (!existsSync('upload'))
            mkdirSync('upload')
    }

    public getRouter(): Router {
        return this.router;
    }

    private getHelloWorld(req: Request, res: Response): void {
        // Reply with a hello world when no name param is provided
        res.send('Hello, World!');
    };

    public getScan = (req: Request, res: Response): void => {


        let files: string[] = readdirSync(this.imagesPath);


        let fileEntrys: FileEntry[] = files.map((file) => {

            return new FileEntry(file, this.imagesPath, '/upload');
        })
        fileEntrys.forEach((fileEntry) => {

            copyFileSync(fileEntry.inputPath, "." + fileEntry.uploadedPath)
        });


        let fileList: string[] = fileEntrys.map((file) => { return file.uploadedPath });
        res.render('scan', { message: 'Scan result: ', fileList: fileList })
    }

    private getName(req: Request, res: Response): void {
        // Extract the name from the request parameters
        let { name } = req.params;

        // Greet the given name
        res.send(`Hello, ${name}`);
    }
}

class FileEntry {
    fileName: string;
    inputPath: string;
    uploadedPath: string;

    constructor(fileName: string, inputPath: string, uploadedPath: string) {
        this.fileName = fileName;
        this.inputPath = inputPath + "\\" + fileName;
        let buffer: Buffer = sync(this.inputPath, 0, 4100);
        let type: FileTypeResult = FileType(buffer);
        this.uploadedPath = uploadedPath + "\\" + fileName + "." + type.ext;
    }
}