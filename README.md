### [Read the tutorial](https://carloscaballero.io/understanding-mvc-for-frontend-vanillajs/) 

# Introduction

This post is the first in a series of three posts that will understand how the MVC architecture works to create frontend applications. The objective of this series of posts is to understand how to structure a frontend application by evolving a web page in which JavaScript is used as a scripting language towards an application in which JavaScript is used as an object-oriented language.

In this first post, the application will be built using VanillaJS. Therefore, this article is where the largest amount of code related to the DOM will be developed. However, it is very important to understand how all the parts of the application are related and how it is structured.

In the second article, we will reinforce the JavaScript code by transforming it into its TypeScript version.

Finally, in the last article we will transform our code to integrate it with the Angular framework.



* [Part 1. Understanding MVC-Services for Frontend: VanillaJS](build-your-pokedex-part1-introduction-ngrx)
* Part 2. Understanding MVC-Services for Frontend: TypeScript
* Part 3. Understanding MVC-Services for Frontend: Angular
---



# Project Architecture
There is nothing more valuable than an image to understand what we are going to build, there is a GIF below in which the application we are going to build is illustrated.


![demo](https://miro.medium.com/max/640/1*AdRdnVeheeydi2vrXepO-Q.gif)

This application can be built using a single JavaScript file which modifies the DOM of the document and performs all operations, but this is a strongly coupled code and is not what we intend to apply in this post.

What is the MVC architecture? MVC is an architecture with 3 layers / parts:

- **Models** - Manage the data of an application. The models will be anemic (they will lack functionalities) since they will be referred to the services.
- **Views** - A visual representation of the models.
- **Controllers** - Links between services and views.

Below, we show the file structure that we will have in our problem domain:

![folders](/content/images/2019/10/folders.png)

The ```index.html``` file will act as a canvas on which the entire application will be dynamically built using the ```root``` element. In addition, this file will act as a loader of all the files since they will be linked in the html file itself.

Finally, our file architecture is composed of the following JavaScript files:

- **user.model.js** - The attributes (the model) of a user.
- **user.controller.js** - The one in charge of joining the service and the view.
- **user.service.js** - Manage all operations on users.
- **user.views.js** - Responsible for refreshing and changing the display screen.

The HTML file is the one shown below:



```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />

    <title>User App</title>

    <link rel="stylesheet" href="style.css" />
  </head>

  <body>
    <div id="root"></div>
    <script src="models/user.model.js"></script>
    <script src="services/user.service.js"></script>
    <script src="controllers/user.controller.js"></script>
    <script src="views/user.view.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

---- 
# Models (anemic)
The first class built in this example is the application model, ```user.model.js```, which consists of the class attributes, and a private method that is generating random IDs (these id's could come from a database in the server).

The models will have the following fields:
- **id**. Unique value.
- **name**. The name of the users.
- **age**. The age of the users.
- **complete**. Boolean that lets you know whether we can cross the user off the list.

The ```user.model.js``` is shown below:

```javascript
/**
 * @class Model
 *
 * Manages the data of the application.
 */

class User {
  constructor({ name, age, complete } = { complete: false }) {
    this.id = this.uuidv4();
    this.name = name;
    this.age = age;
    this.complete = complete;
  }

  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }
}
```
---- 
# Services
The operations performed on users are carried out in the service. The service is what allows the models to be anemic, since all the logic load is in them. In this specific case, we will use an array to store all users and build the four methods associated with reading, modifying, creating and deleting (CRUD) users. You should note that the service makes use of the model, instantiating the objects that are extracted from ```LocalStorage``` to the ```User class```. This is because ```LocalStorage``` only stores data and not prototypes of stored data. The same happens with the data that travels from the backend to the frontend, they do not have their classes instantiated.

The constructor of our class is as follows:

```javascript
  constructor() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    this.users = users.map(user => new User(user));
  }
```

Note that we have defined a class variable called ```users``` that stores all users once they have been transformed from a flat object to a prototyped object of the ```User``` class.

The next thing we must define in the service will be each of the operations we want to develop. These operations are shown below using ECMAScript, without using a single line in TypeScript:

```javascript
add(user) {
    this.users.push(new User(user));

    this._commit(this.users);
  }

  edit(id, userToEdit) {
    this.users = this.users.map(user =>
      user.id === id
        ? new User({
            ...user,
            ...userToEdit
          })
        : user
    );

    this._commit(this.users);
  }

  delete(_id) {
    this.users = this.users.filter(({ id }) => id !== _id);

    this._commit(this.users);
  }

  toggle(_id) {
    this.users = this.users.map(user =>
      user.id === _id ? new User({ ...user, complete: !user.complete }) : user
    );

    this._commit(this.users);
  }
