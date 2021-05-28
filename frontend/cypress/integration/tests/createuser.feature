Feature: As a admin I want to create a new user

Scenario: A new user is succesfully created by an admin with valid information

Given Admin is logged in
And I am on the create user page
When valid information are entered
Then a user is succesfully created

Scenario: A new user is not created by an admin if username is too short

Given Admin is logged in
And I am on the create user page
When too short username is entered
Then a user is not created and an error message is shown

Scenario: Create user form is not shown to the employee

Given Employee is logged in
When the employee enters to correct URL
Then an error is shown

Scenario: An user list is shown to an admin

Given Admin is logged in
When I enter to the user list page
Then the user list is shown