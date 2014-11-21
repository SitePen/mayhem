import data = require('mayhem/data/interfaces');
import lang = require('dojo/_base/lang');
import Proxy = require('mayhem/data/Proxy');
import UserRegistration = require('../models/UserRegistration');
import WebApplication = require('mayhem/WebApplication');
import ValidationError = require('mayhem/validation/ValidationError');
import Validator = require('mayhem/validation/Validator');


class Registration extends Proxy<UserRegistration> {
    get:Registration.Getters;
    set:Registration.Setters;

    private _validators:HashMap<Validator[]>;

    constructor(kwargs?:any) {
        super(kwargs);

        this._validators = {
            email: [
                new emailValidator()
            ]
        };
        this._createNewTarget();
    }

    private _createNewTarget():void {
        this.set('target', new UserRegistration({
            validators: this._validators
        }));
    }

    save(): void {
        var self = this;
        var errors:HashMap<ValidationError[]>;
        var validationErrors:Error[];
        var key:string;
        this.get('target').save().then(function () {
            self._createNewTarget();
            self.get('app').get('router').go('thanks', {});
        }).otherwise(function () {
            // Stay on screen.  This function stops errors from appearing in the console.
        });
    }
}

module Registration {
    export interface Getters extends Proxy.Getters{
        (key:'target'):UserRegistration;
        (key:'app'):WebApplication;
    }
    export interface Setters extends Proxy.Setters{
        (key:'target', value:UserRegistration):void;
        (key:'app', value:WebApplication):void;
    }
}

class emailValidator extends Validator {

    validate(model:data.IModel, key:string, value:any):void {
        var email:string = value && lang.trim(value);
        if (model.get('allowedToContact')) {
            if (!email) {
                model.addError(key, new ValidationError("Please oh please enter an email address."));
            }
        }
    }
}

export = Registration;