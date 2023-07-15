class Project {
    constructor(name, tasks) {
        this.name = name;
        this.tasks = tasks;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get tasks() {
        return this._tasks;
    }

    set tasks(value) {
        this._tasks = value;
    }

    deleteTask(task) {
        const index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
    }

    sortByDate() {
        this.tasks.sort((a, b) => {
            return a.dueDate - b.dueDate;
        });
    }
}

export { Project };