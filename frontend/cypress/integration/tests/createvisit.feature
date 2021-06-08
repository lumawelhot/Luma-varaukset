Feature: As a teacher I want to create a new visit

Scenario: Event page shows the correct event information
    Given I am on the front page
    When I click on an available event
    Then event page has the correct title
    And event page has the correct start date
    And event page contains booking button

Scenario: Event can be booked when booking button is clicked
    Given I am on an event page
    When I click the booking button
    Then booking form opens