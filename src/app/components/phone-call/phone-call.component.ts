import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Options } from 'select2';
import { Select2OptionData } from 'ng-select2';
import * as JsSIP from 'jssip';

(window as any).global = window;
@Component({
    selector: 'app-phone-call',
    templateUrl: './phone-call.component.html',
    styleUrls: ['./phone-call.component.scss']
})
export class PhoneCallComponent implements OnInit, AfterViewInit {

    callInprogress = false;

    s2Options: Options = {
        multiple: true,
        width: '100'
    }

    phoneNumbers: Select2OptionData[];

    selectedPhoneNumber: string;

    sipUA: JsSIP.UA;

    rtcSession: JsSIP.RTCSession;

    sipStatus: string;

    //callStatus: string;

    sounds: any;

    callStatus_: string;

    callStatus: CallStatus = new CallStatus;

    isReady: boolean = false;

    callStart: boolean = false;

    @ViewChild('incoming', { static: false }) incomingSound: ElementRef<HTMLAudioElement>;

    @ViewChild('outgoing', { static: false }) outgoingSound: ElementRef<HTMLAudioElement>;

    @ViewChild('dmtf', { static: false }) dmtfSound: ElementRef<HTMLAudioElement>;

    timer: number = 0;

    interval;


    constructor(private modalService: NgbModal) { }

    ngOnInit() {
        this.initSip();
    }

    ngAfterViewInit() {
        this.sounds = {
            incoming: this.incomingSound.nativeElement,
            outgoing: this.incomingSound.nativeElement,
            dmtf: this.incomingSound.nativeElement
        }
    }

    initSip() {

        const configuration = {
            ws_servers: 'wss://edge.sip.onsip.com',
            uri: 'sip:alice@sipjs.onsip.com',
            password: '3040'
        };

        this.sipUA = new JsSIP.UA(configuration);


        this.sipUA.on('connecting', e => {
            this.sipStatus = 'Connecting...';
        });

        this.sipUA.on('connected', e => {
            this.sipStatus = 'Connected';
        });

        this.sipUA.on('disconnected', e => {
            this.sipStatus = 'Disconnected';
        });

        this.sipUA.on('registered', e => {
            this.sipStatus = 'Ready';
            this.isReady = true;
        });

        this.sipUA.on('unregistered', e => {
            this.sipStatus = 'UnRegistered';
        });

        this.sipUA.on('registrationFailed', e => {
            console.log(e)
            this.sipStatus = 'Registration Failed';
        });

        this.sipUA.on('newRTCSession', e => {
            this.rtcSession = e;
        });

        this.sipUA.on('newMessage', e => {
            //this.rtcSession = e;
        });

        this.phoneNumbers = [
            {
                id: '+149898987967',
                text: '+149898987967'
            },
            {
                id: '+149898456967',
                text: '+149898456967'
            },
            {
                id: '+14989844566',
                text: '+14989844566'
            }
        ];
    }


    open(content) {

        this.sipUA.start();

        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {

        }, (reason) => {

        });
    }

    async makeCall() {

        if (this.rtcSession && this.rtcSession.isInProgress()) {
            this.rtcSession.terminate();
            return true;
        }


        const callOptions = {
            mediaConstraints: { audio: true, video: true },
        };


        const number = this.phoneNumbers[0]['id'];

        this.rtcSession = this.sipUA.call('sip:bob@example.com', callOptions);


        this.rtcSession.on('peerconnection', () => {
            this.callStatus.currentStatus = 'DAILING';
            this.callStatus.resetCallStatus().dailing = true;
            this.stopSound().outgoing.play();
        });


        this.rtcSession.on('progress', e => {
            this.callStatus.resetCallStatus().inProgress = true;
        });

        this.rtcSession.on('accepted', e => {
            this.stopSound();
            this.startCallTimer();
        });

        this.rtcSession.on('ended', e => {
            this.callTerminated();
            this.stopCallTimer();
        });

        this.rtcSession.on('failed', e => {
            this.callTerminated();
            this.stopCallTimer();
        });

        this.rtcSession.on('hold', e => {
            this.callStatus.currentStatus = 'ON HOLD';
            this.callStatus.onHold = true;
        });

        this.rtcSession.on('unhold', e => {

            this.callStatus.currentStatus = 'IN PROGRESS';
            this.callStatus.onHold = false;
        });

        this.rtcSession.on('muted', e => {
            this.callStatus.currentStatus = 'MUTE';
            this.callStatus.onMute = true;
        });

        this.rtcSession.on('unmuted', e => {
            this.callStatus.onMute = false;
        });
    }

    callTerminated() {
        this.callStatus.resetCallStatus();

        this.callStatus.currentStatus = 'CALL ENDED';

        setTimeout(() => {
            this.callStatus.currentStatus = '';
        }, 1000);

        this.stopSound();
    }

    onMute() {

        if (this.isMuted()) {
            this.rtcSession.unmute();
            return;
        }

        this.rtcSession.mute()
    }


    stopSound(): CallSounds {
        Object.keys(this.sounds).map((value) => (this.sounds[value].pause()));

        return this.sounds;
    }


    isInProgress(): boolean {
        return this.rtcSession.isInProgress();
    }

    isEstablished(): boolean {
        if (!this.rtcSession) return false;
        return this.rtcSession.isEstablished();
    }

    isEnded(): boolean {
        return this.rtcSession.isEnded();
    }

    isReadyToReOffer(): boolean {
        return this.rtcSession.isReadyToReOffer();
    }

    isMuted(): boolean {
        if (!this.rtcSession) return false;
        return this.rtcSession.isMuted().audio;
    }

    isOnHold(): boolean {
        if (!this.rtcSession) return true;
        return this.rtcSession.isOnHold();
    }

    startCallTimer() {
        this.interval = setInterval(() => {
            this.timer += 1000;
        }, 1000)
    }

    stopCallTimer() {
        clearInterval(this.interval);
    }
}

interface CallSounds {
    [key: string]: HTMLAudioElement;
}


class CallStatus {

    dailing: boolean;

    connecting: boolean;

    inProgress: boolean;

    onHold: boolean;

    onMute: boolean;

    currentStatus: string;

    isReadyToCall: boolean;


    resetCallStatus = (): CallStatus => {
        this.dailing = false;
        this.connecting = false;
        this.inProgress = false;
        this.onHold = false;
        this.onMute = false;

        return this;
    }

    isCalling(): boolean {
        return this.dailing || this.inProgress;
    }


}