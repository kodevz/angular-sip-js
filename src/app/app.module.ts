import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PhoneCallModule } from './components/phone-call/phone-call.module';
import { PhoneCallComponent } from './components/phone-call/phone-call.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelect2Module } from 'ng-select2';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        PhoneCallModule,
        NgbModule,
        NgSelect2Module
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [
        PhoneCallComponent
    ]
})
export class AppModule { }