```

It remains to be defined the ```commit``` method that is responsible for storing the operation performed in our data store (in our case ```LocalStorage```).

```javascript
  bindUserListChanged(callback) {
    this.onUserListChanged = callback;
  }
  
  _commit(users) {
    this.onUserListChanged(users);
    localStorage.setItem('users', JSON.stringify(users));
  }
```


This method invokes a ```callback``` function that has been binded when creating the Service, as it can be seen in the definition of the ```bindUserListChanged```` method. I can already tell you that this callback is the function that comes from the view and is responsible for refreshing the list of users on the screen.

The file ```user.service.js``` is as follows:

```javascript
/**
 * @class Service
 *
 * Manages the data of the application.
 */
class UserService {
  constructor() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    this.users = users.map(user => new User(user));
  }

  bindUserListChanged(callback) {
    this.onUserListChanged = callback;
  }

  _commit(users) {
    this.onUserListChanged(users);
    localStorage.setItem('users', JSON.stringify(users));
  }

  add(user) {
    this.users.push(new User(user));

    this._commit(this.users);
  }

  edit(id, userToEdit) {
    this.users = this.users.map(user =>
      user.id === id
        ? new User({
            ...user,
            ...userToEdit
          })
        : user
    );

    this._commit(this.users);
  }

  delete(_id) {
    this.users = this.users.filter(({ id }) => id !== _id);

    this._commit(this.users);
  }

  toggle(_id) {
    this.users = this.users.map(user =>
      user.id === _id ? new User({ ...user, complete: !user.complete }) : user
    );

    this._commit(this.users);
  }
}
```
---- 
# Views
The view is the visual representation of the model. Instead of creating HTML content and injecting it (as it is done in many frameworks) we have decided to dynamically create the whole view. The first thing that should be done is to cache all the variables of the view through the DOM methods as shown in the view constructor:


```javascript
constructor() {
    this.app = this.getElement('#root');

    this.form = this.createElement('form');
    this.createInput({
      key: 'inputName',
      type: 'text',
      placeholder: 'Name',
      name: 'name'
    });
    this.createInput({
      key: 'inputAge',
      type: 'text',
      placeholder: 'Age',
      name: 'age'
    });

    this.submitButton = this.createElement('button');
    this.submitButton.textContent = 'Submit';

    this.form.append(this.inputName, this.inputAge, this.submitButton);

    this.title = this.createElement('h1');
    this.title.textContent = 'Users';
    this.userList = this.createElement('ul', 'user-list');
    this.app.append(this.title, this.form, this.userList);

    this._temporaryAgeText = '';
    this._initLocalListeners();
  }
  ```

The next most relevant point of the view is the union of the view with the service methods (which will be sent through the controller). For example, the ```bindAddUser``` method receives a driver function as a parameter that is the one that will perform the ```addUser``` operation, described in the service. In the ```bindXXX``` methods, the ```EventListener``` of each of the view controls are being defined. Note that from the view we have access to all the data provided by the user from the screen; which are connected through the ```handler``` functions.

```javascript
 bindAddUser(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault();

      if (this._nameText) {
        handler({
          name: this._nameText,
          age: this._ageText
        });
        this._resetInput();
      }
    });
  }

  bindDeleteUser(handler) {
    this.userList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = event.target.parentElement.id;

        handler(id);
      }
    });
  }

  bindEditUser(handler) {
    this.userList.addEventListener('focusout', event => {
      if (this._temporaryAgeText) {
        const id = event.target.parentElement.id;
        const key = 'age';

        handler(id, { [key]: this._temporaryAgeText });
        this._temporaryAgeText = '';
      }
    });
  }

  bindToggleUser(handler) {
    this.userList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = event.target.parentElement.id;

        handler(id);
      }
    });
  }
```

The rest of the code of the view goes through handling the DOM of the document. The file ```user.view.js``` is as follows:


