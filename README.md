# matthis-brew-backend

## major

### 06.04.2021
- email address from external user is now called publicEmail
- publicEmail can be set in settings->showPublicEmail

## minor

### 06.04.2021
- adds recipe model
- adds machine model
- adds the following settings to user:
  - darkmode
  - signature
  - description
- adds related graphql-methods
- adds Userlist-Functionality
  - List of users can be fetched
    - without parameter to show full available list
    - with regEx search pattern to filter out usernames
    - with limit of count
