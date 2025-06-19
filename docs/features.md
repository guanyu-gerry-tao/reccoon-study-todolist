# Frontend Features

## Welcome page
- show a default todo list page for first-time user
- float text to show the page
- highlight `login` or `register` button

## Login
- User enters email and password
- On success
  - JWT is stored in `localStorage`
  - Redirect to `/todo` page
- On failure
  - Show error message pop, try again

## Register
- Enter from `/login` page: "New user? create account"
- User creates account with email and password
  - Check if email is created
  - Check and show password simplicity
  - On failure: 
    - Greyout the `create` button

## Todo
### Item
- Item will have following features:
  - date
  - time
  - location
  - reminder
  - priority
  - list

### Sub-item
- Sub-item will have title only.
- No date, priority etc.

### 