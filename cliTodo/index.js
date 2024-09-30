#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { argv } = require("process");

const tasksFilePath = path.join(__dirname, "tasks.json");

let tasks = loadTasks();

function loadTasks() {
  try {
    if (fs.existsSync(tasksFilePath)) {
      const data = fs.readFileSync(tasksFilePath, "utf8");
      return data ? JSON.parse(data) : []; // Load tasks or initialize with an empty array if the file is empty
    } else {
      console.warn(
        `File ${tasksFilePath} does not exist, starting with an empty task list.`
      );
      return [];
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

function saveTasks() {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

function getNextId() {
  const ids = tasks.map((t) => parseInt(t.id));
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
}

const taskList = (status) => {
  loadTasks();

  if (status) {
    const filterTask = tasks.filter((t) => t.status === status);
    console.log("Tasks : ", filterTask);
  } else if (tasks.length < 1) {
    console.log("No Tasks!");
  } else {
    console.log("Tasks : ", tasks);
  }
};

const addTask = (description) => {
  const newTask = {
    id: getNextId(),
    description,
    status: "to-do",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tasks = [...tasks, newTask];
  saveTasks();
  console.log(`New Task added: ${description}`);
};

const updateTask = (id, newDescription) => {
  const task = tasks.find((task) => (task.id === parseInt(id) ? task : null));

  if (!task) {
    console.log(`Task with ID ${id} not found.`);
  } else {
    task.description = newDescription;
    task.updatedAt = new Date();
    saveTasks();
    console.log(`Task updated: ${newDescription}`);
  }
};

const updateStatus = (id, status) => {
  const task = tasks.find((task) => (task.id === parseInt(id) ? task : null));

  if (!task) {
    console.log(`Task with ID ${id} not found.`);
  } else {
    task.status = status;
    task.updatedAt = new Date();
    saveTasks();
    console.log(`Task id(${id}) marked ${status}.`);
  }
};

const deleteTask = (id) => {
  const task = tasks.find((task) => (task.id === parseInt(id) ? task : null));

  if (!task) {
    console.log(`Task with ID ${id} not found.`);
  } else {
    tasks = tasks.filter((t) => t.id != task.id);
    saveTasks();
    console.log(`Task delete: ${id}`);
  }
};

const controller = (action, arg) => {
  function usage() {
    console.log(`Usage: task-cli <command> [arguments]`);
    console.log(`Commands:`);
    console.log(`add <task description>            - Add a new task`);
    console.log(
      `list [status]                     - List tasks (status: done, to-do, in-progress)`
    );
    console.log(`update <id> <new description>     - Update a task by ID`);
    console.log(`delete <id>                       - Delete a task by ID`);
    console.log(
      `mark-in-progress <id>             - Mark a task as in-progress by ID`
    );
    console.log(
      `mark-done <id>                    - Mark a task as done by ID`
    );
  }

  if (!action) {
    return usage();
  }

  switch (action) {
    case "list":
      taskList(...arg);
      break;

    case "add":
      addTask(...arg);
      break;

    case "update":
      updateTask(...arg);
      break;

    case "delete":
      if (arg.length > 1) {
        console.log("Invalid command");
        return usage();
      }
      deleteTask(arg);
      break;

    case "mark-in-progress":
      if (arg.length > 1) {
        console.log("Invalid command");
        return usage();
      }
      updateStatus(arg, "in-progress");
      break;

    case "mark-done":
      if (arg.length > 1) {
        console.log("Invalid command");
        return usage();
      }
      updateStatus(arg, "done");
      break;

    default:
      console.log("Invalid command");
      usage();
  }
};

const runProgram = (argv) => {
  const action = argv[2];
  const args = argv.slice(3);
  controller(action, args);
};

runProgram(argv);