```javascript
/**
 * @class View
 *
 * Visual representation of the model.
 */
class UserView {
  constructor() {
    this.app = this.getElement('#root');

    this.form = this.createElement('form');
    this.createInput({
      key: 'inputName',
      type: 'text',
      placeholder: 'Name',
      name: 'name'
    });
    this.createInput({
      key: 'inputAge',
      type: 'text',
      placeholder: 'Age',
      name: 'age'
    });

    this.submitButton = this.createElement('button');
    this.submitButton.textContent = 'Submit';

    this.form.append(this.inputName, this.inputAge, this.submitButton);

    this.title = this.createElement('h1');
    this.title.textContent = 'Users';
    this.userList = this.createElement('ul', 'user-list');
    this.app.append(this.title, this.form, this.userList);

    this._temporaryAgeText = '';
    this._initLocalListeners();
  }

  get _nameText() {
    return this.inputName.value;
  }
  get _ageText() {
    return this.inputAge.value;
  }

  _resetInput() {
    this.inputName.value = '';
    this.inputAge.value = '';
  }

  createInput(
    { key, type, placeholder, name } = {
      key: 'default',
      type: 'text',
      placeholder: 'default',
      name: 'default'
    }
  ) {
    this[key] = this.createElement('input');
    this[key].type = type;
    this[key].placeholder = placeholder;
    this[key].name = name;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

    return element;
  }

  getElement(selector) {
    return document.querySelector(selector);
  }

  displayUsers(users) {
    // Delete all nodes
    while (this.userList.firstChild) {
      this.userList.removeChild(this.userList.firstChild);
    }

    // Show default message
    if (users.length === 0) {
      const p = this.createElement('p');
      p.textContent = 'Nothing to do! Add a user?';
      this.userList.append(p);
    } else {
      // Create nodes
      users.forEach(user => {
        const li = this.createElement('li');
        li.id = user.id;

        const checkbox = this.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = user.complete;

        const spanUser = this.createElement('span');

        const spanAge = this.createElement('span');
        spanAge.contentEditable = true;
        spanAge.classList.add('editable');

        if (user.complete) {
          const strikeName = this.createElement('s');
          strikeName.textContent = user.name;
          spanUser.append(strikeName);

          const strikeAge = this.createElement('s');
          strikeAge.textContent = user.age;
          spanAge.append(strikeAge);
        } else {
          spanUser.textContent = user.name;
          spanAge.textContent = user.age;
        }

        const deleteButton = this.createElement('button', 'delete');
        deleteButton.textContent = 'Delete';
        li.append(checkbox, spanUser, spanAge, deleteButton);

        // Append nodes
        this.userList.append(li);
      });
    }
  }

  _initLocalListeners() {
    this.userList.addEventListener('input', event => {
      if (event.target.className === 'editable') {
        this._temporaryAgeText = event.target.innerText;
      }
    });
  }

  bindAddUser(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault();

      if (this._nameText) {
        handler({
          name: this._nameText,
          age: this._ageText
        });
        this._resetInput();
      }
    });
  }

  bindDeleteUser(handler) {
    this.userList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = event.target.parentElement.id;

        handler(id);
      }
    });
  }

  bindEditUser(handler) {
    this.userList.addEventListener('focusout', event => {
      if (this._temporaryAgeText) {
        const id = event.target.parentElement.id;
        const key = 'age';

        handler(id, { [key]: this._temporaryAgeText });
        this._temporaryAgeText = '';
      }
    });
  }

  bindToggleUser(handler) {
    this.userList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = event.target.parentElement.id;

        handler(id);
      }
    });
  }
}
```
---- 
# Controllers
The last file of this architecture is the controller. The controller receives the two dependencies it has (service and view) by dependency injection (DI). Those dependencies are stored in the controller in private variables. In addition, the constructor makes the explicit connection between view and services since the controller is the only element that has access to both parties.

The file ```user.controller.js``` is the one shown below:


```javascript
/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class UserController {
  constructor(userService, userView) {
    this.userService = userService;
    this.userView = userView;

    // Explicit this binding
    this.userService.bindUserListChanged(this.onUserListChanged);
    this.userView.bindAddUser(this.handleAddUser);
    this.userView.bindEditUser(this.handleEditUser);
    this.userView.bindDeleteUser(this.handleDeleteUser);
    this.userView.bindToggleUser(this.handleToggleUser);

    // Display initial users
    this.onUserListChanged(this.userService.users);
  }

  onUserListChanged = users => {
    this.userView.displayUsers(users);
  };

  handleAddUser = user => {
    this.userService.add(user);
  };

  handleEditUser = (id, user) => {
    this.userService.edit(id, user);
  };

  handleDeleteUser = id => {
    this.userService.delete(id);
  };

  handleToggleUser = id => {
    this.userService.toggle(id);
  };
}
```

---- 

# App.js
The last point of our application is the application launcher. In our case, we have called it ```app.js```. The application is executed through the creation of the different elements: ```UserService```, ```UserView``` and ```UserController```, as shown in the file ```app.js```.


```javascript
const app = new UserController(new UserService(), new UserView());
```
---- 
# Conclusions

In this first post, we have developed a Web application in which the project has been structured following the MVC architecture in which anemic models are used and the responsibility for the logic lies on the services.

It is very important to highlight that the didactical of this post is to understand the structuring of the project in different files with different responsibilities and how the view is totally independent of the model/service and the controller.

In the following article, we will reinforce JavaScript using TypeScript, which will give us a more powerful language to develop Web applications. The fact that we have used JavaScript has caused us to write a lot of verbose and repetitive code for the management of the DOM (this will be minimized using the Angular framework).

---
The *GitHub branch* of this post is [https://github.com/Caballerog/VanillaJS-MVC-Users](https://github.com/Caballerog/VanillaJS-MVC-Users)


