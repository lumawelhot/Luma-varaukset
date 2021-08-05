Feature: Admin functionality

Scenario: As an admin I want to log in
  Given Admin is not logged in
  And admin is on the main page
  When I navigate to the login form
  And I enter correct login credentials
  Then I am logged in

Scenario: As an admin I cannot log in with wrong password
  Given Admin is not logged in
  And admin is on the main page
  When I navigate to the login form
  And I enter incorrect password
  Then I am not logged in

Scenario: As an admin I want to create a new user
  Given Admin is logged in
  And admin is on the main page
  When I navigate to the user creation form
  And I enter new user credentials
  Then the user is created

Scenario: As an admin I want to change the password of an another user
  Given Admin is logged in
  And admin is on the main page
  When I navigate to the user list page
  And I choose the user which password I want to change
  And I enter users' new password
  Then the password of the specific user is changed

Scenario: As an admin I want to delete an user
  Given Admin is logged in
  And admin is on the main page
  When I navigate to the user list page
  And I click user deletion button
  Then the user is deleted