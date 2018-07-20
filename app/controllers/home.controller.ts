import {Router, Request, Response} from 'express';


const controller: Router = Router();

controller.get('/',(req: Request, res: Response)=>{
    res.redirect('/welcome');
})

export const HomeController: Router = controller;