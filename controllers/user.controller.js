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
