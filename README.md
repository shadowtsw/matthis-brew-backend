# matthis-brew-backend

# major

### 07.04.2021
- some response models are renamed
-------------------------------------------------------------------
### 06.04.2021
- email address from external user is now called publicEmail
- publicEmail can be set in settings->showPublicEmail

# minor

### 07.04.2021
- advanced user management
  - add user to favourites/buddies
  - shows that user has added you to his friends
  - show more details on savedRecipes, favouriteRecipes, ownRecipes

- recipe managemnt implemented
  - add recipe
  - save recipe to favourites, savedRecipes
  - like,dislike and comment recipes, remove own comment from recipe
-------------------------------------------------------------------
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
