import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:'login' , loadComponent:()=>import('./logincomponent/logincomponent').then((c)=>c.LoginComponent)},
    {path:'home' , loadComponent:()=>import('./home/home').then((c)=>c.ManagementHomeComponent)},
    {path:'signup' , loadComponent:()=>import('./signup/signup').then((c)=>c.SignupComponent)},
    {path:'admin' , loadComponent:()=>import('./admin/admin').then((c)=>c.AdminComponent)},
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
