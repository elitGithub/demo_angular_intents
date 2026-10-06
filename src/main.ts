import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { ContactComponent } from './app/contact.component';
import { AboutComponent } from './app/about.component';

bootstrapApplication(AppComponent, {
  providers: [provideRouter([
    { path: 'contact', component: ContactComponent, title: 'Contact — Signal' },
    { path: 'about', component: AboutComponent, title: 'About — Signal' },
    { path: '', redirectTo: 'contact', pathMatch: 'full' },
    { path: '**', redirectTo: 'contact' }
  ], withInMemoryScrolling({ scrollPositionRestoration: 'top' }))]
}).catch(error => console.error('Unable to start the Signal demo.', error));
