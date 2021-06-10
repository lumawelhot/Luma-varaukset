Feature: As a teacher I want to create a new visit

Scenario: Event page shows the correct event information
    Given I am on the front page
    And there is an event more than two weeks ahead
    When I click on the available event
    Then available event page has the correct title
    And available event page has the correct start date
    And available event page contains booking button

Scenario: Event can be booked when booking button is clicked
    Given I am on the front page
    And there is an event more than two weeks ahead
    When I click on the available event
    And I click the booking button
    Then booking form opens

Scenario: Event cannot be booked if it is less than two weeks ahead
    Given I am on the front page
    And there is an event less than two weeks ahead
    When I click on the unavailable event
    Then unavailable event page has the correct title
    And unavailable event page has the correct start date
    And unavailable event page contains correct info text

Scenario: An event is succesfully booked by a teacher with valid information
    Given teacher is on the booking page
    When valid information is entered
    Then a visit is succesfully created
    And booked event turns grey in calendar view

Scenario: An event is not booked by a teacher if client name is invalid
    Given teacher is on the booking page
    When invalid client name is entered
    Then no visit is created and an error message is shown