Feature: As a teacher I want to cancel my booking

Scenario: Event can be booked when booking button is clicked
    Given I am on the front page
    And there is an available event more than two weeks ahead
    When I have made a booking for that event
    Then I can cancel that booking
    And the event is available for booking
