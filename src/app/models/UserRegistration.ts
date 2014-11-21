import dojoDeclare = require('dojo/_base/declare');
import DomStorage = require('mayhem/data/stores/DomStorage');
import PersistentModel = require('mayhem/data/PersistentModel');
import Trackable = require('dstore/Trackable');
import ValidationError = require('mayhem/validation/ValidationError');

class UserRegistration extends PersistentModel {
    get:UserRegistration.Getters;
    set:UserRegistration.Setters;
}

module UserRegistration {
    export interface Getters extends PersistentModel.Getters {
        (key:'allowedToContact'):boolean;
        (key:'dateOfBirth'):Date;
        (key:'email'):string
        (key:'favoriteBrowser'):string;
        (key:'name'):string;
        (key:'notes'):string;
        (key:'typeOfDeveloper'):string;
        (key:'errors'):HashMap<ValidationError[]>;

    }

    export interface Setters extends PersistentModel.Setters {
        (key:'allowedToContact', value:boolean):void;
        (key:'dateOfBirth', value:Date):void;
        (key:'email', value:string):void
        (key:'favoriteBrowser', value:string):void;
        (key:'name', value:string):void;
        (key:'notes', value:string):void;
        (key:'typeOfDeveloper', value:string):void;
        (key:'errors', value:HashMap<ValidationError[]>):void;
    }
}

UserRegistration.setDefaultStore(<any> new (<any> dojoDeclare([ DomStorage, Trackable ]))({ key: 'mayhem-prototype2' }));

export = UserRegistration;