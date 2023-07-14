class Task {
    constructor(title, dueDate, priority, checked) {
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.checked = checked;
    }

    get title() {
        return this._title;
    }

    get dueDate() {
        return this._dueDate;
    }
    
    get priority() {
        return this._priority;
    }

    get checked() {
        return this._checked;
    } 



    set title(value) {
        this._title = value;
    }

    set dueDate(value) {
        this._dueDate = value;
    }
    
    set priority(value) {
        this._priority = value;
    }

    set checked(value) {
        this._checked = value;
    } 

    toggleChecked() {
        this._checked = !this._checked;
    }
}

export { Task };