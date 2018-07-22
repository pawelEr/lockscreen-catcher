// Import only what we need from express
import { Router, Request, Response } from 'express';
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import sizeOf from 'image-size'
import JsonDB from 'node-json-db'
import { FileEntry } from '../models/file-entry.model';

// Assign router to the express.Router() instance
const router: Router = Router();

export class WelcomeController {
    private router: Router = Router();
    private imagesPath: string = process.env.LocalAppData + "\\Packages\\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets"
    private db: JsonDB = new JsonDB('knownImages.json', true, true);

    constructor() {
        this.prepareUploadsDir();
        this.prepareDb();
        this.initRoutes();
    }

    private prepareDb(): void {
        let root: object = this.db.getData('/');

        if (!root.hasOwnProperty('knownFile'))
            this.db.push('/knownFile', [])

        if (!root.hasOwnProperty('cachedImage'))
            this.db.push('/cachedImage', [])
    }

    private initRoutes(): void {
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

    private getHelloWorld = (req: Request, res: Response): void => {
        let fileList: string[]=this.db.getData('/cachedImage');

        res.render('welcome', {fileList: fileList});

    };

    public getScan = (req: Request, res: Response): void => {
        let knownFiles: String[] = this.db.getData('/knownFile');

        let files: string[] = readdirSync(this.imagesPath).filter((fileName) => {
            return !knownFiles.includes(fileName);
        });

        files.forEach((fileName) => {
            this.db.push('/knownFile[]', fileName);
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
            this.db.push('/cachedImage[]',fileEntry.uploadedPath)
        });

        res.render('scan', { fileList: fileList })
    }

    private getName(req: Request, res: Response): void {
        // Extract the name from the request parameters
        let { name } = req.params;

        // Greet the given name
        res.send(`Hello, ${name}`);
    }
}