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

Scenario: An added user is shown on the user list
    Given Admin is logged in
    And a user is created
    When I press the user list button
    And I am on the list user page
    Then the created user xxxxx is listed

Scenario: An admin can enter to the user creation page from user list page
    Given Admin is logged in
    And I am on the user list page
    When I press create user button
    Then the user creation page is shown
