// Import only what we need from express
import { Router, Request, Response } from 'express';
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { sync } from 'read-chunk';
import fileType from 'file-type';
import { FileTypeResult } from 'file-type'
import sizeOf from 'image-size'
import JsonDB from 'node-json-db'

// Assign router to the express.Router() instance
const router: Router = Router();


export class WelcomeController {
    private router: Router
    private imagesPath: string = process.env.LocalAppData + "\\Packages\\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets"
    private db: JsonDB;

    constructor() {
        this.router = Router();
        this.db = new JsonDB('knownImages.json', true, true);
        let root:object=this.db.getData('/');
        if(!root.hasOwnProperty('knownFile')){
            this.db.push('/',{knownFile:[]})
        }
        this.init();
    }

    private init() {
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
        res.render('welcome');
    };

    public getScan = (req: Request, res: Response): void => {
        let knownFiles: String[]=this.db.getData('/knownFile');
    
        let files: string[] = readdirSync(this.imagesPath).filter((fileName) => {
            return !knownFiles.includes(fileName);
        });

        files.forEach((fileName)=>{
            this.db.push('/knownFile[]',fileName);
        })


        let fileEntrys: FileEntry[] = files
            .map((file) => {
                return new FileEntry(file, this.imagesPath, '/upload');
            }).filter((entry) => {
                let size: any = sizeOf(entry.inputPath);
                return size.width >= 1280 && size.height >= 720;
            })

        let fileList: string[] = [];

        fileEntrys.forEach((fileEntry) => {
            fileEntry.detectAndAddExtension();
            copyFileSync(fileEntry.inputPath, "." + fileEntry.uploadedPath)
            fileList.push(fileEntry.uploadedPath);
        });

        res.render('scan', { message: 'New Images: ', fileList: fileList })
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

        this.uploadedPath = uploadedPath + "\\" + fileName;
    }

    public detectAndAddExtension = (): void => {
        let buffer: Buffer = sync(this.inputPath, 0, 4100);
        let type: FileTypeResult = fileType(buffer);
        this.uploadedPath += "." + type.ext
    }
}