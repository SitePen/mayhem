import Observable = require('mayhem/Observable');

class UserRegistration extends Observable {
    get:UserRegistration.Getters;
    set:UserRegistration.Setters;
}

module UserRegistration {
    export interface Getters extends Observable.Getters {
        (key:'name'):string;
    }

    export interface Setters extends Observable.Setters {
        (key:'name', value:string):void;
    }
}

export = UserRegistration;