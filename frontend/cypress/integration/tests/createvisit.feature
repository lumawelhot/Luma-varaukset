Feature: As a teacher I want to create a new visit

Scenario: Event page shows the correct event information
    Given I am on the front page
    And there is an event 1 more than two weeks ahead
    When I click on available event 1
    Then available event page has the correct title
    And available event page has the correct start date
    And available event page contains booking button

Scenario: Event can be booked when booking button is clicked
    Given I am on the front page
    And there is an event 1 more than two weeks ahead
    When I click on available event 1
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
    Given I am on the front page
    And there is an event 1 more than two weeks ahead
    When I click on available event 1
    And I click the booking button
    And valid information is entered
    Then booked event turns grey in calendar view

#Scenario: An event is not booked by a teacher if client name is invalid
#    Given I am on the front page
#    And there is an event 2 more than two weeks ahead
#    When I click on available event 2
#    And I click the booking button
#    When invalid client name is entered
#    Then an error message is shown