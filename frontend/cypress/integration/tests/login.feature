Feature: As a user I want to log in

Scenario: A user can log in with valid username and password
    Given I am on the login page
    When valid username and password are entered
    Then user is logged in

Scenario: A user can't log in with valid username and invalid password
    Given I am on the login page
    When valid username and invalid password are entered
    Then user is not logged in and error message is shown

Scenario: Login page is not shown if an user is logged
    Given Admin is logged in
    When I am on the login page
    Then an error is shown

Scenario: A user can enter to the login page
    Given I am on the main page
    When the user presses login key icon
    Then the user is on the login page

Scenario: The username of the logged in user is displayed
    Given Admin is logged in
    When I am on the main page
    Then correct username is shown