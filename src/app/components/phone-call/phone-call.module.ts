import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneCallComponent } from './phone-call.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelect2Module } from 'ng-select2';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [PhoneCallComponent],
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NgSelect2Module
    ],
    exports: [
        PhoneCallComponent
    ]
})
export class PhoneCallModule { }
