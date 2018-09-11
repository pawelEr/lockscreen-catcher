// Import only what we need from express
import { Router, Request, Response } from 'express';
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import sizeOf from 'image-size'
import JsonDB from 'node-json-db'
import { FileEntry } from '../models/file-entry.model';
import { fileTypeService } from '../services/file-type.service';

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
        this.router.get('/download/:file', this.getFile)
    }

    private prepareUploadsDir(): void {
        if (!existsSync('upload'))
            mkdirSync('upload')
    }

    public getRouter(): Router {
        return this.router;
    }

    private getHelloWorld = (req: Request, res: Response): void => {
        let fileList: string[] = this.db.getData('/cachedImage')
            .map((filePath: string)=>{
                return {imgPath:filePath, downloadLink: '/welcome/download/'+filePath.split("\\").pop()}
            });

        res.render('welcome', { fileList: fileList });

    };

    public getFile = (req: Request, res: Response): void => {
        let fileParam: string = req.params.file;
        if (fileParam) {
            let filePath: string = 'upload/' + fileParam;
            if (existsSync(filePath)) {
                res.download(filePath)
            } else {
                res.sendStatus(404);
            }
        } else {
            res.sendStatus(400);
        }
    }

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
            }).filter((entry)=>{
                return fileTypeService.detectIsImage(entry.inputPath)
            }).filter((entry) => {
                let size: any = sizeOf(entry.inputPath);
                return size.width >= 1280 && size.height >= 720;
            })

        let fileList: any[] = [];

        fileEntrys.forEach((fileEntry) => {
            fileEntry.addExtension(fileTypeService.detectExtension(fileEntry.inputPath));
            copyFileSync(fileEntry.inputPath, "." + fileEntry.uploadedPath)
            fileList.push({ imgPath: fileEntry.uploadedPath, downloadLink: '/download/' + fileEntry.fileName });
            this.db.push('/cachedImage[]', fileEntry.uploadedPath)
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